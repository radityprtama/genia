# apps/web/src/routes — AGENTS.md

TanStack Router route definitions. File-based routing under `apps/web/src/routes/`.

## Route Groups

| Group | URL Path | Purpose |
|-------|----------|---------|
| `__root.tsx` | `/` | Root layout (all pages) |
| `_auth/` | `/auth/*` | Sign-in, sign-up, reset-password, 2FA |
| `_marketing/` | `/` | Landing, brand, blog pages |
| `dashboard/` | `/dashboard/*` | Projects, billing, workspaces (protected) |
| `builder/` | `/builder` | AI builder (mock placeholder) |
| `onboarding/` | `/onboarding` | First-time user onboarding |
| `control-room/` | `/control-room/*` | Admin panel |
| `preview/` | `/preview/*` | Public site previews |
| `affiliate/` | `/affiliate/*` | Affiliate program |

## Conventions

- Underscore-prefixed dirs = layout route groups (`_auth/`, `_marketing/`)
- Route groups don't affect URL path
- `$param` = dynamic route param, `{param}` = parallel route
- Layout files: `<group>.tsx` at group root (e.g. `_auth.tsx`)
