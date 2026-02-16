# withLayouts Client Reference

## When to Use

- The target file is a Client Component (`'use client'`).
- You need to read `Page` props inside layouts via hooks.
- You need `useLayoutProps` or `useAllLayoutProps`.

## Standard Pattern

```tsx
'use client'

import React from 'react'
import { withLayouts, useAllLayoutProps, useLayoutProps } from '@adonis-kit/react-layouts/client'

type PageProps = {
  title: string
  count: number
}

type PageComponent = React.FC<PageProps> & {
  routeMeta?: { auth: boolean }
}

const Page = (({ title, count }: PageProps) => (
  <article>
    {title}:{count}
  </article>
)) as PageComponent

Page.routeMeta = { auth: true }

const Header: React.FC<React.PropsWithChildren> = ({ children }) => {
  const pageProps = useLayoutProps(Page)
  return <section data-title={pageProps?.title ?? 'Untitled'}>{children}</section>
}

const Inspector: React.FC<React.PropsWithChildren> = ({ children }) => {
  const latest = useLayoutProps<PageProps>()
  const all = useAllLayoutProps()

  return (
    <div data-latest-count={String(latest?.count)} data-has-page={String(all.has(Page))}>
      {children}
    </div>
  )
}

export const ComposedPage = withLayouts(Page, [Header, Inspector], {
  propertiesHoist: ['routeMeta'] as const,
})
```

## Core Semantics

1. Composition order is inside-out.
- `withLayouts(Page, [Layout1, Layout2])` renders as `Layout2 -> Layout1 -> Page`.

2. Props lookup semantics.
- `useLayoutProps(component)` returns props for that component or `undefined`.
- `useLayoutProps()` without args returns the latest props in the current chain.
- `useAllLayoutProps()` returns a `ReadonlyMap`.

3. Missing component behavior.
- Lookup returns `undefined`, never throws.

4. Static property hoisting.
- `propertiesHoist` keys must exist on `Page` and be type-safe.
- Invalid keys should fail at TypeScript level.

## Common Mistakes and Fixes

1. Mistake: using `useLayoutProps` in a Server Component.
- Fix: switch to `withServerLayouts` and `getLayoutProps`.

2. Mistake: importing from the wrong entry (e.g., using `/server` in Client Components or vice versa).
- Fix: import client APIs from `@adonis-kit/react-layouts/client` or root entry `@adonis-kit/react-layouts` (both are equivalent). Import server APIs only from `@adonis-kit/react-layouts/server`.

3. Mistake: misunderstanding layout order.
- Fix: remember array tail is the outer layout.

## Example Prompt and Expected Output

Prompt: "Wrap my page with `withLayouts` and read `Page` title in a header."

Expected response should:
- Keep `'use client'`.
- Import from `@adonis-kit/react-layouts/client`.
- Use `useLayoutProps(Page)?.title` in the layout.
- Include at least one `data-*` assertion point.

## Checklist

- Is the file a Client Component?
- Is the import path `/client` or root entry (both are equivalent)?
- Is composition order verified?
- Are `undefined` branches handled?
- Is `useAllLayoutProps()` treated as read-only?
