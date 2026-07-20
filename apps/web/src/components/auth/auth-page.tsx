"use client";

import React, { useMemo, useState } from "react";
import { Link, useNavigate, useLocation } from "@tanstack/react-router";
import { useTheme } from "next-themes";
import { toast } from "sonner";

import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@workspace/ui/components/input-group";
import { Spinner } from "@workspace/ui/components/spinner";

import { AtSignIcon, ChevronLeftIcon, ArrowLeftIcon } from "lucide-react";

import { FloatingPaths } from "@/components/marketing/sections/floating-paths";
import { authClient, signIn, signUp } from "@/lib/auth-client";
import { resolveRedirectParam } from "@/lib/auth/redirect";

type AuthStep = "combined" | "email" | "forgot-password";
type AuthIntent = "sign-in" | "sign-up";

function formatLoginMethod(method: string | null) {
  if (!method) return null;
  if (method === "email") return "Email";
  return method
    .split("-")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

// ✅ prevent hydration mismatch for theme-based logo
function useMounted() {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  return mounted;
}

// ✅ Genia logo (INVERTED mapping)
// dark theme -> LIGHT logo
// light theme -> DARK logo
function GeniaLogo({
  className,
}: {
  className?: string;
}) {
  const mounted = useMounted();
  const { resolvedTheme } = useTheme();

  const lightLogo =
    "https://pub-07f684470f2a43e6a8d941be05aaadcc.r2.dev/genialight.png";
  const darkLogo =
    "https://pub-07f684470f2a43e6a8d941be05aaadcc.r2.dev/geniadark.png";

  const src = !mounted
    ? darkLogo
    : resolvedTheme === "dark"
      ? lightLogo
      : darkLogo;

  return (
    <img
      src={src}
      alt="Genia"
      width={121}
      height={70}
      className={className}
    />
  );
}

export function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  // Query params
  const modeParam = searchParams.get("mode");
  const promptParam = searchParams.get("prompt")?.trim() ?? "";
  const nextParamRaw = searchParams.get("next");

  // Derive redirect destination
  const promptQuery = promptParam
    ? `?prompt=${encodeURIComponent(promptParam)}`
    : "";
  const fallbackDestination = `/dashboard${promptQuery}`;
  const redirectDestination = resolveRedirectParam(
    nextParamRaw,
    fallbackDestination,
  );

  // Last used method for visual hints
  const lastMethod = useMemo(() => authClient.getLastUsedLoginMethod(), []);
  const formattedMethod = formatLoginMethod(lastMethod);
  const googleIsLast = lastMethod === "google";
  const githubIsLast = lastMethod === "github";
  const emailIsLast = lastMethod === "email";

  // Step state
  const [step, setStep] = useState<AuthStep>("combined");
  const defaultIntent: AuthIntent =
    modeParam === "sign-up" ? "sign-up" : "sign-in";
  const [intent, setIntent] = useState<AuthIntent>(defaultIntent);

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  // Handlers
  const handleForgotPassword = async () => {
    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }
    await authClient.requestPasswordReset(
      {
        email: email.trim(),
        redirectTo: "/reset-password",
      },
      {
        onRequest: () => setLoading(true),
        onResponse: () => setLoading(false),
        onSuccess: () => {
          toast.success("Check your email for the reset link");
          setStep("combined");
        },
        onError: (ctx) => {
          toast.error(ctx.error.message);
        },
      },
    );
  };

  const handleContinueWithEmail = () => {
    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }
    setStep("email");
  };

  const handleBack = () => {
    if (step === "forgot-password") {
      setStep("email");
      setIntent("sign-in");
      return;
    }
    setStep("combined");
    setPassword("");
    setName("");
  };

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      toast.error("Please enter your email and password");
      return;
    }
    await signIn.email(
      {
        email: email.trim(),
        password,
        callbackURL: redirectDestination,
      },
      {
        onRequest: () => setLoading(true),
        onResponse: () => setLoading(false),
        onError: (ctx) => {
          toast.error(ctx.error.message);
        },
        onSuccess: () => navigate({ to: redirectDestination }),
      },
    );
  };

  const handleSignUp = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    await signUp.email({
      name: name.trim(),
      email: email.trim(),
      password,
      callbackURL: redirectDestination,
      fetchOptions: {
        onRequest: () => setLoading(true),
        onResponse: () => setLoading(false),
        onError: (ctx) => {
          toast.error(ctx.error.message);
        },
        onSuccess: () => navigate({ to: redirectDestination }),
      },
    });
  };

  const handleSocialAuth = async (provider: "google" | "github") => {
    await signIn.social(
      {
        provider,
        callbackURL: redirectDestination,
      },
      {
        onRequest: () => setLoading(true),
        onResponse: () => setLoading(false),
      },
    );
  };

  return (
    <main className="relative md:h-screen md:overflow-hidden lg:grid lg:grid-cols-2">
      {/* Left panel - decorative */}
      <div className="relative hidden h-full flex-col border-r bg-secondary p-10 lg:flex dark:bg-secondary/20">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
        <GeniaLogo priority className="mr-auto h-8 w-auto" />

        <div className="z-10 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-xl">
              &ldquo;This Platform has helped me to save time and serve my
              clients faster than ever before.&rdquo;
            </p>
            <footer className="font-mono font-semibold text-sm">
              ~ Ali Hassan
            </footer>
          </blockquote>
        </div>
        <div className="absolute inset-0">
          <FloatingPaths position={1} />
          <FloatingPaths position={-1} />
        </div>
      </div>

      {/* Right panel - auth form */}
      <div className="relative flex min-h-screen flex-col justify-center p-4">
        <div
          aria-hidden
          className="-z-10 absolute inset-0 isolate opacity-60 contain-strict"
        >
          <div className="-translate-y-87.5 absolute top-0 right-0 h-320 w-140 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,--theme(--color-foreground/.06)_0,hsla(0,0%,55%,.02)_50%,--theme(--color-foreground/.01)_80%)]" />
          <div className="absolute top-0 right-0 h-320 w-60 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,--theme(--color-foreground/.04)_0,--theme(--color-foreground/.01)_80%,transparent_100%)] [translate:5%_-50%]" />
          <div className="-translate-y-87.5 absolute top-0 right-0 h-320 w-60 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,--theme(--color-foreground/.04)_0,--theme(--color-foreground/.01)_80%,transparent_100%)]" />
        </div>

        {step === "combined" ? (
          <Button asChild className="absolute top-7 left-5" variant="ghost">
            <Link href="/">
              <ChevronLeftIcon />
              Home
            </Link>
          </Button>
        ) : (
          <Button
            className="absolute top-7 left-5"
            variant="ghost"
            onClick={handleBack}
          >
            <ArrowLeftIcon />
            Back
          </Button>
        )}

        <div className="mx-auto space-y-4 sm:w-sm">
          <GeniaLogo priority className="h-5 w-auto lg:hidden" />

          {step === "forgot-password" ? (
            <>
              <div className="flex flex-col space-y-1">
                <h1 className="font-bold text-2xl tracking-wide">
                  Reset Password
                </h1>
                <p className="text-base text-muted-foreground">
                  Enter your email to receive a password reset link.
                </p>
              </div>

              <form
                className="space-y-4 mt-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleForgotPassword();
                }}
              >
                <div className="grid gap-2">
                  <Label htmlFor="forgot-email">Email</Label>
                  <Input
                    id="forgot-email"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && (
                    <Spinner className="mr-2 size-4" aria-hidden="true" />
                  )}
                  Send Reset Link
                </Button>
              </form>
            </>
          ) : step === "combined" ? (
            <>
              {/* Combined screen */}
              <div className="flex flex-col space-y-1">
                <h1 className="font-bold text-2xl tracking-wide">
                  Sign In or Join Now!
                </h1>
                <p className="text-base text-muted-foreground">
                  Login or create your Genia account.
                </p>
                {formattedMethod && (
                  <p
                    className="text-xs text-muted-foreground"
                    aria-live="polite"
                  >
                    Last signed in with {formattedMethod}.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Button
                  className="w-full"
                  size="lg"
                  type="button"
                  variant={googleIsLast ? "default" : "outline"}
                  disabled={loading}
                  onClick={() => handleSocialAuth("google")}
                >
                  {loading ? (
                    <Spinner className="mr-2 size-4" aria-hidden="true" />
                  ) : (
                    <GoogleIcon className="mr-2 h-4 w-4" />
                  )}
                  Continue with Google
                  {googleIsLast && (
                    <>
                      <Badge className="ml-2" variant="secondary">
                        Last used
                      </Badge>
                      <span className="sr-only">Last used login method</span>
                    </>
                  )}
                </Button>

                <Button
                  className="w-full"
                  size="lg"
                  type="button"
                  variant={githubIsLast ? "default" : "outline"}
                  disabled={loading}
                  onClick={() => handleSocialAuth("github")}
                >
                  {loading ? (
                    <Spinner className="mr-2 size-4" aria-hidden="true" />
                  ) : (
                    <GithubIcon className="mr-2 h-4 w-4" />
                  )}
                  Continue with GitHub
                  {githubIsLast && (
                    <>
                      <Badge className="ml-2" variant="secondary">
                        Last used
                      </Badge>
                      <span className="sr-only">Last used login method</span>
                    </>
                  )}
                </Button>
              </div>

              <div className="flex w-full items-center justify-center">
                <div className="h-px w-full bg-border" />
                <span className="px-2 text-muted-foreground text-xs">OR</span>
                <div className="h-px w-full bg-border" />
              </div>

              <form
                className="space-y-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleContinueWithEmail();
                }}
              >
                <p className="text-start text-muted-foreground text-xs">
                  Enter your email address to sign in or create an account
                </p>
                <InputGroup>
                  <Label htmlFor="email-input" className="sr-only">
                    Email address
                  </Label>
                  <InputGroupInput
                    id="email-input"
                    name="email"
                    placeholder="your.email@example.com"
                    type="email"
                    autoComplete="email"
                    spellCheck={false}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                  <InputGroupAddon>
                    <AtSignIcon />
                  </InputGroupAddon>
                </InputGroup>

                <Button
                  className="w-full"
                  type="submit"
                  variant={emailIsLast ? "default" : "outline"}
                  disabled={loading}
                >
                  {loading && (
                    <Spinner className="mr-2 size-4" aria-hidden="true" />
                  )}
                  Continue With Email
                  {emailIsLast && (
                    <>
                      <Badge className="ml-2" variant="secondary">
                        Last used
                      </Badge>
                      <span className="sr-only">Last used login method</span>
                    </>
                  )}
                </Button>
              </form>

              <p className="mt-8 text-muted-foreground text-sm">
                By clicking continue, you agree to our{" "}
                <Link
                  className="underline underline-offset-4 hover:text-primary"
                  href="/terms"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  className="underline underline-offset-4 hover:text-primary"
                  href="/privacy"
                >
                  Privacy Policy
                </Link>
                .
              </p>
            </>
          ) : (
            <>
              {/* Email step */}
              <div className="flex flex-col space-y-1">
                <h1 className="font-bold text-2xl tracking-wide">
                  {intent === "sign-in"
                    ? "Sign in to your account"
                    : "Create your account"}
                </h1>
                <p className="text-base text-muted-foreground">
                  {intent === "sign-in"
                    ? `Welcome back! Sign in as ${email}`
                    : `Create a new account for ${email}`}
                </p>
              </div>

              {/* Intent toggle buttons */}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={intent === "sign-in" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setIntent("sign-in")}
                  disabled={loading}
                >
                  Sign in
                </Button>
                <Button
                  type="button"
                  variant={intent === "sign-up" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setIntent("sign-up")}
                  disabled={loading}
                >
                  Create account
                </Button>
              </div>

              <form
                className="space-y-4"
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (intent === "sign-in") {
                    await handleSignIn();
                  } else {
                    await handleSignUp();
                  }
                }}
              >
                {intent === "sign-up" && (
                  <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="John Doe"
                      autoComplete="name"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                )}

                <div className="grid gap-2">
                  <Label htmlFor="email-field">Email</Label>
                  <Input
                    id="email-field"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    autoComplete="email"
                    spellCheck={false}
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    {intent === "sign-in" && (
                      <button
                        type="button"
                        onClick={() => setStep("forgot-password")}
                        className="ml-auto inline-block text-sm underline cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    autoComplete={
                      intent === "sign-in" ? "current-password" : "new-password"
                    }
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />
                </div>

                {intent === "sign-in" && (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) =>
                        setRememberMe(checked as boolean)
                      }
                    />
                    <label
                      htmlFor="remember"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Remember me
                    </label>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full justify-center"
                  disabled={loading}
                >
                  {loading && (
                    <Spinner className="mr-2 size-4" aria-hidden="true" />
                  )}
                  {intent === "sign-in" ? "Sign in" : "Create account"}
                </Button>
              </form>

              <p className="px-8 text-center text-sm text-muted-foreground">
                By continuing, you agree to our{" "}
                <Link
                  href="/terms"
                  className="underline underline-offset-4 hover:text-primary"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="underline underline-offset-4 hover:text-primary"
                >
                  Privacy Policy
                </Link>
                .
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

// Icons
const GoogleIcon = (props: React.ComponentProps<"svg">) => (
  <svg
    fill="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    {...props}
  >
    <g>
      <path d="M12.479,14.265v-3.279h11.049c0.108,0.571,0.164,1.247,0.164,1.979c0,2.46-0.672,5.502-2.84,7.669   C18.744,22.829,16.051,24,12.483,24C5.869,24,0.308,18.613,0.308,12S5.869,0,12.483,0c3.659,0,6.265,1.436,8.223,3.307L18.392,5.62   c-1.404-1.317-3.307-2.341-5.913-2.341C7.65,3.279,3.873,7.171,3.873,12s3.777,8.721,8.606,8.721c3.132,0,4.916-1.258,6.059-2.401   c0.927-0.927,1.537-2.251,1.777-4.059L12.479,14.265z" />
    </g>
  </svg>
);

const GithubIcon = (props: React.ComponentProps<"svg">) => (
  <svg
    fill="currentColor"
    viewBox="0 0 1024 1024"
    aria-hidden="true"
    {...props}
  >
    <path
      clipRule="evenodd"
      d="M8 0C3.58 0 0 3.58 0 8C0 11.54 2.29 14.53 5.47 15.59C5.87 15.66 6.02 15.42 6.02 15.21C6.02 15.02 6.01 14.39 6.01 13.72C4 14.09 3.48 13.23 3.32 12.78C3.23 12.55 2.84 11.84 2.5 11.65C2.22 11.5 1.82 11.13 2.49 11.12C3.12 11.11 3.57 11.7 3.72 11.94C4.44 13.15 5.59 12.81 6.05 12.6C6.12 12.08 6.33 11.73 6.56 11.53C4.78 11.33 2.92 10.64 2.92 7.58C2.92 6.71 3.23 5.99 3.74 5.43C3.66 5.23 3.38 4.41 3.82 3.31C3.82 3.31 4.49 3.1 6.02 4.13C6.66 3.95 7.34 3.86 8.02 3.86C8.7 3.86 9.38 3.95 10.02 4.13C11.55 3.09 12.22 3.31 12.22 3.31C12.66 4.41 12.38 5.23 12.3 5.43C12.81 5.99 13.12 6.7 13.12 7.58C13.12 10.65 11.25 11.33 9.47 11.53C9.76 11.78 10.01 12.26 10.01 13.01C10.01 14.08 10 14.94 10 15.21C10 15.42 10.15 15.67 10.55 15.59C13.71 14.53 16 11.53 16 8C16 3.58 12.42 0 8 0Z"
      fill="currentColor"
      fillRule="evenodd"
      transform="scale(64)"
    />
  </svg>
);
