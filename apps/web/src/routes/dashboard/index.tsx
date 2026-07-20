import { createFileRoute, redirect, Link } from "@tanstack/react-router"
import {
  getDashboardStats,
  getRecentProjects,
  getPendingActions,
  getActivityFeed,
} from "@/server/actions/dashboard"
import { getCurrentUser } from "@/server/actions/user"
import { getCurrentWorkspace, getUserWorkspaces } from "@/server/actions/workspace"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { Folder, Users, LinkSimple } from "@phosphor-icons/react"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { RecentProjects } from "@/components/dashboard/recent-projects"
import { PendingActions } from "@/components/dashboard/pending-actions"
import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { EmptyDashboardState } from "@/components/dashboard/empty-state"

export const Route = createFileRoute("/dashboard/")({
  component: DashboardPage,
  beforeLoad: async () => {
    const user = await getCurrentUser()
    if (!user) throw redirect({ to: "/auth" })
    return { user }
  },
  loader: async ({ context }) => {
    const { user } = context
    const [currentWorkspace, workspaces, stats, recentProjects, pendingActions, activities] =
      await Promise.all([
        getCurrentWorkspace(),
        getUserWorkspaces(),
        getDashboardStats(),
        getRecentProjects(),
        getPendingActions(),
        getActivityFeed(),
      ])
    if (!currentWorkspace) throw redirect({ to: "/onboarding" })

    return {
      user,
      currentWorkspace,
      workspaces,
      stats,
      recentProjects,
      pendingActions,
      activities,
      hasProjects: (stats?.activeSites ?? 0) > 0,
    }
  },
  head: () => ({ meta: [{ title: "Dashboard" }] }),
})

function DashboardPage() {
  const { user, currentWorkspace, workspaces, stats, recentProjects, pendingActions, activities, hasProjects } =
    Route.useLoaderData()

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Welcome back, {user.name || user.email}!
            </h1>
            <p className="text-muted-foreground mt-1">
              Working in {currentWorkspace.name}
            </p>
          </div>
        </div>
      </div>

      {!hasProjects ? (
        <EmptyDashboardState />
      ) : (
        <>
          <StatsCards stats={stats} />

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Get started with common tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                <Button asChild className="justify-start h-auto p-4" variant="outline">
                  <Link to="/dashboard/projects">
                    <div className="text-left w-full">
                      <div className="flex items-center gap-2 font-medium mb-1">
                        <Folder className="h-4 w-4" />
                        View All Projects
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Manage your website projects
                      </div>
                    </div>
                  </Link>
                </Button>
                <Button asChild className="justify-start h-auto p-4" variant="outline">
                  <Link to="/dashboard/workspaces">
                    <div className="text-left w-full">
                      <div className="flex items-center gap-2 font-medium mb-1">
                        <Users className="h-4 w-4" />
                        Team Settings
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Invite and manage team members
                      </div>
                    </div>
                  </Link>
                </Button>
                <Button className="justify-start h-auto p-4" variant="outline" disabled>
                  <div className="text-left w-full">
                    <div className="flex items-center gap-2 font-medium mb-1">
                      <LinkSimple className="h-4 w-4" />
                      Import Website
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Transform an existing website
                    </div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              {recentProjects.length > 0 && <RecentProjects projects={recentProjects} />}
              {activities.length > 0 && <ActivityFeed activities={activities} />}
            </div>
            <div className="space-y-6">
              {pendingActions.length > 0 && <PendingActions actions={pendingActions} />}
            </div>
          </div>
        </>
      )}

      {workspaces.length > 1 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Your Workspaces</h3>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {workspaces.map((workspace) => (
              <Card
                key={workspace.id}
                className={
                  currentWorkspace?.id === workspace.id ? "ring-2 ring-primary" : ""
                }
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{workspace.name}</h4>
                      <Badge variant="secondary" className="text-xs">
                        {workspace.role}
                      </Badge>
                    </div>
                    {currentWorkspace?.id !== workspace.id && (
                      <Button variant="outline" size="sm">
                        Switch
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
