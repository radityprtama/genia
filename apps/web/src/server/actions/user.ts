import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const getCurrentUser = createServerFn()
  .handler(async () => {
    try {
      const requestHeaders = getRequestHeaders();
      if (!requestHeaders) return null;

      const session = await auth.api.getSession({ headers: requestHeaders });
      if (!session?.user?.id) return null;

      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          id: true,
          email: true,
          name: true,
          agent: true,
          superAdmin: true,
          image: true,
          emailVerified: true,
          createdAt: true,
          onboardingCompleted: true,
        },
      });

      return user;
    } catch (error) {
      console.error("Error fetching current user:", error);
      return null;
    }
  });
