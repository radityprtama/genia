import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { DomainStatus } from "@prisma/client";
import {
  addDomainToProject,
  checkDomainVerification,
  getDomainVerificationRecords,
  removeDomain,
  verifyDomain,
} from "@/lib/vercel/domain-service";
import {
  canSendEmail,
  sendEmail,
  DomainVerificationInstructionsEmail,
  DomainVerificationFailedEmail,
} from "@/lib/email";

type WorkspaceContext = {
  userId: string;
  workspaceId: string;
};

async function resolveWorkspaceContext(
  workspaceId?: string,
): Promise<WorkspaceContext> {
  const requestHeaders = getRequestHeaders();
  if (!requestHeaders) throw new Error("No request context");

  const session = await auth.api.getSession({ headers: requestHeaders });

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  let targetWorkspaceId = workspaceId ?? null;

  if (!targetWorkspaceId) {
    const activeSession = await prisma.session.findFirst({
      where: {
        userId: session.user.id,
        activeWorkspaceId: { not: null },
      },
      select: { activeWorkspaceId: true },
      orderBy: { createdAt: "desc" },
    });
    targetWorkspaceId = activeSession?.activeWorkspaceId ?? null;
  }

  if (!targetWorkspaceId) {
    const membership = await prisma.workspaceMember.findFirst({
      where: { userId: session.user.id },
      select: { workspaceId: true },
      orderBy: { joinedAt: "asc" },
    });
    targetWorkspaceId = membership?.workspaceId ?? null;
  }

  if (!targetWorkspaceId) throw new Error("Workspace not found");

  const membership = await prisma.workspaceMember.findUnique({
    where: {
      userId_workspaceId: {
        userId: session.user.id,
        workspaceId: targetWorkspaceId,
      },
    },
  });

  if (!membership) throw new Error("Not a member of this workspace");

  return { userId: session.user.id, workspaceId: targetWorkspaceId };
}

async function assertDomainOwnership(domainId: string, workspaceId: string) {
  const domain = await prisma.siteDomain.findFirst({
    where: {
      id: domainId,
      environment: { site: { workspaceId } },
    },
    include: {
      environment: {
        select: {
          siteId: true,
          vercelProjectId: true,
          name: true,
          site: {
            select: {
              id: true,
              name: true,
              workspace: {
                select: { name: true, businessName: true, businessEmail: true },
              },
            },
          },
        },
      },
    },
  });

  if (!domain) throw new Error("Domain not found");
  return domain;
}

function getVercelCredentials() {
  const token = process.env.VERCEL_TOKEN;
  const teamId = process.env.VERCEL_TEAM_ID;
  if (!token) throw new Error("VERCEL_TOKEN not configured");
  return { token, teamId };
}

