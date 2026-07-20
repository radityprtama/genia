import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@workspace/ui/components/input-otp";
import { Input } from "@workspace/ui/components/input";
import { Alert, AlertDescription } from "@workspace/ui/components/alert";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/_auth/two-factor")({
  component: TwoFactorPage,
});

function TwoFactorPage() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useBackupCode, setUseBackupCode] = useState(false);

  const handleVerify = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await authClient.twoFactor.verifyTOTP(
        {
          code,
        },
        {
          onSuccess() {
            navigate({ to: "/dashboard" });
          },
          onError(ctx) {
            setError(ctx.error.message);
          },
        }
      );

      if (error) {
        setError(error.message);
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (value: string) => {
    setCode(value);
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Two-Factor Authentication</CardTitle>
          <CardDescription>
            {useBackupCode
              ? "Enter one of your recovery codes."
              : "Enter the 6-digit code from your authenticator app."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-center">
            {useBackupCode ? (
              <Input
                placeholder="Recovery code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="text-center text-lg tracking-widest"
              />
            ) : (
              <InputOTP
                maxLength={6}
                value={code}
                onChange={handleOtpChange}
                disabled={isLoading}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            )}
          </div>

          <Button
            className="w-full"
            onClick={handleVerify}
            disabled={isLoading || code.length < 6}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {useBackupCode ? "Verify Recovery Code" : "Verify Code"}
          </Button>

          <div className="text-center text-sm">
            <button
              onClick={() => {
                setUseBackupCode(!useBackupCode);
                setCode("");
                setError(null);
              }}
              className="text-muted-foreground hover:text-primary underline underline-offset-4"
              type="button"
            >
              {useBackupCode
                ? "Use authenticator app instead"
                : "Lost your device? Use a backup code"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
