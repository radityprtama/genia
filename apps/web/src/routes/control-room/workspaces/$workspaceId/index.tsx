import { createFileRoute, Link, notFound } from "@tanstack/react-router"
import { adminGetWorkspaceDetails } from "@/server/actions/control-room"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Separator } from "@workspace/ui/components/separator"
import { cn } from "@workspace/ui/lib/utils"
import { WorkspaceMembersManager } from "@/components/control-room/workspaces/workspace-members"

export const Route = createFileRoute(
  "/control-room/workspaces/$workspaceId/",
)({
  loader: async ({ params }) => {
    try {
      return await adminGetWorkspaceDetails(params.workspaceId)
    } catch {
      throw notFound()
    }
  },
  component: WorkspaceDetailPage,
  head: ({ loaderData }) => ({
    meta: [
      {
        title: `${loaderData.workspace.name} - Control room - Genia`,
      },
    ],
  }),
})

function WorkspaceDetailPage() {
  const { workspace, members, invites } = Route.useLoaderData()

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link
              to="/control-room/workspaces"
              className="hover:underline"
            >
              Workspaces
            </Link>
            <span aria-hidden="true">/</span>
            <span>{workspace.slug}</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {workspace.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage membership, roles, and workspace metadata.
          </p>
        </div>
        {workspace.archivedAt ? (
          <Badge variant="secondary" className="self-start">
            Archived
          </Badge>
        ) : (
          <Badge className="self-start">Active</Badge>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Workspace metadata
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <MetadataItem label="Slug" value={workspace.slug} />
          <MetadataItem
            label="Business name"
            value={workspace.businessName}
          />
          <MetadataItem
            label="Business email"
            value={workspace.businessEmail}
          />
          <MetadataItem
            label="Business phone"
            value={workspace.businessPhone}
          />
          <MetadataItem
            label="Members"
            value={`${workspace._count.members.toLocaleString()}`}
          />
          <MetadataItem
            label="Sites"
            value={`${workspace._count.sites.toLocaleString()}`}
          />
        </CardContent>
      </Card>

      <Separator />

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold leading-tight">People</h2>
          <p className="text-sm text-muted-foreground">
            Invite teammates, adjust roles, and revoke access in a single view.
          </p>
        </div>
        <WorkspaceMembersManager
          workspaceId={workspace.id}
          initialMembers={members}
          initialInvites={invites}
        />
      </section>
    </div>
  )
}

function MetadataItem({
  label,
  value,
}: {
  label: string
  value: string | null
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "text-sm text-foreground",
          !value && "text-muted-foreground",
        )}
      >
        {value ?? "Not provided"}
      </p>
    </div>
  )
}
