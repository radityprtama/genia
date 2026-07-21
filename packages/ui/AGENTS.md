# packages/ui — AGENTS.md

Shared UI component library. shadcn/ui + Radix primitives + Tailwind v4.

## Structure

```
components/
├── ai-elements/    (28)   # AI builder UI components
├── blog/           (22)   # Blog components + icons
├── pitch/          (14)   # Pitch deck components
├── logos/          (13)   # Logo components
├── marketing/      (7)    # Marketing page components
│   └── sections/   (11)   # Marketing section templates
├── charts/         (8)    # Chart components (recharts)
├── illustrations/  (7)    # SVG illustrations
├── kibo-ui/        # Custom UI primitives
└── (root)          (57+)  # shadcn/ui primitives (button, card, etc.)
```

## Conventions

- Import via `@workspace/ui/components/...` path alias
- All components use `cn()` from `packages/ui/src/lib/utils.ts` for class merging
- Tailwind v4 (no `@apply` — direct classes)
- Component props extend Radix variants where applicable

## Notes

- chart.tsx has known typing issues (payload/label access on recharts types)
- sidebar.tsx needs type-only import fix for `VariantProps`
