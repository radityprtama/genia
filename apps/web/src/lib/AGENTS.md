# apps/web/src/lib — AGENTS.md

Shared utilities and infrastructure layer.

## Key Files

- `auth.ts` — Better-auth server config, `getCurrentUser()` helper
- `auth-client.ts` — Client auth hooks (`useSession`, `signIn`, `signUp`)
- `prisma.ts` — Prisma client singleton with Accelerate extension
- `utils.ts` — Shared utility functions

## Subdirectories

| Dir | Purpose |
|-----|---------|
| `email/` | React Email templates |
| `hooks/` | Shared hooks |
| `blog/` | Blog content utils |
| `affiliates/` | Affiliate logic |
| `billing/` | Stripe billing |
| `publish/` | Site publishing |
| `stripe/` | Stripe client |
| `subdomain/` | Subdomain management |
| `vercel/` | Vercel deployment |
| `workflows/` | Background workflows |

## Conventions

- Always import via `@/lib/...` path alias
- Prisma client: singleton export from `prisma.ts`, never direct Prisma calls
