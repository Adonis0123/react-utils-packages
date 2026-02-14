# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

pnpm monorepo for publishing reusable React utility packages and a personal shadcn component registry. Uses Turborepo for orchestration, Changesets for versioning/publishing.

## Commands

All commands run from monorepo root:

```bash
pnpm build                          # Turbo builds all packages/apps
pnpm test                           # Runs tests across workspaces
pnpm lint                           # Type-check-based lint
pnpm typecheck                      # Full workspace type checks
pnpm dev                            # Starts all dev tasks in parallel
pnpm dev:web                        # Next.js dev server only
pnpm build:web                      # Build web app only

# Per-package commands
pnpm -C packages/layouts test       # Vitest for @adonis-kit/layouts
pnpm -C packages/layouts dev        # Vite demo server (port 5174)
pnpm -C packages/ui build           # Bundle UI with tsup

# Release workflow
pnpm changeset                      # Create changeset for publishable changes
pnpm version-packages               # Apply changesets to bump versions
pnpm release                        # Publish to npm (public access)

# Registry
pnpm registry:build                 # Build shadcn registry JSON to apps/web/public/r/
```

## Architecture

```
├── packages/
│   ├── layouts/          # @adonis-kit/layouts — React layout composition (Vite + Vitest)
│   └── ui/               # @adonis-kit/ui — shadcn-style components (tsup)
├── apps/
│   └── web/              # Next.js 15 showcase + shadcn registry host
├── registry/             # shadcn component source files for distribution
│   └── new-york/ui/      # Components matching @adonis-kit/ui
└── .ruler/               # Ruler config — generates CLAUDE.md and AGENTS.md
```

### packages/layouts

Layout composition utility using higher-order components. Core API:
- `withLayouts(Page, [Layout1, Layout2], options)` — wraps a page component with nested layouts
- `usePageProps<T>(component?)` — access page props via context
- `useAllPageProps()` — access all page props map

Build: `tsc` (declarations) + `vite` (ESM library with preserveModules). Tests: Vitest with `@testing-library/react`. Peer dep: React >= 16.9.0.

### packages/ui

shadcn-style UI primitives (Button, Card). Build: `tsup` (ESM + declarations). Dependencies: `class-variance-authority`, `clsx`, `tailwind-merge`. Peer deps: React >= 18.2.0.

Utility: `cn()` in `src/lib/utils.ts` merges Tailwind classes via `clsx` + `twMerge`.

### apps/web

Next.js 15 (App Router, React 19, Tailwind CSS 4). Consumes workspace packages via `transpilePackages` config. Hosts shadcn registry at `/r/{name}.json`. Deployment: Vercel with root directory `apps/web`.

### registry/

Source components for shadcn CLI distribution. Configured in root `registry.json`. Consumers install via:
```bash
pnpm dlx shadcn@latest add https://adonis-kit.vercel.app/r/button.json
```

## Coding Conventions

- TypeScript + React, ESM-only (`"type": "module"`)
- 2-space indentation, single quotes, minimal semicolons
- Components/types: `PascalCase` — Functions/variables/files: `camelCase`
- Public API must be re-exported from each package's `src/index.ts`
- Base tsconfig at root: `tsconfig.base.json` (target ESNext, strict, react-jsx)

## Testing

- Framework: Vitest (config in `packages/layouts/vitest.config.ts`)
- Test files: `src/__tests__/**/*.test.ts?(x)`
- Prefer behavior-focused assertions (rendered output, props flow)
- `packages/ui` has no test suite yet — add Vitest tests for non-trivial logic

## Commits & Releases

- Conventional Commits: `feat(layouts):`, `fix(ui):`, `chore(web):`
- Scopes: `layouts`, `ui`, `web`
- Add a Changeset (`pnpm changeset`) for publishable package changes
- Changesets config: public access, no changelog generation, no auto-commit

## Ruler

Rules are managed in `.ruler/`. Run `pnpm run ruler:apply` to regenerate `CLAUDE.md` and `AGENTS.md` from source files. This runs automatically on `postinstall`.
