import { Suspense } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { ResetPasswordForm } from "@/components/auth/reset-password-form"

export const Route = createFileRoute("/_auth/reset-password")({
  component: ResetPasswordPage,
  head: () => ({
    meta: [{ title: "Reset Password - Genia" }],
  }),
})

function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  )
}
