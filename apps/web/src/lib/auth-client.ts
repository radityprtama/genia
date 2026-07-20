import { createAuthClient } from "better-auth/react";
import { lastLoginMethodClient, twoFactorClient } from "better-auth/client/plugins";
import { stripeClient } from "@better-auth/stripe/client";

export const authClient = createAuthClient({
  baseURL: process.env.VITE_APP_URL,
  plugins: [
    lastLoginMethodClient(),
    twoFactorClient({
      onTwoFactorRedirect() {
        window.location.href = "/auth/two-factor";
      },
    }),
    stripeClient({
      subscription: true,
    }),
  ],
});

export const { signIn, signOut, signUp, useSession } = authClient;
