import prisma from "@/lib/prisma";
import crypto from "crypto";

const SUBDOMAIN_BASE = "genia.tech";

function generateSubdomainSlug(siteName: string): string {
  const cleaned = siteName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 30);

  const randomSuffix = crypto.randomBytes(3).toString("hex");

  return `${cleaned}-${randomSuffix}`;
}

export async function assignSubdomain(siteId: string, siteName: string) {
  let attempts = 0;
  const maxAttempts = 5;

  while (attempts < maxAttempts) {
    const subdomain = generateSubdomainSlug(siteName);

    try {
      const assignment = await prisma.subdomainAssignment.create({
        data: {
          siteId,
          subdomain,
        },
      });

      return {
        subdomain: assignment.subdomain,
        fullDomain: `${assignment.subdomain}.${SUBDOMAIN_BASE}`,
      };
    } catch (error) {
      attempts++;
      if (attempts >= maxAttempts) {
        throw new Error("Failed to generate unique subdomain");
      }
    }
  }

  throw new Error("Failed to assign subdomain");
}

export async function getSubdomain(siteId: string) {
  const assignment = await prisma.subdomainAssignment.findUnique({
    where: { siteId },
  });

  if (!assignment) {
    return null;
  }

  return {
    subdomain: assignment.subdomain,
    fullDomain: `${assignment.subdomain}.${SUBDOMAIN_BASE}`,
    isActive: assignment.isActive,
  };
}

export async function isSubdomainAvailable(
  subdomain: string,
): Promise<boolean> {
  const existing = await prisma.subdomainAssignment.findUnique({
    where: { subdomain },
  });

  return !existing;
}

export async function deactivateSubdomain(siteId: string) {
  await prisma.subdomainAssignment.update({
    where: { siteId },
    data: { isActive: false },
  });
}
