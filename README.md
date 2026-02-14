# adonis-kit

A pnpm monorepo for publishing reusable React utilities and a personal shadcn registry.

## Packages

| Package | Description | Distribution |
|---------|-------------|-------------|
| `@adonis-kit/layouts` | Layout composition via HOC (`withLayouts`, `useLayoutProps`) | npm + shadcn registry |
| `@adonis-kit/ui` | shadcn-style UI primitives (Button, Card) | npm + shadcn registry |

## Apps

- `web` — Next.js 15 showcase + shadcn registry host ([adonis-kit.vercel.app](https://adonis-kit.vercel.app))

## shadcn Registry

### URL mode

```bash
pnpm dlx shadcn@latest add https://adonis-kit.vercel.app/r/button.json
pnpm dlx shadcn@latest add https://adonis-kit.vercel.app/r/card.json
pnpm dlx shadcn@latest add https://adonis-kit.vercel.app/r/layouts.json
```

### Namespace mode

Configure consumer `components.json`:

```json
{
  "registries": {
    "@adonis-kit": "https://adonis-kit.vercel.app/r/{name}.json"
  }
}
```

Then install:

```bash
pnpm dlx shadcn@latest add @adonis-kit/button
pnpm dlx shadcn@latest add @adonis-kit/card
pnpm dlx shadcn@latest add @adonis-kit/layouts
```

## npm Distribution

```bash
pnpm add @adonis-kit/ui
pnpm add @adonis-kit/layouts
```

## Commands

```bash
pnpm build              # Turbo builds all packages/apps
pnpm test               # Runs tests across workspaces
pnpm lint               # Type-check-based lint
pnpm typecheck          # Full workspace type checks
pnpm dev                # Starts all dev tasks in parallel
pnpm dev:web            # Next.js dev server only
pnpm build:web          # Build web app only
pnpm registry:build     # Build shadcn registry JSON to apps/web/public/r/
pnpm changeset          # Create changeset for publishable changes
pnpm version-packages   # Apply changesets to bump versions
pnpm release            # Publish to npm (public access)
```

## Vercel Setup

- Project Root Directory: `apps/web`
- Build Command: `pnpm turbo run build --filter=web`
- Registry endpoints:
  - `https://adonis-kit.vercel.app/registry.json`
  - `https://adonis-kit.vercel.app/r/button.json`
  - `https://adonis-kit.vercel.app/r/card.json`
  - `https://adonis-kit.vercel.app/r/layouts.json`
