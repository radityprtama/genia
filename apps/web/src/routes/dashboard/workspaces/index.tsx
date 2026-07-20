import { createFileRoute, redirect } from "@tanstack/react-router"
import { getCurrentUser } from "@/server/actions/user"
import { getUserWorkspaces } from "@/server/actions/workspace"
import { WorkspacesClient } from "@/components/workspaces-client"

export const Route = createFileRoute("/dashboard/workspaces/")({
  component: WorkspacesPage,
  beforeLoad: async () => {
    const user = await getCurrentUser()
    if (!user) throw redirect({ to: "/auth" })
    return { user }
  },
  loader: async () => {
    const workspaces = await getUserWorkspaces()
    return {
      workspaces: workspaces.map((w) => ({
        id: w.id,
        name: w.name,
        role: w.role,
        createdAt: w.createdAt.toISOString(),
      })),
    }
  },
  head: () => ({ meta: [{ title: "Workspaces" }] }),
})

function WorkspacesPage() {
  const { workspaces } = Route.useLoaderData()

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Workspaces</h1>
        <p className="text-muted-foreground">
          Manage your workspaces and collaborate with your team.
        </p>
      </div>
      <WorkspacesClient workspaces={workspaces} />
    </div>
  )
}
