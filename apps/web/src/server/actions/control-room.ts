import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { Prisma, Role } from "@prisma/client";
import { z } from "zod";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

async function requireOperator() {
  const requestHeaders = getRequestHeaders();
  if (!requestHeaders) throw new Error("No request context");

  const session = await auth.api.getSession({ headers: requestHeaders });
  if (!session?.user?.id) throw new Error("Unauthorized");

  const operator = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, agent: true, superAdmin: true },
  });

  if (!operator || (!operator.agent && !operator.superAdmin)) {
    throw new Error("Forbidden");
  }

  return operator;
}

export const getControlRoomSidebarMetrics = createServerFn()
  .handler(async () => {
    await requireOperator();

    const now = new Date();
    const [pendingWorkspaceInvites, delinquentSubscriptions, pendingAffiliatePayouts] =
      await Promise.all([
        prisma.workspaceInvitation.count({
          where: { acceptedAt: null, expiresAt: { gt: now } },
        }),
        prisma.subscription.count({
          where: { status: { in: ["past_due", "incomplete", "unpaid"] } },
        }),
        prisma.referral.count({
          where: { status: "CONVERTED", commissionPaidAt: null },
        }),
      ]);

    return { pendingWorkspaceInvites, delinquentSubscriptions, pendingAffiliatePayouts };
  });

export const getControlRoomOverview = createServerFn()
  .handler(async () => {
    await requireOperator();

    const now = new Date();
    const thirtyDaysOut = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 30);

    const [
      workspacesTotal,
      membersTotal,
      activeSubscriptions,
      pendingAffiliatesCount,
      sitesAwaitingReview,
      recentWorkspaces,
      upcomingRenewals,
      pendingAffiliates,
      workspaceInvitesPending,
      delinquentSubscriptions,
      upcomingRenewalsCount,
    ] = await Promise.all([
      prisma.workspace.count(),
      prisma.workspaceMember.count(),
      prisma.subscription.count({ where: { status: { in: ["active", "trialing"] } } }),
      prisma.affiliate.count({ where: { status: "PENDING" } }),
      prisma.site.count({ where: { status: { in: ["REVIEW", "READY_FOR_TRANSFER"] } } }),
      prisma.workspace.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true, name: true, slug: true, createdAt: true,
          _count: { select: { members: true, sites: true } },
        },
      }),
      prisma.subscription.findMany({
        take: 5,
        where: { periodEnd: { not: null, gte: now, lte: thirtyDaysOut } },
        orderBy: { periodEnd: "asc" },
        select: { id: true, plan: true, status: true, periodEnd: true, seats: true },
      }),
      prisma.affiliate.findMany({
        take: 5,
        where: { status: "PENDING" },
        orderBy: { createdAt: "asc" },
        select: {
          id: true, referralCode: true, createdAt: true,
          user: { select: { email: true, name: true } },
        },
      }),
      prisma.workspaceInvitation.count({
        where: { acceptedAt: null, expiresAt: { gt: now } },
      }),
      prisma.subscription.count({ where: { status: { in: ["past_due", "incomplete", "unpaid"] } } }),
      prisma.subscription.count({
        where: { periodEnd: { not: null, gte: now, lte: thirtyDaysOut } },
      }),
    ]);

    return {
      totals: { workspaces: workspacesTotal, members: membersTotal, activeSubscriptions, pendingAffiliates: pendingAffiliatesCount, sitesAwaitingReview },
      upcomingRenewalsCount, workspaceInvitesPending, delinquentSubscriptions,
      recentWorkspaces, upcomingRenewals, pendingAffiliates,
    };
  });

const workspaceFilterSchema = z.object({
  query: z.string().trim().optional(),
  status: z.enum(["all", "active", "archived"]).optional(),
}).optional().default({});

const workspacePayloadSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(120),
  slug: z.string().min(2).max(120).regex(/^[a-z0-9-]+$/, "Slug can only include lowercase letters, numbers, and dashes").optional().or(z.literal("")),
  businessName: z.string().max(160).optional().or(z.literal("")),
  businessEmail: z.string().email("Enter a valid email").optional().or(z.literal("")),
  businessPhone: z.string().max(64).optional().or(z.literal("")),
});

const workspaceMemberInputSchema = z.object({
  workspaceId: z.string().min(1),
  email: z.string().email("Enter a valid email address"),
  role: z.nativeEnum(Role).default("MEMBER"),
});

const workspaceMemberRoleSchema = z.object({
  memberId: z.string().min(1),
  role: z.nativeEnum(Role),
});

const inviteIdSchema = z.object({ inviteId: z.string().min(1) });
const workspaceIdSchema = z.object({ workspaceId: z.string().min(1) });
const userFilterSchema = z.object({ query: z.string().trim().optional() }).optional().default({});

const userRoleUpdateSchema = z.object({
  userId: z.string().min(1, "User id required"),
  agent: z.boolean().optional(),
  superAdmin: z.boolean().optional(),
});

const userPromotionSchema = z.object({
  email: z.string().email("Enter a valid email"),
  agent: z.boolean().default(true),
  superAdmin: z.boolean().default(false),
});

const platformSettingPayloadSchema = z.object({
  key: z.string().min(2).max(120).regex(/^[a-z0-9_.-]+$/),
  value: z.union([z.string(), z.record(z.any()), z.array(z.any()), z.number(), z.boolean()]),
  description: z.string().max(240).optional().or(z.literal("")),
});

const platformSettingUpdateSchema = platformSettingPayloadSchema.partial({ key: true }).extend({ id: z.string().min(1) });

function slugifyWorkspace(input: string) {
  return input.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
}

async function resolveWorkspaceSlug(baseSlug: string, excludeId?: string) {
  let slug = slugifyWorkspace(baseSlug) || "workspace";
  let counter = 1;

  while (true) {
    const existing = await prisma.workspace.findFirst({
      where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) },
      select: { id: true },
    });

    if (!existing) return slug;

    counter += 1;
    slug = `${slugifyWorkspace(baseSlug)}-${counter}`;
  }
}

function normalizeOptionalString(value?: string | null) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export const adminListWorkspaces = createServerFn()
  .validator((input?: { query?: string; status?: "all" | "active" | "archived" }) => input)
  .handler(async ({ data: input }) => {
    await requireOperator();
    const { query, status } = workspaceFilterSchema.parse(input);

    const where: Prisma.WorkspaceWhereInput = {};
    if (query) {
      where.OR = [
        { name: { contains: query, mode: "insensitive" } },
        { slug: { contains: query, mode: "insensitive" } },
        { businessName: { contains: query, mode: "insensitive" } },
        { businessEmail: { contains: query, mode: "insensitive" } },
      ];
    }
    if (status === "active") where.archivedAt = null;
    else if (status === "archived") where.archivedAt = { not: null };

    return prisma.workspace.findMany({
      where,
      orderBy: [{ archivedAt: "asc" }, { createdAt: "desc" }],
      take: 50,
      select: {
        id: true, name: true, slug: true, businessName: true, businessEmail: true,
        businessPhone: true, createdAt: true, updatedAt: true, archivedAt: true,
        _count: { select: { members: true, sites: true } },
      },
    });
  });