export const addDomainToEnvironmentAction = createServerFn({ method: "POST" })
  .validator((input: { environmentId: string; domainName: string; options?: { isPrimary?: boolean; gitBranch?: string }; workspaceId?: string }) => input)
  .handler(async ({ data: { environmentId, domainName, options, workspaceId } }) => {
    const { userId, workspaceId: scopedWorkspaceId } =
      await resolveWorkspaceContext(workspaceId);

    const environment = await prisma.siteEnvironment.findFirst({
      where: { id: environmentId, site: { workspaceId: scopedWorkspaceId } },
      include: {
        site: {
          include: {
            workspace: { select: { name: true, businessName: true, businessEmail: true } },
          },
        },
      },
    });

    if (!environment) throw new Error("Environment not found");

    const actingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    });

    const cleanDomain = domainName.trim().toLowerCase();
    if (!cleanDomain || !/^[a-z0-9][a-z0-9-]*(\.[a-z0-9-]+)+$/.test(cleanDomain)) {
      throw new Error("Invalid domain format");
    }

    try {
      const credentials = getVercelCredentials();
      const vercelProjectId =
        environment.vercelProjectId ?? process.env.VERCEL_PROJECT_ID;

      if (!vercelProjectId) {
        throw new Error(
          "No Vercel project configured for this environment. Please set up Vercel project first.",
        );
      }

      const vercelDomain = await addDomainToProject(
        vercelProjectId,
        { name: cleanDomain, gitBranch: options?.gitBranch },
        credentials,
      );

      const verificationResult = await getDomainVerificationRecords(
        vercelProjectId,
        cleanDomain,
        credentials,
      );

      const result = await prisma.$transaction(async (tx) => {
        if (options?.isPrimary) {
          await tx.siteDomain.updateMany({
            where: { environmentId: environment.id, isPrimary: true },
            data: { isPrimary: false },
          });
        }

        return tx.siteDomain.create({
          data: {
            environmentId: environment.id,
            domain: cleanDomain,
            isPrimary: options?.isPrimary ?? false,
            status: vercelDomain.verified
              ? DomainStatus.ACTIVE
              : DomainStatus.PENDING_VERIFICATION,
            vercelDomainId: vercelDomain.name,
            verificationMethod: vercelDomain.verification?.[0]?.type,
            dnsRecords: verificationResult.dnsRecords as never,
            verificationRecords: verificationResult.verificationRecords as never,
            verifiedAt: vercelDomain.verified ? new Date() : null,
            addedById: userId,
          },
        });
      });

      const workspaceEmail = environment.site.workspace?.businessEmail?.trim();
      const actingEmail = actingUser?.email?.trim();
      const recipients = Array.from(
        new Set(
          [workspaceEmail, actingEmail].filter((email): email is string => Boolean(email)),
        ),
      );

      if (!vercelDomain.verified && canSendEmail() && recipients.length > 0) {
        const appBaseUrl = (
          process.env.NEXT_PUBLIC_APP_URL || "https://genia.tech"
        ).replace(/\/$/, "");
        const verifyUrl = `${appBaseUrl}/dashboard/projects/${environment.siteId}`;

        recipients.forEach((recipientEmail) => {
          sendEmail({
            to: recipientEmail,
            subject: `Connect your domain: ${cleanDomain}`,
            react: DomainVerificationInstructionsEmail({
              domain: cleanDomain,
              projectName: environment.site.name,
              verificationRecords: verificationResult.verificationRecords,
              routingRecords: verificationResult.dnsRecords,
              verifyUrl,
            }),
          }).catch((error) =>
            console.error("Failed to send domain verification instructions:", error),
          );
        });
      }

      return {
        domain: result,
        verificationNeeded: !vercelDomain.verified,
        dnsRecords: verificationResult.dnsRecords,
        verificationRecords: verificationResult.verificationRecords,
      };
    } catch (error) {
      console.error("Failed to add domain:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to add domain to Vercel",
      );
    }
  });

export const verifyDomainAction = createServerFn({ method: "POST" })
  .validator((input: { domainId: string; workspaceId?: string }) => input)
  .handler(async ({ data: { domainId, workspaceId } }) => {
    const { workspaceId: scopedWorkspaceId } =
      await resolveWorkspaceContext(workspaceId);

    const domain = await assertDomainOwnership(domainId, scopedWorkspaceId);

    if (!domain.environment.vercelProjectId) {
      throw new Error("No Vercel project configured");
    }

    try {
      const credentials = getVercelCredentials();

      await verifyDomain(
        domain.environment.vercelProjectId,
        domain.domain,
        credentials,
      );

      const verificationStatus = await checkDomainVerification(
        domain.environment.vercelProjectId,
        domain.domain,
        credentials,
      );

      const updated = await prisma.siteDomain.update({
        where: { id: domainId },
        data: {
          status: verificationStatus.verified
            ? DomainStatus.ACTIVE
            : verificationStatus.misconfigured
              ? DomainStatus.FAILED
              : DomainStatus.VERIFYING,
          verifiedAt: verificationStatus.verified ? new Date() : null,
          failedAt:
            verificationStatus.misconfigured ||
            (!verificationStatus.verified &&
              domain.status === DomainStatus.VERIFYING)
              ? new Date()
              : null,
          errorMessage: verificationStatus.error,
          lastCheckedAt: new Date(),
        },
      });

      if (updated.status === DomainStatus.FAILED && canSendEmail()) {
        const workspaceEmail =
          domain.environment.site.workspace?.businessEmail?.trim();
        if (workspaceEmail) {
          const appBaseUrl = (
            process.env.NEXT_PUBLIC_APP_URL || "https://genia.tech"
          ).replace(/\/$/, "");
          const dnsRecordsUrl = `${appBaseUrl}/dashboard/projects/${domain.environment.siteId}`;
          const lastCheckedAt =
            updated.lastCheckedAt?.toLocaleString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            }) ?? new Date().toLocaleString();

          sendEmail({
            to: workspaceEmail,
            subject: `Action needed: Fix DNS for ${domain.domain}`,
            react: DomainVerificationFailedEmail({
              domain: domain.domain,
              projectName: domain.environment.site.name,
              errorMessage: verificationStatus.error,
              lastCheckedAt,
              dnsRecordsUrl,
              supportEmail: workspaceEmail,
            }),
          }).catch((error) =>
            console.error("Failed to send domain verification failure email:", error),
          );
        }
      }

      return {
        verified: verificationStatus.verified,
        status: updated.status,
        error: verificationStatus.error,
      };
    } catch (error) {
      await prisma.siteDomain.update({
        where: { id: domainId },
        data: {
          status: DomainStatus.FAILED,
          failedAt: new Date(),
          errorMessage: error instanceof Error ? error.message : "Verification failed",
          lastCheckedAt: new Date(),
        },
      });

      if (canSendEmail()) {
        const workspaceEmail =
          domain.environment.site.workspace?.businessEmail?.trim();
        if (workspaceEmail) {
          const appBaseUrl = (
            process.env.NEXT_PUBLIC_APP_URL || "https://genia.tech"
          ).replace(/\/$/, "");
          const dnsRecordsUrl = `${appBaseUrl}/dashboard/projects/${domain.environment.siteId}`;
          const lastCheckedAt = new Date().toLocaleString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          });

          sendEmail({
            to: workspaceEmail,
            subject: `Action needed: Fix DNS for ${domain.domain}`,
            react: DomainVerificationFailedEmail({
              domain: domain.domain,
              projectName: domain.environment.site.name,
              errorMessage: error instanceof Error ? error.message : "Verification failed",
              lastCheckedAt,
              dnsRecordsUrl,
              supportEmail: workspaceEmail,
            }),
          }).catch((sendError) =>
            console.error("Failed to send domain verification failure email (catch):", sendError),
          );
        }
      }

      throw new Error(
        error instanceof Error ? error.message : "Domain verification failed",
      );
    }
  });

