# apps/web/src/server/actions — AGENTS.md

TanStack Start server actions. Business logic layer using `createServerFn`.

## Actions

| File | Purpose |
|------|---------|
| `workspace.ts` | CRUD, switch, member management |
| `user.ts` | User profile and settings |
| `site.ts` | Site/project operations |
| `projects.ts` | Project CRUD |
| `dashboard.ts` | Dashboard data aggregation |
| `onboarding.ts` | First-time onboarding flow |
| `affiliate.ts` | Affiliate program logic |
| `control-room.ts` | Admin operations |
| `prospect.ts` | Prospect management |
| `prospect-details.ts` | Prospect detail operations |
| `domain.ts` | Domain management |
| `email.ts` | Email sending |
| `billing.ts` | Billing operations |

## Conventions

- Pattern: `createServerFn({ method: "POST" }).validator(z.whatever()).handler(async ({ data }) => { ... })`
- Always validate auth first: `getRequestHeaders()` + `auth.api.getSession()`
- Return serializable data only
- Use `router.invalidate()` for cache invalidation (not `revalidatePath`)

## Gotchas

- `validator()` wraps input — access via `.data` in handler
- Server actions run on server only — no window/`document` access
