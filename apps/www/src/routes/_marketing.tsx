import { createFileRoute, Outlet } from "@tanstack/react-router"
import FooterSection from "@workspace/ui/components/marketing/footer"
import MarketingHeader from "@workspace/ui/components/marketing/marketing-header"

export const Route = createFileRoute("/_marketing")({
  component: MarketingLayout,
})

function MarketingLayout() {
  return (
    <>
      <MarketingHeader />
      <Outlet />
      <FooterSection />
    </>
  )
}
