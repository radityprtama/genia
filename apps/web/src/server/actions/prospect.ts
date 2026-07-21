import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ProspectReviewStatus, SiteStatus } from "@prisma/client";
import {
  canSendEmail,
  sendEmail,
  ProspectReviewInviteEmail,
  ProspectApprovedNotificationEmail,
  ProspectDeclinedNotificationEmail,
  ProspectDetailsReceivedEmail,
  SiteLiveAnnouncementEmail,
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
  if (!session?.user?.id) throw new Error("Unauthorized");

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

export const createProspectReviewAction = createServerFn({ method: "POST" })
  .validator((input: {
    siteId: string;
    prospectEmail: string;
    prospectName?: string;
    prospectPhone?: string;
    message?: string;
    expiresInDays?: number;
    workspaceId?: string;
  }) => input)
  .handler(async ({ data: input }) => {
    const { userId, workspaceId: scopedWorkspaceId } =
      await resolveWorkspaceContext(input.workspaceId);

    const site = await prisma.site.findFirst({
      where: { id: input.siteId, workspaceId: scopedWorkspaceId },
      select: {
        id: true, name: true, status: true,
        workspace: { select: { name: true, businessName: true, businessEmail: true } },
      },
    });

    if (!site) throw new Error("Site not found");

    const email = input.prospectEmail.trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("Invalid email address");
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (input.expiresInDays ?? 14));

    const contactPhone = input.prospectPhone?.trim() || null;
    const review = await prisma.prospectReview.create({
      data: {
        siteId: input.siteId,
        prospectEmail: email,
        prospectName: input.prospectName?.trim() || null,
        contactPhone,
        message: input.message?.trim() || null,
        expiresAt,
        createdById: userId,
      },
    });

    if (site.status === SiteStatus.DRAFT) {
      await prisma.site.update({
        where: { id: input.siteId },
        data: { status: SiteStatus.REVIEW },
      });
    }

    const appBaseUrl = (
      process.env.VITE_APP_URL || "https://genia.tech"
    ).replace(/\/$/, "");
    const shareUrl = `${appBaseUrl}/preview/${review.shareToken}`;
    const workspaceDisplayName =
      site.workspace?.businessName?.trim() ||
      site.workspace?.name?.trim() ||
      "Genia";
    const supportEmail = site.workspace?.businessEmail?.trim() || undefined;
    const formattedExpiresAt = expiresAt.toLocaleDateString(undefined, {
      year: "numeric", month: "long", day: "numeric",
    });

    if (canSendEmail()) {
      sendEmail({
        to: email,
        subject: `Preview ready: ${site.name}`,
        react: ProspectReviewInviteEmail({
          prospectName: input.prospectName,
          siteName: site.name,
          shareUrl,
          expiresAt: formattedExpiresAt,
          message: input.message,
          workspaceName: workspaceDisplayName,
          supportEmail,
        }),
      }).catch((error) =>
        console.error("Failed to send prospect review invite email:", error),
      );
    }

    return { reviewId: review.id, shareToken: review.shareToken, shareUrl };
  });

export const getProspectReviewByTokenAction = createServerFn()
  .validator((token: string) => token)
  .handler(async ({ data: token }) => {
    const review = await prisma.prospectReview.findUnique({
      where: { shareToken: token },
      include: {
        site: {
          include: {
            activeVersion: true,
            workspace: {
              select: {
                id: true, name: true, businessName: true, businessEmail: true, businessPhone: true,
              },
            },
            environments: {
              where: { type: "PREVIEW" },
              include: {
                deployments: {
                  where: { status: "READY" },
                  orderBy: { requestedAt: "desc" },
                  take: 1,
                },
              },
            },
          },
        },
      },
    });

    if (!review) throw new Error("Review not found");

    if (review.expiresAt && review.expiresAt < new Date()) {
      if (review.status === ProspectReviewStatus.PENDING) {
        await prisma.prospectReview.update({
          where: { id: review.id },
          data: { status: ProspectReviewStatus.EXPIRED },
        });
      }
      throw new Error("This review link has expired");
    }

    if (!review.viewedAt && review.status === ProspectReviewStatus.PENDING) {
      await prisma.prospectReview.update({
        where: { id: review.id },
        data: { viewedAt: new Date(), status: ProspectReviewStatus.VIEWED },
      });
    }

    return review;
  });

