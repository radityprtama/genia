import { createFileRoute, redirect } from "@tanstack/react-router";
import { getCurrentUser } from "@/server/actions/user";
import { getAffiliateProfile } from "@/server/actions/affiliate";
import { ApplyAffiliateForm } from "@/components/affiliate/apply-form";

export const Route = createFileRoute("/affiliate/apply")({
  loader: async () => {
    const user = await getCurrentUser();
    if (!user) {
      throw redirect({ to: "/login" });
    }
    const affiliate = await getAffiliateProfile();
    if (affiliate && affiliate.status === "APPROVED") {
      if (!affiliate.onboardingCompleted) {
        throw redirect({ to: "/affiliate/onboarding" });
      }
      throw redirect({ to: "/affiliate/dashboard" });
    }
    return { affiliate };
  },
  component: AffiliateApplyPage,
});

function AffiliateApplyPage() {
  const { affiliate } = Route.useLoaderData();

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col justify-center px-6 py-16">
      <div className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight">
          Apply to become an affiliate
        </h1>
        <p className="text-muted-foreground">
          Tell us a little bit about your audience. Once approved, you&apos;ll
          receive a unique referral code and Stripe Connect onboarding link to
          start earning commissions.
        </p>
      </div>

      <div className="mt-8">
        <ApplyAffiliateForm affiliate={affiliate} />
      </div>
    </div>
  );
}
