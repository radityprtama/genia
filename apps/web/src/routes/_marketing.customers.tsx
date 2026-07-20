import { createFileRoute } from "@tanstack/react-router"
import { Customer } from "@/components/blog/customers"
import MaxWidthWrapper from "@/components/blog/max-width-wrapper"
import { Suspense } from "react"

export const Route = createFileRoute("/_marketing/customers")({
  component: Customers,
  head: () => ({
    meta: [
      {
        title: "Customers – Genia",
        description:
          "See how agencies, startups, and enterprise teams use Genia to launch faster, collaborate across workspaces, and scale web programs with confidence.",
      },
    ],
  }),
})

const customers = [
  { slug: "vercel", site: "https://vercel.com" },
  { slug: "codenord" },
  { slug: "tinybird", site: "https://tinybird.co" },
  { slug: "hashnode", site: "https://hashnode.com" },
  { slug: "cal", site: "https://cal.com" },
]

function Customers() {
  return (
    <>
      <MaxWidthWrapper className="mb-8 mt-16 text-center">
        <div className="mx-auto mb-10 sm:max-w-lg">
          <h1 className="font-display text-4xl font-extrabold text-black sm:text-5xl">
            Meet our{" "}
            <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              customers
            </span>
          </h1>
          <p className="mt-5 text-gray-600 sm:text-lg">
            Genia empowers teams to build, manage, and grow their social
            presence &ndash; from startups to enterprises.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-5 py-5 md:grid-cols-4">
          {customers.map((customer) => (
            <Customer key={customer.slug} {...customer} />
          ))}
        </div>
      </MaxWidthWrapper>
    </>
  )
}
