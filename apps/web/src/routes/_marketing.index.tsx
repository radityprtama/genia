import { createFileRoute } from "@tanstack/react-router"
import { ProductIllustration } from "@/components/illustrations/product-illustration"
import LogoCloud from "@/components/marketing/sections/logo-cloud"
import { Card } from "@workspace/ui/components/card"
import { Table } from "@/components/marketing/sections/projects-table"
import { UptimeIllustration } from "@/components/illustrations/uptime-illustration"
import { MemoryUsageIllustration } from "@/components/illustrations/memory-usage-illustration"
import HowItWorks from "@/components/marketing/sections/how-it-works-3"
import Pricing from "@/components/marketing/sections/pricing"
import FAQs from "@/components/marketing/sections/faqs-2"
import CallToAction from "@/components/marketing/sections/call-to-action"
import { Zap, Layers, Heart, ArrowUpRightIcon } from "lucide-react"
import { getCurrentUser } from "@/server/actions/user"
import {
  Announcement,
  AnnouncementTag,
  AnnouncementTitle,
} from "@/components/kibo-ui/announcement"

export const Route = createFileRoute("/_marketing/")({
  component: Home,
  head: () => ({
    meta: [{ title: "Genia – AI Website Builder for Agencies & Businesses" }],
  }),
})

async function Home() {
  const user = await getCurrentUser()
  const isAuthenticated = Boolean(user)

  return (
    <main role="main" className="bg-muted overflow-hidden">
      <section className="relative pt-24 pb-32 md:pt-32 md:pb-44 lg:pt-36 lg:pb-52">
        <div className="relative z-30 mx-auto max-w-5xl px-6 text-center">
          <Announcement className="mb-6">
            <AnnouncementTag>Coming Soon</AnnouncementTag>
            <AnnouncementTitle>
              Launching Late 2026
              <ArrowUpRightIcon
                className="shrink-0 text-muted-foreground"
                size={16}
              />
            </AnnouncementTitle>
          </Announcement>
          <h1 className="mx-auto max-w-3xl text-balance text-4xl font-hero font-semibold sm:text-5xl">
            Build, scale, and sell websites with AI
          </h1>
          <p className="text-muted-foreground mx-auto mb-7 mt-3 max-w-xl text-balance text-xl">
            Generate professional websites in seconds. Perfect for agencies,
            freelancers, and entrepreneurs
          </p>
          <ProductIllustration isAuthenticated={isAuthenticated} />
        </div>
      </section>
      <section className="border-foreground/10 relative mt-8 border-t sm:mt-16">
        <div className="relative z-10 mx-auto max-w-6xl border-x px-3">
          <div className="border-x">
            <LogoCloud />
          </div>
        </div>
      </section>
      <section className="bg-muted @container">
        <div className="[--color-primary:var(--color-indigo-300)]">
          <div className="mx-auto max-w-6xl border-x px-3">
            <div className="border-x">
              <div
                aria-hidden
                className="h-3 w-full bg-[repeating-linear-gradient(-45deg,var(--color-foreground),var(--color-foreground)_1px,transparent_1px,transparent_4px)] opacity-5"
              />
              <div className="px-6 py-24">
                <div className="mx-auto mb-12 max-w-2xl text-center">
                  <h2 className="text-3xl font-semibold mb-3">
                    Make money by making websites
                  </h2>
                  <p className="text-muted-foreground text-lg">
                    Turn your web development skills into a profitable business
                    with our AI-powered platform
                  </p>
                </div>
                <div className="@2xl:grid-cols-2 @2xl:grid-rows-2 @4xl:grid-cols-3 grid gap-6">
                  <Card className="@xl:col-span-2 @2xl:row-span-2 grid grid-rows-[auto_1fr] gap-8 overflow-hidden rounded-2xl p-8">
                    <div>
                      <Zap className="text-muted-foreground size-4" />
                      <h3 className="text-foreground mb-2 mt-4 font-semibold">
                        Scale and Sell Websites Fast
                      </h3>
                      <p className="text-muted-foreground">
                        Build and deploy professional websites in minutes. Scale
                        your web agency and sell to businesses quickly with
                        AI-powered automation.
                      </p>
                    </div>
                    <div
                      aria-hidden
                      className="perspective-dramatic mask-b-from-55% mask-r-from-55% -mx-8 h-fit px-8"
                    >
                      <div className="relative -mr-8">
                        <Table />
                      </div>
                    </div>
                  </Card>
                  <Card className="grid grid-rows-[auto_1fr] gap-8 overflow-hidden rounded-2xl p-8">
                    <div>
                      <Layers className="text-muted-foreground size-4" />
                      <h3 className="text-foreground mb-2 mt-4 font-semibold">
                        Template Library
                      </h3>
                      <p className="text-muted-foreground">
                        Access a growing collection of pre-built templates for
                        every industry and use case.
                      </p>
                    </div>
                    <MemoryUsageIllustration />
                  </Card>
                  <Card className="grid grid-rows-[auto_1fr] gap-8 overflow-hidden rounded-2xl p-8">
                    <div>
                      <Heart className="text-muted-foreground size-4" />
                      <h3 className="text-foreground mb-2 mt-4 font-semibold">
                        Customer Satisfaction
                      </h3>
                      <p className="text-muted-foreground">
                        Track how your clients feel about their websites with
                        built-in feedback and analytics.
                      </p>
                    </div>
                    <div className="flex flex-col justify-end">
                      <UptimeIllustration />
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="bg-muted @container">
        <div className="[--color-primary:var(--color-indigo-300)]">
          <div className="mx-auto max-w-6xl border-x px-3">
            <div className="border-x">
              <div
                aria-hidden
                className="h-3 w-full bg-[repeating-linear-gradient(-45deg,var(--color-foreground),var(--color-foreground)_1px,transparent_1px,transparent_4px)] opacity-5"
              />
              <HowItWorks />
              <div
                aria-hidden
                className="h-3 w-full bg-[repeating-linear-gradient(-45deg,var(--color-foreground),var(--color-foreground)_1px,transparent_1px,transparent_4px)] opacity-5"
              />
              <Pricing />
              <div
                aria-hidden
                className="h-3 w-full bg-[repeating-linear-gradient(-45deg,var(--color-foreground),var(--color-foreground)_1px,transparent_1px,transparent_4px)] opacity-5"
              />
              <FAQs />
              <div
                aria-hidden
                className="h-3 w-full bg-[repeating-linear-gradient(-45deg,var(--color-foreground),var(--color-foreground)_1px,transparent_1px,transparent_4px)] opacity-5"
              />
              <CallToAction />
            </div>
          </div>
        </div>
      </section>
      <section className="border-foreground/10 relative border-t">
        <div className="relative z-10 mx-auto max-w-6xl border-x px-3">
          <div className="border-x h-0" />
        </div>
      </section>
    </main>
  )
}
