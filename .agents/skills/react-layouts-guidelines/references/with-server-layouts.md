# withServerLayouts Server Reference

## When to Use

- You are composing layouts in Server Components.
- You need server-side access to page/layout props through runtime helpers.
- You need async page/layout support.

## Standard Pattern

```tsx
import React from 'react'
import {
  withServerLayouts,
  type ServerComponent,
  type ServerLayoutComponent,
} from '@adonis-kit/react-layouts/server'

type PageProps = {
  title: string
  slug: string
}

type PageComponent = ServerComponent<PageProps> & {
  routeMeta?: { auth: boolean }
}

const Page = (async ({ title }: PageProps) => <article>{title}</article>) as PageComponent
Page.routeMeta = { auth: true }

const MissingComponent: ServerComponent<{ id: string }> = async () => null

const ServerLayout: ServerLayoutComponent<PageProps> = async ({
  children,
  pageProps,
  allLayoutProps,
  getLayoutProps,
}) => {
  const byComponent = getLayoutProps(Page)
  const latest = getLayoutProps<PageProps>()
  const missing = getLayoutProps(MissingComponent)

  return (
    <section
      data-title={pageProps.title}
      data-by-component={byComponent?.title}
      data-latest={latest?.title}
      data-missing={String(missing === undefined)}
      data-has-page={String(allLayoutProps.has(Page))}
    >
      {children}
    </section>
  )
}

export const ComposedServerPage = withServerLayouts(Page, [ServerLayout], {
  propertiesHoist: ['routeMeta'] as const,
})
```

## Core Semantics

1. Composition order is inside-out.
- `withServerLayouts(Page, [Layout1, Layout2])` renders as `Layout2 -> Layout1 -> Page`.

2. Runtime access semantics.
- `pageProps` is the props passed to the composed `Page` component, directly forwarded to every layout in the chain as a typed, read-only reference.
- `allLayoutProps` is a read-only map.
- `getLayoutProps(component)` returns that component props or `undefined`.
- `getLayoutProps()` without args returns latest props in the current server chain.

3. Chain visibility rule.
- Child chain can see parent wrapped component props.
- Parent chain cannot read child page props (`undefined`).

4. Async support.
- Both `Page` and `ServerLayoutComponent` may be async.

5. Naming and static hoist behavior.
- Anonymous layouts get `displayName` at execution time.
- `propertiesHoist` can copy static fields that exist on `Page`.

## Common Mistakes and Fixes

1. Mistake: using client hooks (`useLayoutProps`, `useAllLayoutProps`) in server files.
- Fix: use `getLayoutProps` and `allLayoutProps`.

2. Mistake: importing `withServerLayouts` from client entry.
- Fix: import from `@adonis-kit/react-layouts/server` only.

3. Mistake: expecting parent layout to read child page props.
- Fix: align logic with chain visibility rules.

## Example Prompt and Expected Output

Prompt: "Compose Next.js server page layouts and read chain props."

Expected response should:
- Import from `@adonis-kit/react-layouts/server`.
- Use `pageProps`, `allLayoutProps`, and `getLayoutProps` in layout args.
- Explain missing lookup returns `undefined`.
- Include at least one `data-*` assertion point.

## Checklist

- Is the import path `/server`?
- Are client hooks avoided?
- Is inside-out order verified?
- Are `undefined` branches handled for `getLayoutProps`?
- Is `allLayoutProps` treated as read-only?
