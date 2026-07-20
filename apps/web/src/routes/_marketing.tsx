import { createFileRoute, Outlet } from "@tanstack/react-router"
import FooterSection from "@/components/footer"
import MarketingHeader from "@/components/marketing/marketing-header"

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
