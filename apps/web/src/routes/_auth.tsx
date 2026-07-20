import { Outlet, createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_auth")({
  component: AuthLayout,
})

function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Outlet />
    </div>
  )
}
