import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { setReferralForCurrentUser } from "./affiliate";
import { sendWelcomeEmail } from "./email";

export interface OnboardingData {
  role?: string;
  useCase?: string;
  discoverySource?: string;
  workspaceName: string;
  firstName?: string;
  businessName?: string;
  businessPhone?: string;
}

async function getSession() {
  const requestHeaders = getRequestHeaders();
  if (!requestHeaders) throw new Error("No request context");
  return auth.api.getSession({ headers: requestHeaders });
}

export const completeOnboarding = createServerFn({ method: "POST" })
  .validator((data: OnboardingData) => data)
  .handler(async ({ data }) => {
    try {
      const session = await getSession();
      if (!session?.user?.id) throw new Error("Unauthorized");

      const workspaceSlug = data.workspaceName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-");

      const existingWorkspace = await prisma.workspace.findUnique({
        where: { slug: workspaceSlug },
      });

      if (existingWorkspace) {
        throw new Error("Workspace name already exists. Please choose another.");
      }

      const result = await prisma.$transaction(async (tx) => {
        const workspace = await tx.workspace.create({
          data: {
            name: data.workspaceName,
            slug: workspaceSlug,
            businessName: data.businessName || data.workspaceName,
            businessEmail: session.user.email,
            businessPhone: data.businessPhone || null,
            members: {
              create: {
                userId: session.user.id,
                role: "OWNER",
              },
            },
          },
        });

        const user = await tx.user.update({
          where: { id: session.user.id },
          data: {
            onboardingCompleted: true,
            ...(data.firstName && { name: data.firstName }),
            onboardingData: {
              ...(data.role && { role: data.role }),
              ...(data.useCase && { useCase: data.useCase }),
              ...(data.discoverySource && { discoverySource: data.discoverySource }),
              completedAt: new Date().toISOString(),
            },
            defaultWorkspaceId: workspace.id,
          },
        });

        return { workspace, user };
      });

      await setReferralForCurrentUser().catch((error) => {
        console.error("Failed to record referral during onboarding:", error);
      });

      sendWelcomeEmail(session.user.id).catch((error) => {
        console.error("Failed to send welcome email:", error);
      });

      return { success: true, workspace: result.workspace };
    } catch (error) {
      console.error("Error completing onboarding:", error);
      throw error;
    }
  });

export const updateOnboardingData = createServerFn({ method: "POST" })
  .validator((data: Partial<OnboardingData>) => data)
  .handler(async ({ data }) => {
    try {
      const session = await getSession();
      if (!session?.user?.id) throw new Error("Unauthorized");

      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { onboardingData: true },
      });

      const currentData = (user?.onboardingData
        ? (user.onboardingData as unknown as OnboardingData)
        : {}) as OnboardingData;

      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          onboardingData: { ...currentData, ...data },
        },
      });

      return { success: true };
    } catch (error) {
      console.error("Error updating onboarding data:", error);
      throw error;
    }
  });
