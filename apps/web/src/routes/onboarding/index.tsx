import { createFileRoute, redirect } from "@tanstack/react-router"
import { getCurrentUser } from "@/server/actions/user"
import { getCurrentWorkspace } from "@/server/actions/workspace"
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow"
import prisma from "@/lib/prisma"

export const Route = createFileRoute("/onboarding/")({
  beforeLoad: async () => {
    const user = await getCurrentUser()
    if (!user) throw redirect({ to: "/auth" })
    return { user }
  },
  loader: async ({ context }) => {
    const { user } = context
    const currentWorkspace = await getCurrentWorkspace()
    if (currentWorkspace) {
      if (!user.onboardingCompleted) {
        await prisma.user.update({
          where: { id: user.id },
          data: { onboardingCompleted: true },
        })
      }
      throw redirect({ to: "/dashboard" })
    }
    return { userName: user.name, userEmail: user.email }
  },
  component: OnboardingPage,
  head: () => ({
    meta: [
      { title: "Onboarding - Genia" },
      {
        name: "description",
        content: "Get started with Genia and set up your workspace.",
      },
    ],
  }),
})

function OnboardingPage() {
  const { userName, userEmail } = Route.useLoaderData()

  return <OnboardingFlow userName={userName} userEmail={userEmail} />
}
