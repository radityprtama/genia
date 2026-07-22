import { createFileRoute, redirect } from "@tanstack/react-router"
import { getCurrentUser } from "@/server/actions/user"
import { resolveRedirectParam } from "@/lib/auth/redirect"
import { AuthPage } from "@/components/auth/auth-page"

interface AuthSearch {
  prompt?: string
  next?: string
  mode?: string
}

export const Route = createFileRoute("/_auth/auth")({
  validateSearch: (search: Record<string, unknown>): AuthSearch => ({
    prompt: search.prompt as string | undefined,
    next: search.next as string | undefined,
    mode: search.mode as string | undefined,
  }),
  beforeLoad: async ({ search }) => {
    const user = await getCurrentUser()
    if (user) {
      const s = search as AuthSearch
      const prompt = s.prompt
      const urlParams = new URLSearchParams()
      if (prompt) urlParams.set("prompt", prompt)
      const defaultDestination = urlParams.size
        ? `/dashboard?${urlParams.toString()}`
        : "/dashboard"
      const destination = s.next
        ? resolveRedirectParam(s.next, defaultDestination)
        : defaultDestination
      throw redirect({ to: destination })
    }
  },
  component: AuthPage,
  head: () => ({
    meta: [{ title: "Sign In - Genia" }],
  }),
})
