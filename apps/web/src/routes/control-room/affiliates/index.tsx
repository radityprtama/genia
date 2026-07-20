import { createFileRoute, notFound } from "@tanstack/react-router"
import { getCurrentUser } from "@/server/actions/user"
import { adminListAffiliates } from "@/server/actions/affiliate"
import { AffiliateReferralsTable as AdminAffiliateTable } from "@/components/control-room/affiliates/admin-affiliate-table"

export const Route = createFileRoute("/control-room/affiliates/")({
  beforeLoad: async () => {
    const user = await getCurrentUser()
    if (!user || (!user.superAdmin && !user.agent)) {
      throw notFound()
    }
  },
  loader: async () => {
    const affiliates = await adminListAffiliates()
    return { affiliates }
  },
  component: ControlRoomAffiliatesPage,
  head: () => ({
    meta: [{ title: "Affiliate approvals - Control room - Genia" }],
  }),
})

function ControlRoomAffiliatesPage() {
  const { affiliates } = Route.useLoaderData()

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold tracking-tight">
          Affiliate approvals
        </h2>
        <p className="text-sm text-muted-foreground">
          Approve new partners, monitor referral health, and step in if
          accounts need attention.
        </p>
      </div>

      <AdminAffiliateTable affiliates={affiliates} />
    </div>
  )
}