export const refreshDomainStatusAction = createServerFn({ method: "POST" })
  .validator((input: { domainId: string; workspaceId?: string }) => input)
  .handler(async ({ data: { domainId, workspaceId } }) => {
    const { workspaceId: scopedWorkspaceId } =
      await resolveWorkspaceContext(workspaceId);

    const domain = await assertDomainOwnership(domainId, scopedWorkspaceId);

    if (!domain.environment.vercelProjectId) {
      throw new Error("No Vercel project configured");
    }

    try {
      const credentials = getVercelCredentials();

      const verificationResult = await getDomainVerificationRecords(
        domain.environment.vercelProjectId,
        domain.domain,
        credentials,
      );

      await prisma.siteDomain.update({
        where: { id: domainId },
        data: {
          status: verificationResult.verified
            ? DomainStatus.ACTIVE
            : DomainStatus.PENDING_VERIFICATION,
          dnsRecords: verificationResult.dnsRecords as never,
          verificationRecords: verificationResult.verificationRecords as never,
          verifiedAt: verificationResult.verified ? new Date() : null,
          lastCheckedAt: new Date(),
          errorMessage: verificationResult.error,
        },
      });

      return {
        verified: verificationResult.verified,
        dnsRecords: verificationResult.dnsRecords,
        verificationRecords: verificationResult.verificationRecords,
        error: verificationResult.error,
      };
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Failed to refresh domain status",
      );
    }
  });

export const removeDomainAction = createServerFn({ method: "POST" })
  .validator((input: { domainId: string; workspaceId?: string }) => input)
  .handler(async ({ data: { domainId, workspaceId } }) => {
    const { workspaceId: scopedWorkspaceId } =
      await resolveWorkspaceContext(workspaceId);

    const domain = await assertDomainOwnership(domainId, scopedWorkspaceId);

    try {
      if (domain.environment.vercelProjectId) {
        const credentials = getVercelCredentials();
        await removeDomain(
          domain.environment.vercelProjectId,
          domain.domain,
          credentials,
        );
      }

      await prisma.siteDomain.delete({ where: { id: domainId } });

      return { success: true };
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Failed to remove domain",
      );
    }
  });

export const getDomainDnsRecordsAction = createServerFn()
  .validator((input: { domainId: string; workspaceId?: string }) => input)
  .handler(async ({ data: { domainId, workspaceId } }) => {
    const { workspaceId: scopedWorkspaceId } =
      await resolveWorkspaceContext(workspaceId);

    const domain = await assertDomainOwnership(domainId, scopedWorkspaceId);

    return {
      domain: domain.domain,
      status: domain.status,
      dnsRecords: domain.dnsRecords,
      verificationRecords: domain.verificationRecords,
      verified: domain.status === DomainStatus.ACTIVE,
    };
  });
