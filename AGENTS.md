# Genia — Project Knowledge Base

**Generated:** 2026-07-21

AI-powered website builder for agencies. TanStack Start monorepo.

## Structure

```
genia/
├── apps/web/           # Main web app (TanStack Start + Vite)
│   ├── src/routes/     # TanStack Router file routes
│   ├── src/components/ # React components (feature-grouped)
│   ├── src/lib/        # Auth, Prisma, email, utils
│   ├── src/server/actions/ # Server actions (createServerFn)
│   ├── src/atoms/      # Jotai state
│   ├── src/hooks/      # React hooks
│   └── src/emails/     # React Email templates
├── packages/ui/        # Shared UI component library (shadcn/ui)
├── prisma/             # Schema + migrations
└── content/            # MDX blog/docs
```

## Where to Look

| Task | Location |
|------|----------|
| Auth (server) | `apps/web/src/lib/auth.ts` |
| Auth (client) | `apps/web/src/lib/auth-client.ts` |
| DB queries | `apps/web/src/lib/prisma.ts` |
| Server actions | `apps/web/src/server/actions/` |
| Route definitions | `apps/web/src/routes/` |
| UI components | `packages/ui/src/components/` |
| Feature components | `apps/web/src/components/` |
| Copy/writing | `apps/web/src/config/` |
| Emails | `apps/web/src/emails/` |

## Conventions

- **Server actions**: `createServerFn({ method: "POST" }).validator(...).handler(...)` pattern
- **Auth**: `auth.api.getSession({ headers: await getRequestHeaders() })` server-side
- **Imports**: `@/*` maps to `./src/*`, `@workspace/ui/*` maps to `../../packages/ui/src/*`
- **Prisma**: `--no-engine` flag required for generate/migrate
- **CSS**: Tailwind v4 (`@tailwindcss/vite` plugin)
- **Format**: `verbatimModuleSyntax` — type-only imports must use `import type`

## Commands

```bash
cd apps/web && bun run dev
cd apps/web && bun run build
cd apps/web && bun run typecheck
```

## Notes

- LSP server not installed — typecheck via `tsc --noEmit` only
- No test framework configured — zero test files found
- 760 tracked files, ~50k lines TypeScript
- Build passes clean (11.3s), 351 pre-existing typecheck errors
