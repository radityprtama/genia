# Genia

AI-powered website builder for agencies. Built on TanStack Start.

## Stack

- **Framework**: [TanStack Start](https://tanstack.com/start/latest) (React 19, Vite)
- **Routing**: TanStack Router (file-based, under `apps/web/src/routes/`)
- **UI**: `packages/ui/` + shadcn/ui components (Radix primitives, Tailwind v4)
- **Auth**: Better-auth (email/password + Google OAuth)
- **DB**: Prisma (PostgreSQL, `prisma/schema.prisma`)
- **Email**: Resend + React Email
- **ORM**: Prisma + Accelerate extension
- **Build**: Turborepo (bun workspaces)

## Commands

```bash
# Development
cd apps/web && bun run dev          # Vite dev server on port 3000

# Build
bun run build                       # Turbo build (all packages)
cd apps/web && bun run build        # Web app only

# TypeScript
cd apps/web && bun run typecheck    # tsc --noEmit

# Prisma
cd apps/web && bun run prisma:generate   # --no-engine
cd apps/web && bun run prisma:push       # push schema
cd apps/web && bun run prisma:migrate    # migrate deploy

# Lint
cd apps/web && bun run lint         # ESLint
```

## Project Structure

```
genia/
├── apps/web/                       # Main web app (TanStack Start)
│   └── src/
│       ├── routes/                 # TanStack Router file routes
│       │   ├── __root.tsx          # Root layout
│       │   ├── _auth/              # Auth pages (sign-in, sign-up)
│       │   ├── _marketing/         # Public marketing pages
│       │   ├── dashboard/          # Dashboard (protected)
│       │   │   ├── projects/       # Project management
│       │   │   └── billing/        # Billing pages
│       │   ├── builder/            # AI builder mock
│       │   ├── onboarding/         # First-time onboarding
│       │   ├── control-room/       # Admin panel
│       │   ├── preview/            # Public preview
│       │   └── affiliate/          # Affiliate program
│       ├── components/             # React components
│       │   ├── ui/                 # shadcn/ui primitives
│       │   └── (feature folders)   # Feature-specific components
│       ├── lib/                    # Shared utilities
│       │   ├── auth.ts             # Better-auth server config
│       │   ├── auth-client.ts      # Better-auth client config
│       │   ├── prisma.ts           # Prisma client singleton
│       │   └── email/              # Email templates
│       ├── server/actions/         # TanStack server actions
│       ├── atoms/                  # Jotai state atoms
│       ├── hooks/                  # React hooks
│       ├── config/                 # App configuration
│       └── router.tsx              # Router factory
├── packages/
│   └── ui/                         # Shared UI component library
│       └── src/
│           ├── components/         # Reusable UI components
│           ├── hooks/
│           └── styles/
├── prisma/                         # Prisma schema + migrations
└── content/                        # MDX content (blog/docs)
```

## Key Patterns

### Server Actions (TanStack)
```typescript
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

export const myAction = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const session = await auth.api.getSession({
      headers: await getRequestHeaders(),
    });
    if (!session?.user) throw new Error("Unauthorized");
    // ...
  });
```

### Auth
- Server-side: `auth.api.getSession({ headers: await getRequestHeaders() })`
- Client-side: `useSession()` hook from `@/lib/auth-client`
- Middleware: `apps/web/src/middleware.ts` — cookie-based auth redirects

### Env Vars
- `VITE_APP_URL` — public app URL (not `NEXT_PUBLIC_*`)
- All secrets in `.env.local` (never committed)

### Route Groups (TanStack Router)
- `_auth/` — auth pages (sign-in, reset-password, 2FA)
- `_marketing/` — public pages (landing)
- Route files use TanStack Router file conventions (`_auth.tsx` = layout)

## Important
- Prisma generate MUST use `--no-engine` flag
- `typescript: { ignoreBuildErrors: true }` in next config — fix TS issues in CI
- Always verify workspace membership before DB operations