export const respondToProspectReviewAction = createServerFn({ method: "POST" })
  .validator((input: { token: string; action: "approve" | "decline"; feedback?: string }) => input)
  .handler(async ({ data: input }) => {
    const review = await prisma.prospectReview.findUnique({
      where: { shareToken: input.token },
      include: {
        site: {
          include: {
            workspace: {
              select: { id: true, name: true, businessName: true, businessEmail: true },
            },
          },
        },
        createdBy: { select: { email: true, name: true } },
      },
    });

    if (!review) throw new Error("Review not found");
    if (review.expiresAt && review.expiresAt < new Date()) {
      throw new Error("This review link has expired");
    }
    if (
      review.status === ProspectReviewStatus.DETAILS_SUBMITTED ||
      review.status === ProspectReviewStatus.DEPLOYING ||
      review.status === ProspectReviewStatus.LIVE ||
      review.status === ProspectReviewStatus.DECLINED
    ) {
      throw new Error("You have already responded to this review");
    }

    const now = new Date();
    const appBaseUrl = (
      process.env.VITE_APP_URL || "https://genia.tech"
    ).replace(/\/$/, "");
    const shareUrl = `${appBaseUrl}/preview/${review.shareToken}`;
    const dashboardUrl = `${appBaseUrl}/dashboard/projects/${review.siteId}`;
    const recipients = Array.from(
      new Set(
        [
          review.site.workspace?.businessEmail?.trim(),
          review.createdBy?.email?.trim(),
        ].filter((email): email is string => Boolean(email)),
      ),
    );

    if (input.action === "approve") {
      await prisma.prospectReview.update({
        where: { id: review.id },
        data: {
          status: ProspectReviewStatus.APPROVED,
          approvedAt: now,
          feedback: input.feedback?.trim() || null,
        },
      });

      if (canSendEmail() && recipients.length > 0) {
        const detailsUrl = `${shareUrl}?step=details`;
        recipients.forEach((recipientEmail) => {
          sendEmail({
            to: recipientEmail,
            subject: `Prospect approved ${review.site.name}`,
            react: ProspectApprovedNotificationEmail({
              siteName: review.site.name,
              prospectName: review.prospectName,
              prospectEmail: review.prospectEmail,
              approvedAt: now.toLocaleString(undefined, {
                year: "numeric", month: "long", day: "numeric", hour: "numeric", minute: "2-digit",
              }),
              feedback: input.feedback,
              detailsUrl,
              dashboardUrl,
            }),
          }).catch((error) =>
            console.error("Failed to send prospect approved notification:", error),
          );
        });
      }

      return {
        success: true,
        action: "approved" as const,
        nextStep: "collect_details",
        message: "Please provide additional details to proceed.",
      };
    } else {
      await prisma.prospectReview.update({
        where: { id: review.id },
        data: {
          status: ProspectReviewStatus.DECLINED,
          declinedAt: now,
          feedback: input.feedback?.trim() || null,
        },
      });

      if (canSendEmail() && recipients.length > 0) {
        recipients.forEach((recipientEmail) => {
          sendEmail({
            to: recipientEmail,
            subject: `Prospect requested changes: ${review.site.name}`,
            react: ProspectDeclinedNotificationEmail({
              siteName: review.site.name,
              prospectName: review.prospectName,
              prospectEmail: review.prospectEmail,
              declinedAt: now.toLocaleString(undefined, {
                year: "numeric", month: "long", day: "numeric", hour: "numeric", minute: "2-digit",
              }),
              feedback: input.feedback,
              dashboardUrl,
            }),
          }).catch((error) =>
            console.error("Failed to send prospect declined notification:", error),
          );
        });
      }

      return { success: true, action: "declined" as const };
    }
  });

