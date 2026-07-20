import { createFileRoute, redirect, Link } from "@tanstack/react-router"
import { Suspense } from "react"
import { Filter, Table as TableIcon } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@workspace/ui/components/empty"
import { listWorkspaceSites } from "@/server/actions/site"
import { getCurrentWorkspace } from "@/server/actions/workspace"
import { parseSortParam, toSiteOrderBy } from "@/components/projects/sort"
import {
  DEFAULT_PAGE_SIZE,
  parseLimitParam,
  parsePageParam,
  parseSearchParam,
  parseStatusesParam,
} from "@/components/projects/config"
import ProjectsTable from "@/components/projects/table"
import { MakeTestProjectButton } from "@/components/projects/make-test-project-button"
import type { SiteStatus } from "@prisma/client"

interface ProjectsSearch {
  page?: string
  limit?: string
  sort?: string
  search?: string
  status?: string
}

export const Route = createFileRoute("/dashboard/projects/")({
  component: ProjectsPage,
  validateSearch: (search: Record<string, string | undefined>): ProjectsSearch => ({
    page: search.page,
    limit: search.limit,
    sort: search.sort,
    search: search.search,
    status: search.status,
  }),
  beforeLoad: async () => {
    const workspace = await getCurrentWorkspace()
    if (!workspace) throw redirect({ to: "/onboarding" })
    return { workspace }
  },
  loader: async ({ context, search }) => {
    const { workspace } = context
    const page = parsePageParam(search.page, 1)
    const limit = parseLimitParam(search.limit, DEFAULT_PAGE_SIZE)
    const offset = (page - 1) * limit
    const sortDescriptors = parseSortParam(search.sort)
    const orderBy = toSiteOrderBy(sortDescriptors)
    const searchQ = parseSearchParam(search.search)
    const statuses = parseStatusesParam(search.status)

    const data = await listWorkspaceSites({
      workspaceId: workspace.id,
      limit,
      offset,
      search: searchQ || undefined,
      statuses: (statuses?.length ? statuses : undefined) as SiteStatus[] | undefined,
      sort: orderBy,
    })

    return {
      workspaceId: workspace.id,
      data,
      page,
      limit,
      sort: sortDescriptors,
      search: searchQ,
      statusFilter: statuses,
      hasActiveFilters: Boolean(searchQ) || statuses.length > 0,
    }
  },
  head: () => ({ meta: [{ title: "Projects" }] }),
})

function ProjectsPage() {
  const { workspaceId, data, page, limit, sort, search, statusFilter, hasActiveFilters } =
    Route.useLoaderData()

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground mt-1">
            Manage the websites your workspace is building.
          </p>
        </div>
        <MakeTestProjectButton workspaceId={workspaceId} />
      </div>

      {data.rows.length === 0 ? (
        hasActiveFilters ? (
          <FilteredProjectsState />
        ) : (
          <EmptyProjectsState workspaceId={workspaceId} />
        )
      ) : (
        <ProjectsTable
          rows={data.rows}
          total={data.total}
          page={page}
          pageSize={limit}
          sort={sort}
          search={search}
          statusFilter={statusFilter}
          workspaceId={workspaceId}
        />
      )}
    </div>
  )
}

function EmptyProjectsState({ workspaceId }: { workspaceId: string }) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <TableIcon className="h-6 w-6" />
        </EmptyMedia>
        <EmptyTitle>No projects to display</EmptyTitle>
        <EmptyDescription>
          There are no projects yet. Seed a mock project to explore the workflow before inviting a client.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <MakeTestProjectButton workspaceId={workspaceId} />
      </EmptyContent>
    </Empty>
  )
}

function FilteredProjectsState() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Filter className="h-6 w-6" />
        </EmptyMedia>
        <EmptyTitle>No items match your filters</EmptyTitle>
        <EmptyDescription>
          Try adjusting your filters to see more results.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button asChild variant="outline">
          <Link to="/dashboard/projects">Clear filters</Link>
        </Button>
      </EmptyContent>
    </Empty>
  )
}
