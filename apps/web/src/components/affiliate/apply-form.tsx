"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import type { Affiliate } from "@prisma/client";

import { requestAffiliateEnrollment } from "@/server/actions/affiliate";
import { Button } from "@workspace/ui/components/button";
import { Textarea } from "@workspace/ui/components/textarea";
import { Badge } from "@workspace/ui/components/badge";

type ApplyAffiliateFormProps = {
  affiliate: Affiliate | null;
};

export function ApplyAffiliateForm({ affiliate }: ApplyAffiliateFormProps) {
  const [note, setNote] = useState("");
  const [isPending, startTransition] = useTransition();

  const status = affiliate?.status ?? "NEW";

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    startTransition(async () => {
      try {
        const result = await requestAffiliateEnrollment(note);
        toast.success("Application submitted", {
          description:
            "We will review your request and email you once you are approved.",
        });
        setNote(result.applicationNote ?? "");
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Unable to submit affiliate application.",
        );
      }
    });
  };

  if (status !== "NEW" && affiliate) {
    return (
      <div className="space-y-4 rounded-lg border p-6">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-medium">Application status</h2>
          <Badge variant="secondary">{affiliate.status}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          We&apos;ll let you know as soon as we review your submission. Once
          approved, you can complete Stripe Connect onboarding and start sharing
          your link.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border p-6">
      <div className="space-y-2">
        <label htmlFor="note" className="text-sm font-medium">
          Tell us about your audience (optional)
        </label>
        <Textarea
          id="note"
          name="note"
          value={note}
          rows={4}
          placeholder="Share where you'll promote Genia, audience size, and any other context that helps us approve you quickly."
          onChange={(event) => setNote(event.target.value)}
          disabled={isPending}
        />
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? "Submitting…" : "Submit application"}
      </Button>
    </form>
  );
}
