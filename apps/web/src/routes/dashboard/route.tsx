import { createFileRoute, Outlet } from "@tanstack/react-router"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@workspace/ui/components/sidebar"
import { SiteHeader } from "@/components/site-header"
import { getCurrentUser } from "@/server/actions/user"
import { getUserWorkspaces, getCurrentWorkspace } from "@/server/actions/workspace"

export const Route = createFileRoute("/dashboard")({
  component: DashboardLayout,
  loader: async () => {
    const [user, workspaces, currentWorkspace] = await Promise.all([
      getCurrentUser(),
      getUserWorkspaces(),
      getCurrentWorkspace(),
    ])
    return { user, workspaces, currentWorkspace }
  },
  head: () => ({ meta: [{ title: "Dashboard" }] }),
})

function DashboardLayout() {
  const { user, workspaces, currentWorkspace } = Route.useLoaderData()

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar
        variant="inset"
        user={user as any}
        workspaces={workspaces}
        currentWorkspace={currentWorkspace}
      />
      <SidebarInset>
        <SiteHeader />
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  )
}
