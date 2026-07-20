import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { redirect } from "@tanstack/react-router";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

async function getSession() {
  const requestHeaders = getRequestHeaders();
  if (!requestHeaders) throw new Error("No request context");
  return auth.api.getSession({ headers: requestHeaders });
}

async function assertAuthenticated() {
  const session = await getSession();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session;
}

export const switchWorkspaceAction = createServerFn({ method: "POST" })
  .validator((workspaceId: string) => workspaceId)
  .handler(async ({ data: workspaceId }) => {
    try {
      await assertAuthenticated();
      const result = await switchWorkspaceInner(workspaceId);
      throw redirect({ to: "/dashboard" });
    } catch (error) {
      console.error("Error switching workspace:", error);
      throw error;
    }
  });

export const getUserWorkspaces = createServerFn()
  .handler(async () => {
    try {
      const session = await getSession();
      if (!session?.user?.id) return [];

      const workspaces = await prisma.workspaceMember.findMany({
        where: { userId: session.user.id },
        include: { workspace: true },
        orderBy: { workspace: { createdAt: "desc" } },
      });

      return workspaces.map((member) => ({
        ...member.workspace,
        role: member.role,
        joinedAt: member.joinedAt,
      }));
    } catch (error) {
      console.error("Error fetching user workspaces:", error);
      return [];
    }
  });

export const getCurrentWorkspace = createServerFn()
  .handler(async () => {
    try {
      const session = await getSession();
      if (!session?.user?.id) return null;

      const activeSession = await prisma.session.findFirst({
        where: { userId: session.user.id, activeWorkspaceId: { not: null } },
        include: { activeWorkspace: true },
        orderBy: { createdAt: "desc" },
      });

      if (activeSession?.activeWorkspace) return activeSession.activeWorkspace;

      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { defaultWorkspace: true },
      });

      if (user?.defaultWorkspace) return user.defaultWorkspace;

      const firstWorkspace = await prisma.workspaceMember.findFirst({
        where: { userId: session.user.id },
        include: { workspace: true },
        orderBy: { joinedAt: "asc" },
      });

      return firstWorkspace?.workspace || null;
    } catch (error) {
      console.error("Error fetching current workspace:", error);
      return null;
    }
  });

export const createWorkspace = createServerFn({ method: "POST" })
  .validator((input: { name: string; slug?: string }) => input)
  .handler(async ({ data: { name, slug } }) => {
    try {
      const session = await assertAuthenticated();
      const workspaceSlug = slug || name.toLowerCase().replace(/[^a-z0-9]/g, "-");

      const existingWorkspace = await prisma.workspace.findUnique({
        where: { slug: workspaceSlug },
      });

      if (existingWorkspace) {
        throw new Error("Workspace slug already exists");
      }

      const workspace = await prisma.workspace.create({
        data: {
          name,
          slug: workspaceSlug,
          members: {
            create: {
              userId: session.user.id,
              role: "OWNER",
            },
          },
        },
      });

      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
      });

      if (!user?.defaultWorkspaceId) {
        await prisma.user.update({
          where: { id: session.user.id },
          data: { defaultWorkspaceId: workspace.id },
        });
      }

      return workspace;
    } catch (error) {
      console.error("Error creating workspace:", error);
      throw error;
    }
  });

export const switchWorkspace = createServerFn({ method: "POST" })
  .validator((workspaceId: string) => workspaceId)
  .handler(async ({ data: workspaceId }) => {
    return switchWorkspaceInner(workspaceId);
  });

async function switchWorkspaceInner(workspaceId: string) {
  const session = await assertAuthenticated();

  const membership = await prisma.workspaceMember.findUnique({
    where: {
      userId_workspaceId: {
        userId: session.user.id,
        workspaceId,
      },
    },
  });

  if (!membership) throw new Error("Not a member of this workspace");

  await prisma.session.updateMany({
    where: { userId: session.user.id },
    data: { activeWorkspaceId: workspaceId },
  });

  return { success: true };
}
