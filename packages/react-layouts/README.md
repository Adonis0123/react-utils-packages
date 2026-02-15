# @adonis-kit/react-layouts

Declarative layout composition for React with dual-runtime entry points for Next.js App Router style architectures.

## Install

```bash
# npm
npm install @adonis-kit/react-layouts

# yarn
yarn add @adonis-kit/react-layouts

# pnpm
pnpm add @adonis-kit/react-layouts

# bun
bun add @adonis-kit/react-layouts
```

> Peer dependency: `react >= 16.9.0`

### shadcn registry

```bash
pnpm dlx shadcn@latest add https://adonis-kit.vercel.app/r/react-layouts.json
```

## Entry Points

| Entry | Runtime | Purpose |
|---|---|---|
| `@adonis-kit/react-layouts` | Client | Default client entry for backward compatibility |
| `@adonis-kit/react-layouts/client` | Client | Explicit client entry (`withLayouts`, `useLayoutProps`, `useAllLayoutProps`) |
| `@adonis-kit/react-layouts/server` | Server | Explicit server entry (`withServerLayouts`, `ServerLayoutComponent`) |

## Quick Start

### Client Example

```tsx
'use client'

import { withLayouts, useAllLayoutProps, useLayoutProps } from '@adonis-kit/react-layouts/client'

const Page: React.FC<{ title: string }> = ({ title }) => <h2>{title}</h2>

const Header: React.FC<React.PropsWithChildren> = ({ children }) => {
  const title = useLayoutProps(Page)?.title ?? 'Untitled'
  return (
    <div>
      <header>{title}</header>
      <main>{children}</main>
    </div>
  )
}

const Inspector: React.FC<React.PropsWithChildren> = ({ children }) => {
  const latest = useLayoutProps<{ title: string }>()
  const allProps = useAllLayoutProps()

  return (
    <section>
      <small>
        Latest title: {latest?.title ?? 'Untitled'} | Known props entries: {allProps.size}
      </small>
      {children}
    </section>
  )
}

export const App = withLayouts(Page, [Header, Inspector])
```

### Server Example

```tsx
import { withServerLayouts, type ServerLayoutComponent } from '@adonis-kit/react-layouts/server'

type PageProps = { title: string }

const Page = async ({ title }: PageProps) => <article>{title}</article>

const serverPageLayout: ServerLayoutComponent<PageProps> = async ({
  children,
  pageProps,
  allLayoutProps,
  getLayoutProps,
}) => {
  const fromPage = getLayoutProps(Page)?.title
  const latest = getLayoutProps<PageProps>()?.title
  const hasPage = allLayoutProps.has(Page)

  return (
    <section data-has-page={String(hasPage)}>
      <h1>{pageProps.title}</h1>
      <small>
        By component: {fromPage ?? 'n/a'} | Latest: {latest ?? 'n/a'}
      </small>
      {children}
    </section>
  )
}

export const ServerPage = withServerLayouts(Page, [serverPageLayout])
```

## Runtime Matrix

| Feature | Client Component | Server Component |
|---|---|---|
| `withLayouts` | Yes (`/client`) | No |
| `useLayoutProps` | Yes (`/client`) | No |
| `useAllLayoutProps` | Yes (`/client`) | No |
| `withServerLayouts` | No | Yes (`/server`) |
| `ServerLayoutComponent` | No | Yes (`/server`) |
| `getLayoutProps` (layout arg) | No | Yes (`/server`) |
| `allLayoutProps` (layout arg) | No | Yes (`/server`) |

## Next.js App Router Guidance

1. In `layout.tsx` / `page.tsx` (server by default), import from `@adonis-kit/react-layouts/server`.
2. In client islands (`'use client'`), import from `@adonis-kit/react-layouts/client`.
3. Do not use `useLayoutProps` or `useAllLayoutProps` inside server components.
4. Use `withServerLayouts` when you need composition at the server boundary.

## API

### Client API

#### `withLayouts(Page, Layouts, options?)`

Composes a page component with an array of layout wrappers. Layouts nest inside-out.

#### `useLayoutProps(component?)`

Reads a specific component props object (or latest props when no argument is passed) from the nearest client layout context.

#### `useAllLayoutProps()`

Returns all component props as `ReadonlyMap<ComponentType, unknown>`.

### Server API

#### `withServerLayouts(Page, Layouts, options?)`

Composes a server page with server layouts. Each layout receives:

```ts
{
  children: React.ReactNode
  pageProps: PageProps
  allLayoutProps: ReadonlyMap<AnyServerComponent, unknown>
  getLayoutProps: {
    <T = unknown>(): T | undefined
    <C extends AnyServerComponent>(component: C): unknown | undefined // inferred from C in TS
  }
}
```

`getLayoutProps(component)` returns `undefined` when the component is missing.  
`getLayoutProps()` (no args) returns the latest props in the current server composition chain.

Supports async page and async layouts.

#### `ServerLayoutComponent<PageProps>`

Type helper for server layout components that accept `children`, `pageProps`, `allLayoutProps`, and `getLayoutProps`.

Recommended pattern:

```tsx
const serverPageLayout: ServerLayoutComponent<PageProps> = ({ children, pageProps }) => (
  <section>
    <h1>{pageProps.title}</h1>
    {children}
  </section>
)
```

## Migration

### From root import to explicit client entry

```tsx
// Before
import { withLayouts, useLayoutProps } from '@adonis-kit/react-layouts'

// Recommended
import { withLayouts, useLayoutProps } from '@adonis-kit/react-layouts/client'
```

### Add server composition explicitly

```tsx
import { withServerLayouts } from '@adonis-kit/react-layouts/server'
```

### Compatibility

Root import (`@adonis-kit/react-layouts`) stays as the default client entry for compatibility, but explicit subpath imports are recommended for clear runtime boundaries.

## Acknowledgements

This package was originally inspired by [react-dx](https://github.com/yunsii/react-dx). Special thanks to the original author for the foundational ideas.
