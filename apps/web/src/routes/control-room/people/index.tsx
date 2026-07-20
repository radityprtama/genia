import { createFileRoute } from "@tanstack/react-router"
import { adminListPeople } from "@/server/actions/control-room"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Separator } from "@workspace/ui/components/separator"
import { PromoteOperatorForm } from "@/components/control-room/people/promote-operator-form"
import { PeopleTable } from "@/components/control-room/people/people-table"

export const Route = createFileRoute("/control-room/people/")({
  loader: async () => adminListPeople(),
  component: ControlRoomPeoplePage,
  head: () => ({
    meta: [{ title: "People & roles - Control room - Genia" }],
  }),
})

function ControlRoomPeoplePage() {
  const people = Route.useLoaderData()

  return (
    <div className="space-y-10">
      <section id="promote-operator" className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            People & roles
          </h1>
          <p className="text-sm text-muted-foreground">
            Promote trusted teammates into operator roles, manage elevated
            access, and keep the platform secure.
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Promote an operator
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PromoteOperatorForm />
          </CardContent>
        </Card>
      </section>

      <Separator />

      <section id="manage-operators" className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold leading-tight">Operators</h2>
          <p className="text-sm text-muted-foreground">
            Toggle platform permissions or demote operators when access is no
            longer needed.
          </p>
        </div>
        <PeopleTable initialPeople={people} />
      </section>
    </div>
  )
}
