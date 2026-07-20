import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import {
  Folder,
  Users,
  Globe,
  Sparkle,
  ArrowRight,
} from "@phosphor-icons/react";
import type { DashboardStats } from "@/server/actions/dashboard";

type StatsCardsProps = {
  stats: DashboardStats;
};

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Sites</CardTitle>
          <Folder className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeSites}</div>
          <p className="text-xs text-muted-foreground">
            {stats.activeSites === 0
              ? "Create your first site"
              : stats.activeSites === 1
                ? "1 active project"
                : `${stats.activeSites} active projects`}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Team Members</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.teamMembers}</div>
          <p className="text-xs text-muted-foreground">
            {stats.teamMembers === 1
              ? "Just you for now"
              : `${stats.teamMembers} team members`}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Live Websites</CardTitle>
          <Globe className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.liveSites}</div>
          <p className="text-xs text-muted-foreground">
            {stats.liveSites === 0
              ? "No live sites yet"
              : stats.liveSites === 1
                ? "1 site deployed"
                : `${stats.liveSites} sites deployed`}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
          <Sparkle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeSessions}</div>
          <p className="text-xs text-muted-foreground">
            {stats.activeSessions === 0
              ? "No active builds"
              : stats.activeSessions === 1
                ? "1 builder session"
                : `${stats.activeSessions} builder sessions`}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Actions</CardTitle>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.pendingTransfers}</div>
          <p className="text-xs text-muted-foreground">
            {stats.pendingTransfers === 0
              ? "All caught up"
              : stats.pendingTransfers === 1
                ? "1 item needs attention"
                : `${stats.pendingTransfers} items need attention`}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
