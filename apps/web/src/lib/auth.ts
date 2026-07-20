import { betterAuth } from "better-auth";
import { lastLoginMethod, twoFactor } from "better-auth/plugins";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { stripe as stripePlugin } from "@better-auth/stripe";
import Stripe from "stripe";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

import { resolveStripePlans } from "@/lib/billing/plans";
import { handleAffiliateStripeEvent } from "@/lib/affiliates/stripe";
import prisma from "@/lib/prisma";
import { sendEmail } from "@/lib/email/email-service";
import { ResetPasswordEmail } from "@/components/emails/reset-password-email";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

const SEVEN_DAYS_IN_SECONDS = 60 * 60 * 24 * 7;
const ONE_DAY_IN_SECONDS = 60 * 60 * 24;
const FIVE_MINUTES_IN_SECONDS = 60 * 5;

const basePlugins = [lastLoginMethod(), twoFactor()];

if (stripeSecretKey && stripeWebhookSecret) {
  const subscriptionPlans = resolveStripePlans();
  if (!subscriptionPlans.length && process.env.NODE_ENV !== "production") {
    console.warn(
      "Stripe billing plugin loaded without plan price IDs. Subscription upgrades are disabled until price IDs are configured.",
    );
  }
  try {
    const stripeClient = new Stripe(stripeSecretKey, {
      apiVersion: "2025-02-24.acacia",
    });

    basePlugins.push(
      stripePlugin({
        stripeClient,
        stripeWebhookSecret,
        createCustomerOnSignUp: true,
        subscription: subscriptionPlans.length
          ? {
              enabled: true,
              plans: subscriptionPlans,
              authorizeReference: async ({ user, referenceId }) => {
                if (!referenceId) {
                  return false;
                }

                const membership = await prisma.workspaceMember.findUnique({
                  where: {
                    userId_workspaceId: {
                      userId: user.id,
                      workspaceId: referenceId,
                    },
                  },
                  select: {
                    role: true,
                  },
                });

                if (!membership) {
                  return false;
                }

                return (
                  membership.role === "OWNER" || membership.role === "ADMIN"
                );
              },
            }
          : undefined,
        onEvent: async (event) => {
          try {
            await handleAffiliateStripeEvent(event);
          } catch (error) {
            if (process.env.NODE_ENV !== "production") {
              console.error("Failed to handle affiliate Stripe event", error);
            }
          }
        },
      }),
    );
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Failed to initialize Stripe plugin", error);
    }
  }
} else if (process.env.NODE_ENV !== "production") {
  console.warn(
    "Stripe billing disabled – missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET.",
  );
}
export const auth = betterAuth({
  baseURL: process.env.VITE_APP_URL || "http://localhost:3000",
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  session: {
    expiresIn: SEVEN_DAYS_IN_SECONDS,
    updateAge: ONE_DAY_IN_SECONDS,
    cookieCache: {
      enabled: true,
      maxAge: FIVE_MINUTES_IN_SECONDS,
    },
  },
  advanced: {
    cookiePrefix: "Genia",
    generateId: () => crypto.randomUUID(),
  },
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Reset your Genia password",
        react: ResetPasswordEmail({
          username: user.name || "there",
          resetLink: url,
        }),
      });
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
  },
  plugins: [...basePlugins, tanstackStartCookies()],
});

export async function getCurrentUser() {
  const headersList = getRequestHeaders();
  const session = await auth.api.getSession({
    headers: headersList,
  });

  return session?.user || null;
}
