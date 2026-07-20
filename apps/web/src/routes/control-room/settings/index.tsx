import { createFileRoute } from "@tanstack/react-router"
import { adminListPlatformSettings } from "@/server/actions/control-room"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Separator } from "@workspace/ui/components/separator"
import { CreateSettingForm } from "@/components/control-room/settings/create-setting-form"
import { SettingsTable } from "@/components/control-room/settings/settings-table"

export const Route = createFileRoute("/control-room/settings/")({
  loader: async () => adminListPlatformSettings(),
  component: ControlRoomSettingsPage,
  head: () => ({
    meta: [{ title: "Platform settings - Control room - Genia" }],
  }),
})

function ControlRoomSettingsPage() {
  const settings = Route.useLoaderData()

  return (
    <div className="space-y-10">
      <section id="create-setting" className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Platform settings
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage feature flags, operational toggles, and platform-wide
            configuration with full audit control.
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Create setting
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CreateSettingForm />
          </CardContent>
        </Card>
      </section>

      <Separator />

      <section id="manage-settings" className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold leading-tight">
            Existing settings
          </h2>
          <p className="text-sm text-muted-foreground">
            Every value is stored as JSON. Use this list to review and adjust
            configuration safely.
          </p>
        </div>
        <SettingsTable initialSettings={settings} />
      </section>
    </div>
  )
}
