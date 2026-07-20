import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { sendEmail, canSendEmail } from "@/lib/email";
import { WelcomeEmail } from "@/emails";

export const sendWelcomeEmail = createServerFn({ method: "POST" })
  .validator((userId: string) => userId)
  .handler(async ({ data: userId }) => {
    try {
      if (!canSendEmail()) {
        console.warn("Email not configured. Skipping welcome email.");
        return { success: false, error: "Email not configured" };
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, name: true },
      });

      if (!user || !user.email) {
        throw new Error("User not found or has no email");
      }

      const result = await sendEmail({
        to: user.email,
        subject: "Welcome to Genia!",
        react: WelcomeEmail(),
      });

      if (result.success) {
        console.log(`Welcome email sent to ${user.email} (ID: ${result.messageId})`);
      }

      return result;
    } catch (error) {
      console.error("Error sending welcome email:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  });

export const sendWelcomeEmailToCurrentUser = createServerFn({ method: "POST" })
  .handler(async () => {
    try {
      const requestHeaders = getRequestHeaders();
      if (!requestHeaders) throw new Error("No request context");

      const session = await auth.api.getSession({ headers: requestHeaders });
      if (!session?.user?.id) throw new Error("Unauthorized");

      return await sendWelcomeEmail(session.user.id);
    } catch (error) {
      console.error("Error sending welcome email:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  });

export const sendTestEmail = createServerFn({ method: "POST" })
  .validator((scenario: "delivered" | "bounced" | "complained" = "delivered") => scenario)
  .handler(async ({ data: scenario }) => {
    try {
      const requestHeaders = getRequestHeaders();
      if (!requestHeaders) throw new Error("No request context");

      const session = await auth.api.getSession({ headers: requestHeaders });
      if (!session?.user?.id) throw new Error("Unauthorized");

      if (process.env.EMAIL_MODE !== "development") {
        throw new Error("Test emails only available in development mode");
      }

      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { email: true, name: true },
      });

      if (!user || !user.email) throw new Error("User not found");

      const result = await sendEmail({
        to: user.email,
        subject: `Test Email - ${scenario} scenario`,
        react: WelcomeEmail(),
        testScenario: scenario,
      });

      return result;
    } catch (error) {
      console.error("Error sending test email:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  });
