import { createFileRoute, redirect } from "@tanstack/react-router"
import { getCurrentWorkspace } from "@/server/actions/workspace"
import {
  getBillingPlans,
  isStripeBillingConfigured,
  resolveStripePlans,
  type PlanId,
} from "@/lib/billing/plans"
import { getWorkspaceSubscription } from "@/lib/billing/subscription"
import { BillingClient } from "@/components/billing-client"

export const Route = createFileRoute("/dashboard/billing/")({
  component: BillingPage,
  beforeLoad: async () => {
    const workspace = await getCurrentWorkspace()
    if (!workspace) throw redirect({ to: "/onboarding" })
    return { workspace }
  },
  loader: async ({ context }) => {
    const { workspace } = context
    const [subscriptionSummary, plans] = await Promise.all([
      getWorkspaceSubscription(workspace.id),
      Promise.resolve(getBillingPlans()),
    ])

    const stripePlans = resolveStripePlans()
    const billingConfigured = isStripeBillingConfigured()

    const priceMap: Partial<Record<PlanId, { priceId: string; annualPriceId?: string }>> =
      stripePlans.reduce((acc, plan) => {
        acc[plan.name as PlanId] = {
          priceId: plan.priceId,
          ...(plan.annualDiscountPriceId ? { annualPriceId: plan.annualDiscountPriceId } : {}),
        }
        return acc
      }, {} as Partial<Record<PlanId, { priceId: string; annualPriceId?: string }>>)

    return {
      workspaceId: workspace.id,
      currentPlanId: subscriptionSummary.planId,
      subscriptionId: subscriptionSummary.subscription?.stripeSubscriptionId ?? undefined,
      plans,
      priceMap,
      billingConfigured,
    }
  },
  head: () => ({ meta: [{ title: "Billing" }] }),
})

function BillingPage() {
  const { workspaceId, currentPlanId, subscriptionId, plans, priceMap, billingConfigured } =
    Route.useLoaderData()

  return (
    <BillingClient
      workspaceId={workspaceId}
      currentPlanId={currentPlanId}
      subscriptionId={subscriptionId}
      plans={plans}
      priceMap={priceMap}
      billingConfigured={billingConfigured}
    />
  )
}
