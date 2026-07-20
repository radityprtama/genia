import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const globalForPrisma = global as unknown as {
  prisma: ReturnType<typeof createPrismaClient>;
};

function createPrismaClient() {
  const databaseUrl = process.env.DATABASE_URL || "";
  const useAccelerate =
    databaseUrl.startsWith("prisma://") ||
    databaseUrl.startsWith("prisma+postgres://");

  if (useAccelerate) {
    return new PrismaClient().$extends(withAccelerate());
  }
  return new PrismaClient();
}

const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
