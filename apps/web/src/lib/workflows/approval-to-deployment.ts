import prisma from "@/lib/prisma";
import { ProspectReviewStatus, SiteStatus, DomainStatus } from "@prisma/client";
import { addDomainToEnvironmentAction } from "@/server/actions/domain";

export async function handleProspectApproval(reviewId: string) {
  const review = await prisma.prospectReview.findUnique({
    where: { id: reviewId },
    include: {
      site: {
        include: {
          environments: {
            where: { type: "PRODUCTION" },
          },
          workspace: true,
        },
      },
    },
  });

  if (!review || review.status !== ProspectReviewStatus.APPROVED) {
    throw new Error("Invalid or unapproved review");
  }

  const productionEnv = review.site.environments[0];
  if (!productionEnv) {
    throw new Error("No production environment found");
  }

  if (review.requestedDomain) {
    try {
      await addDomainToEnvironmentAction(
        productionEnv.id,
        review.requestedDomain,
        { isPrimary: true },
        review.site.workspaceId
      );

      await prisma.site.update({
        where: { id: review.siteId },
        data: { status: SiteStatus.READY_FOR_TRANSFER },
      });

      return {
        success: true,
        nextStep: "domain_verification" as const,
        domain: review.requestedDomain,
        message: `Domain ${review.requestedDomain} has been added. DNS verification required.`,
      };
    } catch (error) {
      console.error("Failed to add domain:", error);
      throw new Error(
        `Failed to add domain: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  } else {
    await prisma.site.update({
      where: { id: review.siteId },
      data: { status: SiteStatus.LIVE },
    });

    return {
      success: true,
      nextStep: "deploy_to_vercel_subdomain" as const,
      message: "Site approved. Ready for deployment to Vercel subdomain.",
    };
  }
}

export async function handleDomainVerified(domainId: string) {
  const domain = await prisma.siteDomain.findUnique({
    where: { id: domainId },
    include: {
      environment: {
        include: {
          site: {
            include: {
              activeVersion: true,
            },
          },
        },
      },
    },
  });

  if (!domain || domain.status !== DomainStatus.ACTIVE) {
    throw new Error("Domain not found or not verified");
  }

  const site = domain.environment.site;

  if (site.status !== SiteStatus.LIVE) {
    await prisma.site.update({
      where: { id: site.id },
      data: { status: SiteStatus.LIVE },
    });
  }

  return {
    success: true,
    message: `Domain ${domain.domain} verified. Site is now live.`,
    siteId: site.id,
    domainId: domain.id,
  };
}

export async function checkPendingDomains() {
  const pendingDomains = await prisma.siteDomain.findMany({
    where: {
      status: {
        in: [DomainStatus.PENDING_VERIFICATION, DomainStatus.VERIFYING],
      },
      lastCheckedAt: {
        lt: new Date(Date.now() - 60 * 60 * 1000),
      },
    },
    include: {
      environment: {
        select: {
          vercelProjectId: true,
          site: {
            select: {
              id: true,
              workspaceId: true,
            },
          },
        },
      },
    },
  });

  const results = [];

  for (const domain of pendingDomains) {
    try {
      const { verifyDomainAction } = await import("@/server/actions/domain");

      const result = await verifyDomainAction(
        domain.id,
        domain.environment.site.workspaceId
      );

      results.push({
        domainId: domain.id,
        domain: domain.domain,
        verified: result.verified,
        status: result.status,
      });

      if (result.verified) {
        await handleDomainVerified(domain.id);
      }
    } catch (error) {
      console.error(`Failed to verify domain ${domain.domain}:`, error);
      results.push({
        domainId: domain.id,
        domain: domain.domain,
        verified: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return {
    checked: results.length,
    verified: results.filter((r) => r.verified).length,
    failed: results.filter((r) => !r.verified).length,
    results,
  };
}

export async function notifyProspectResponse(reviewId: string) {
  const review = await prisma.prospectReview.findUnique({
    where: { id: reviewId },
    include: {
      site: {
        select: {
          name: true,
          workspace: {
            select: {
              name: true,
            },
          },
        },
      },
      createdBy: {
        select: {
          email: true,
          name: true,
        },
      },
    },
  });

  if (!review) {
    throw new Error("Review not found");
  }

  console.log("Prospect response notification:", {
    reviewId: review.id,
    siteName: review.site.name,
    prospectEmail: review.prospectEmail,
    status: review.status,
    creatorEmail: review.createdBy?.email,
    requestedDomain: review.requestedDomain,
    feedback: review.feedback,
  });

  return {
    success: true,
    message: "Notification logged (email integration pending)",
  };
}
