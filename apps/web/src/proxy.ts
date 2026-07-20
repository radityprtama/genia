import { getSessionCookie } from "better-auth/cookies";

import {
  AFFILIATE_COOKIE_NAME,
  AFFILIATE_COOKIE_MAX_AGE,
  normalizeReferralCode,
} from "@/lib/affiliates/constants";
import { getRateLimiter, getClientIp } from "@/lib/rate-limit";

const AUTH_REDIRECT_PATHS = ["/auth", "/sign-in", "/sign-up"];
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/affiliate/dashboard",
  "/affiliate/onboarding",
  "/control-room",
  "/builder",
  "/settings",
];

const authRateLimiter = getRateLimiter("auth");
const sensitiveRateLimiter = getRateLimiter("sensitive");

function addSecurityHeaders(response: Response): Response {
  const headers = new Headers(response.headers);
  headers.set("X-Frame-Options", "DENY");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()",
  );
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function shouldBypass(pathname: string) {
  return (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/static/") ||
    pathname.startsWith("/favicon")
  );
}

export async function proxy(request: Request) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  if (shouldBypass(pathname)) {
    return new Response(null, { status: 200 });
  }

  if (pathname.startsWith("/api/auth")) {
    const ip = getClientIp(request);
    const result = await authRateLimiter.check(ip);
    if (!result.success) {
      const retryAfter = Math.ceil((result.reset - Date.now()) / 1000);
      return new Response("Too Many Requests", {
        status: 429,
        headers: {
          "Retry-After": String(retryAfter),
          "X-RateLimit-Remaining": String(result.remaining),
          "X-RateLimit-Reset": String(result.reset),
        },
      });
    }
  }

  const referralParam = url.searchParams.get("ref");
  const sessionCookie = getSessionCookie(request, {
    cookiePrefix: "Genia",
  });

  let response: Response;

  if (sessionCookie && AUTH_REDIRECT_PATHS.includes(pathname)) {
    const redirectUrl = new URL("/dashboard", request.url);
    return Response.redirect(redirectUrl.toString(), 302);
  } else if (!sessionCookie) {
    const requiresAuth = PROTECTED_PREFIXES.some((prefix) =>
      pathname.startsWith(prefix),
    );

    if (requiresAuth) {
      const authUrl = new URL("/auth", request.url);
      authUrl.searchParams.set("next", pathname + url.search);
      return Response.redirect(authUrl.toString(), 302);
    } else {
      response = new Response(null, { status: 200 });
    }
  } else {
    response = new Response(null, { status: 200 });
  }

  if (referralParam) {
    const normalized = normalizeReferralCode(referralParam);
    if (normalized.length >= 4 && normalized.length <= 24) {
      // ponytail: using a straightforward cookie approach; needs a proper cookie store in TanStack
    }
  }

  return addSecurityHeaders(response);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