export const listSiteProspectReviewsAction = createServerFn()
  .validator((input: { siteId: string; workspaceId?: string }) => input)
  .handler(async ({ data: { siteId, workspaceId } }) => {
    const { workspaceId: scopedWorkspaceId } =
      await resolveWorkspaceContext(workspaceId);

    const site = await prisma.site.findFirst({
      where: { id: siteId, workspaceId: scopedWorkspaceId },
      select: { id: true },
    });

    if (!site) throw new Error("Site not found");

    return prisma.prospectReview.findMany({
      where: { siteId },
      orderBy: { createdAt: "desc" },
      include: {
        createdBy: { select: { name: true, email: true } },
      },
    });
  });

export const resendProspectReviewAction = createServerFn({ method: "POST" })
  .validator((input: { reviewId: string; workspaceId?: string }) => input)
  .handler(async ({ data: { reviewId, workspaceId } }) => {
    const { workspaceId: scopedWorkspaceId } =
      await resolveWorkspaceContext(workspaceId);

    const review = await prisma.prospectReview.findFirst({
      where: { id: reviewId, site: { workspaceId: scopedWorkspaceId } },
      include: {
        site: {
          select: {
            name: true,
            workspace: { select: { name: true, businessName: true, businessEmail: true } },
          },
        },
      },
    });

    if (!review) throw new Error("Review not found");
    if (
      review.status === ProspectReviewStatus.APPROVED ||
      review.status === ProspectReviewStatus.DECLINED
    ) {
      throw new Error("Cannot resend a completed review");
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 14);

    const updatedReview = await prisma.prospectReview.update({
      where: { id: reviewId },
      data: { expiresAt, status: ProspectReviewStatus.PENDING },
      select: {
        id: true, prospectEmail: true, prospectName: true, message: true,
        shareToken: true, expiresAt: true,
      },
    });

    const appBaseUrl = (
      process.env.VITE_APP_URL || "https://genia.tech"
    ).replace(/\/$/, "");
    const shareUrl = `${appBaseUrl}/preview/${updatedReview.shareToken}`;
    const workspaceDisplayName =
      review.site.workspace?.businessName?.trim() ||
      review.site.workspace?.name?.trim() ||
      "Genia";
    const supportEmail = review.site.workspace?.businessEmail?.trim() || undefined;
    const formattedExpiresAt = updatedReview.expiresAt.toLocaleDateString(undefined, {
      year: "numeric", month: "long", day: "numeric",
    });

    if (canSendEmail()) {
      sendEmail({
        to: updatedReview.prospectEmail,
        subject: `Fresh preview: ${review.site.name}`,
        react: ProspectReviewInviteEmail({
          prospectName: updatedReview.prospectName,
          siteName: review.site.name,
          shareUrl,
          expiresAt: formattedExpiresAt,
          message: updatedReview.message ?? undefined,
          workspaceName: workspaceDisplayName,
          supportEmail,
        }),
      }).catch((error) =>
        console.error("Failed to resend prospect review invite email:", error),
      );
    }

    return { success: true, shareUrl };
  });

export const cancelProspectReviewAction = createServerFn({ method: "POST" })
  .validator((input: { reviewId: string; workspaceId?: string }) => input)
  .handler(async ({ data: { reviewId, workspaceId } }) => {
    const { workspaceId: scopedWorkspaceId } =
      await resolveWorkspaceContext(workspaceId);

    const review = await prisma.prospectReview.findFirst({
      where: { id: reviewId, site: { workspaceId: scopedWorkspaceId } },
    });

    if (!review) throw new Error("Review not found");

    await prisma.prospectReview.delete({ where: { id: reviewId } });

    return { success: true };
  });
