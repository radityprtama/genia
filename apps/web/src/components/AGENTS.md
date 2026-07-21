# apps/web/src/components — AGENTS.md

Feature-grouped React components.

## Subdirectories

| Dir | Files | Purpose |
|-----|-------|---------|
| `affiliate/` | 10 | Affiliate dashboard, onboarding, brand assets |
| `projects/` | 11 | Project listings, detail, filters |
| `prospects/` | 9 | Prospect management |
| `dashboard/` | 7 | Dashboard widgets, stats |
| `pitch/` | 14 | Pitch management |
| `control-room/` | — | Admin UI (people, settings, workspaces) |
| `auth/` | — | Auth page components |

## Conventions

- Feature-grouped, not type-grouped (no single `buttons/` or `cards/` dir)
- Shared UI primitives live in `packages/ui/`, not here
- Import via `@/components/...` path alias

## Notes

- affiliate components have known TanStack Router type issues (`push` doesn't exist on Router, missing `to` prop)
- auth-page uses `priority` prop on `<img>` — TanStack Start's `<img>` doesn't support it (use `<Link>` + preload instead)
