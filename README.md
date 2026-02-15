# adonis-kit

A pnpm monorepo for publishing reusable React utilities and a personal shadcn registry.

## Packages

| Package | Description | Distribution |
|---------|-------------|-------------|
| `@adonis-kit/react-layouts` | React layout composition with dual runtime entries (`/client`, `/server`) | npm + shadcn registry |
| `@adonis-kit/ui` | shadcn-style UI primitives (Button, Card) | npm + shadcn registry |

## `@adonis-kit/react-layouts` API Notes

- `@adonis-kit/react-layouts` is the default client entry for backward compatibility.
- `@adonis-kit/react-layouts/client` is the explicit client entry (`withLayouts`, `useLayoutProps`, `useAllLayoutProps`).
- `@adonis-kit/react-layouts/server` is the explicit server entry (`withServerLayouts`, `ServerLayoutComponent`).
- `useLayoutProps` and `useAllLayoutProps` are client-only APIs and must be used inside client components.
- In server layouts, `allLayoutProps` and `getLayoutProps` are injected via `ServerLayoutComponent` props.

Client usage:

```tsx
'use client'

import { withLayouts, useAllLayoutProps, useLayoutProps } from '@adonis-kit/react-layouts/client'

const Page: React.FC<{ title: string }> = ({ title }) => <h2>{title}</h2>

const Layout: React.FC<React.PropsWithChildren> = ({ children }) => {
  const pageProps = useLayoutProps(Page)
  const allProps = useAllLayoutProps()
  return (
    <div data-layout-count={allProps.size}>
      <header>{pageProps?.title ?? 'Untitled'}</header>
      {children}
    </div>
  )
}

export const ClientPage = withLayouts(Page, [Layout])
```

Server usage:

```tsx
import { withServerLayouts, type ServerLayoutComponent } from '@adonis-kit/react-layouts/server'

type PageProps = { title: string }

const Page = async ({ title }: PageProps) => <article>{title}</article>

const serverPageLayout: ServerLayoutComponent<PageProps> = ({
  children,
  pageProps,
  allLayoutProps,
  getLayoutProps,
}) => {
  const latest = getLayoutProps<PageProps>()?.title
  const fromPage = getLayoutProps(Page)?.title

  return (
    <section data-has-page={String(allLayoutProps.has(Page))}>
      <h1>{pageProps.title}</h1>
      <small>{latest ?? fromPage ?? 'n/a'}</small>
      {children}
    </section>
  )
}

export const ServerPage = withServerLayouts(Page, [serverPageLayout])
```

## Apps

- `web` — Next.js 15 showcase + shadcn registry host ([adonis-kit.vercel.app](https://adonis-kit.vercel.app))

## shadcn Registry

### URL mode

```bash
pnpm dlx shadcn@latest add https://adonis-kit.vercel.app/r/button.json
pnpm dlx shadcn@latest add https://adonis-kit.vercel.app/r/card.json
pnpm dlx shadcn@latest add https://adonis-kit.vercel.app/r/react-layouts.json
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
pnpm dlx shadcn@latest add @adonis-kit/react-layouts
```

## npm Distribution

```bash
pnpm add @adonis-kit/ui
pnpm add @adonis-kit/react-layouts
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
  - `https://adonis-kit.vercel.app/r/react-layouts.json`