export const adminCreateWorkspace = createServerFn({ method: "POST" })
  .validator((input: { name: string; slug?: string; businessName?: string | null; businessEmail?: string | null; businessPhone?: string | null }) => input)
  .handler(async ({ data: input }) => {
    const operator = await requireOperator();
    const payload = workspacePayloadSchema.parse(input);
    const name = payload.name.trim();
    const slug = await resolveWorkspaceSlug(payload.slug && payload.slug.length > 0 ? payload.slug : name);

    try {
      return prisma.workspace.create({
        data: {
          name, slug,
          businessName: normalizeOptionalString(payload.businessName),
          businessEmail: normalizeOptionalString(payload.businessEmail),
          businessPhone: normalizeOptionalString(payload.businessPhone),
          members: { create: { userId: operator.id, role: "OWNER" } },
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new Error("Workspace slug already exists. Try another slug.");
      }
      throw error;
    }
  });

export const adminUpdateWorkspace = createServerFn({ method: "POST" })
  .validator((input: { workspaceId: string; name?: string; slug?: string | null; businessName?: string | null; businessEmail?: string | null; businessPhone?: string | null }) => input)
  .handler(async ({ data: { workspaceId, ...input } }) => {
    await requireOperator();
    if (!workspaceId) throw new Error("Workspace id is required");

    const payload = workspacePayloadSchema.partial().parse(input);
    const updateData: Prisma.WorkspaceUpdateInput = {
      ...(payload.name ? { name: payload.name.trim() } : {}),
      businessName: payload.businessName !== undefined ? normalizeOptionalString(payload.businessName) : undefined,
      businessEmail: payload.businessEmail !== undefined ? normalizeOptionalString(payload.businessEmail) : undefined,
      businessPhone: payload.businessPhone !== undefined ? normalizeOptionalString(payload.businessPhone) : undefined,
    };

    if (payload.slug !== undefined) {
      if (payload.slug !== "" || payload.name) {
        const slug = payload.slug && payload.slug.length > 0
          ? await resolveWorkspaceSlug(payload.slug, workspaceId)
          : await resolveWorkspaceSlug(payload.name ?? "", workspaceId);
        updateData.slug = slug;
      }
    }

    try {
      return prisma.workspace.update({
        where: { id: workspaceId },
        data: updateData,
        select: { id: true, name: true, slug: true, businessName: true, businessEmail: true, businessPhone: true, updatedAt: true },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new Error("Workspace slug already exists. Try another slug.");
      }
      throw error;
    }
  });

export const adminArchiveWorkspace = createServerFn({ method: "POST" })
  .validator((workspaceId: string) => workspaceId)
  .handler(async ({ data: workspaceId }) => {
    await requireOperator();
    if (!workspaceId) throw new Error("Workspace id is required");
    await prisma.workspace.update({ where: { id: workspaceId }, data: { archivedAt: new Date() } });
    return { success: true };
  });

export const adminRestoreWorkspace = createServerFn({ method: "POST" })
  .validator((workspaceId: string) => workspaceId)
  .handler(async ({ data: workspaceId }) => {
    await requireOperator();
    if (!workspaceId) throw new Error("Workspace id is required");
    await prisma.workspace.update({ where: { id: workspaceId }, data: { archivedAt: null } });
    return { success: true };
  });

export const adminDeleteWorkspace = createServerFn({ method: "POST" })
  .validator((workspaceId: string) => workspaceId)
  .handler(async ({ data: workspaceId }) => {
    await requireOperator();
    if (!workspaceId) throw new Error("Workspace id is required");
    await prisma.workspace.delete({ where: { id: workspaceId } });
    return { success: true };
  });

export const adminListWorkspaceMembers = createServerFn()
  .validator((workspaceId: string) => workspaceId)
  .handler(async ({ data: workspaceId }) => {
    await requireOperator();
    const { workspaceId: parsedWorkspaceId } = workspaceIdSchema.parse({ workspaceId });

    const [members, invites] = await Promise.all([
      prisma.workspaceMember.findMany({
        where: { workspaceId: parsedWorkspaceId },
        orderBy: { role: "asc" },
        select: {
          id: true, role: true, joinedAt: true,
          user: { select: { id: true, email: true, name: true } },
        },
      }),
      prisma.workspaceInvitation.findMany({
        where: { workspaceId: parsedWorkspaceId, acceptedAt: null, expiresAt: { gt: new Date() } },
        orderBy: { createdAt: "desc" },
        select: { id: true, email: true, role: true, expiresAt: true, createdAt: true },
      }),
    ]);

    return { members, invites };
  });

export const adminAddWorkspaceMember = createServerFn({ method: "POST" })
  .validator((input: { workspaceId: string; email: string; role: Role }) => input)
  .handler(async ({ data: input }) => {
    const operator = await requireOperator();
    const payload = workspaceMemberInputSchema.parse(input);

    const workspace = await prisma.workspace.findUnique({ where: { id: payload.workspaceId }, select: { id: true } });
    if (!workspace) throw new Error("Workspace not found");

    const existingUser = await prisma.user.findUnique({ where: { email: payload.email }, select: { id: true } });

    if (existingUser) {
      const existingMembership = await prisma.workspaceMember.findUnique({
        where: { userId_workspaceId: { userId: existingUser.id, workspaceId: payload.workspaceId } },
      });
      if (existingMembership) throw new Error("User is already a member of this workspace");

      await prisma.workspaceMember.create({
        data: { workspaceId: payload.workspaceId, userId: existingUser.id, role: payload.role },
      });
    } else {
      await prisma.workspaceInvitation.create({
        data: {
          workspaceId: payload.workspaceId, email: payload.email, role: payload.role,
          invitedById: operator.id, expiresAt: addDays(new Date(), 14),
        },
      });
    }

    return { success: true };
  });

export const adminUpdateWorkspaceMemberRole = createServerFn({ method: "POST" })
  .validator((input: { memberId: string; role: Role }) => input)
  .handler(async ({ data: input }) => {
    await requireOperator();
    const payload = workspaceMemberRoleSchema.parse(input);

    const member = await prisma.workspaceMember.findUnique({
      where: { id: payload.memberId },
      select: { id: true, role: true, workspaceId: true },
    });
    if (!member) throw new Error("Workspace member not found");

    if (member.role === "OWNER" && payload.role !== "OWNER") {
      const otherOwners = await prisma.workspaceMember.count({
        where: { workspaceId: member.workspaceId, role: "OWNER", id: { not: member.id } },
      });
      if (otherOwners === 0) throw new Error("Each workspace must have at least one owner.");
    }

    await prisma.workspaceMember.update({ where: { id: payload.memberId }, data: { role: payload.role } });
    return { success: true };
  });

export const adminRemoveWorkspaceMember = createServerFn({ method: "POST" })
  .validator((memberId: string) => memberId)
  .handler(async ({ data: memberId }) => {
    await requireOperator();
    if (!memberId) throw new Error("Member id is required");

    const member = await prisma.workspaceMember.findUnique({
      where: { id: memberId },
      select: { id: true, role: true, workspaceId: true },
    });
    if (!member) throw new Error("Workspace member not found");

    if (member.role === "OWNER") {
      const otherOwners = await prisma.workspaceMember.count({
        where: { workspaceId: member.workspaceId, role: "OWNER", id: { not: member.id } },
      });
      if (otherOwners === 0) throw new Error("Each workspace must have at least one owner.");
    }

    await prisma.workspaceMember.delete({ where: { id: memberId } });
    return { success: true };
  });

export const adminRevokeWorkspaceInvite = createServerFn({ method: "POST" })
  .validator((inviteId: string) => inviteId)
  .handler(async ({ data: inviteId }) => {
    await requireOperator();
    const payload = inviteIdSchema.parse({ inviteId });
    await prisma.workspaceInvitation.delete({ where: { id: payload.inviteId } });
    return { success: true };
  });

export const adminListPeople = createServerFn()
  .validator((input?: { query?: string }) => input)
  .handler(async ({ data: input }) => {
    await requireOperator();
    const { query } = userFilterSchema.parse(input);

    return prisma.user.findMany({
      where: query ? { OR: [{ name: { contains: query, mode: "insensitive" } }, { email: { contains: query, mode: "insensitive" } }] } : undefined,
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true, name: true, email: true, agent: true, superAdmin: true,
        createdAt: true, updatedAt: true, defaultWorkspaceId: true,
        _count: { select: { workspaces: true } },
      },
    });
  });

export const adminPromoteUser = createServerFn({ method: "POST" })
  .validator((input: { email: string; agent: boolean; superAdmin?: boolean }) => input)
  .handler(async ({ data: input }) => {
    await requireOperator();
    const payload = userPromotionSchema.parse(input);

    const user = await prisma.user.findUnique({ where: { email: payload.email }, select: { id: true } });
    if (!user) throw new Error("User not found. Ensure the user has signed up before promoting.");

    await prisma.user.update({ where: { id: user.id }, data: { agent: payload.agent, superAdmin: payload.superAdmin ?? false } });
    return { success: true };
  });

export const adminUpdateUserRoles = createServerFn({ method: "POST" })
  .validator((input: { userId: string; agent?: boolean; superAdmin?: boolean }) => input)
  .handler(async ({ data: input }) => {
    await requireOperator();
    const payload = userRoleUpdateSchema.parse(input);
    if (payload.agent === undefined && payload.superAdmin === undefined) throw new Error("Nothing to update");

    await prisma.user.update({
      where: { id: payload.userId },
      data: { agent: payload.agent ?? undefined, superAdmin: payload.superAdmin ?? undefined },
    });
    return { success: true };
  });

export const adminRemoveOperator = createServerFn({ method: "POST" })
  .validator((userId: string) => userId)
  .handler(async ({ data: userId }) => {
    await requireOperator();
    if (!userId) throw new Error("User id is required");
    await prisma.user.update({ where: { id: userId }, data: { agent: false, superAdmin: false } });
    return { success: true };
  });

export const adminListPlatformSettings = createServerFn()
  .handler(async () => {
    await requireOperator();
    return prisma.platformSetting.findMany({ orderBy: { key: "asc" } });
  });

function parseSettingValue(value: unknown) {
  if (typeof value === "string") {
    try { return JSON.parse(value); } catch { return value; }
  }
  return value;
}

export const adminCreatePlatformSetting = createServerFn({ method: "POST" })
  .validator((input: { key: string; value: unknown; description?: string | null }) => input)
  .handler(async ({ data: input }) => {
    await requireOperator();
    const payload = platformSettingPayloadSchema.parse({ ...input, value: parseSettingValue(input.value) });

    try {
      return prisma.platformSetting.create({
        data: { key: payload.key, value: payload.value, description: normalizeOptionalString(payload.description) },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new Error("A setting with that key already exists.");
      }
      throw error;
    }
  });

export const adminUpdatePlatformSetting = createServerFn({ method: "POST" })
  .validator((input: { id: string; key?: string; value?: unknown; description?: string | null }) => input)
  .handler(async ({ data: input }) => {
    await requireOperator();
    const payload = platformSettingUpdateSchema.parse({
      ...input, value: input.value !== undefined ? parseSettingValue(input.value) : undefined,
    });

    try {
      return prisma.platformSetting.update({
        where: { id: payload.id },
        data: {
          ...(payload.key ? { key: payload.key } : {}),
          value: payload.value ?? undefined,
          description: payload.description !== undefined ? normalizeOptionalString(payload.description) : undefined,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new Error("A setting with that key already exists.");
      }
      throw error;
    }
  });

export const adminDeletePlatformSetting = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    await requireOperator();
    if (!id) throw new Error("Setting id is required");
    await prisma.platformSetting.delete({ where: { id } });
    return { success: true };
  });

export const adminGetWorkspaceDetails = createServerFn()
  .validator((workspaceId: string) => workspaceId)
  .handler(async ({ data: workspaceId }) => {
    await requireOperator();
    if (!workspaceId) throw new Error("Workspace id is required");

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: {
        id: true, name: true, slug: true, businessName: true, businessEmail: true,
        businessPhone: true, createdAt: true, updatedAt: true, archivedAt: true,
        _count: { select: { members: true, sites: true } },
      },
    });

    if (!workspace) throw new Error("Workspace not found");

    const membership = await adminListWorkspaceMembers(workspaceId);
    return { workspace, ...membership };
  });
