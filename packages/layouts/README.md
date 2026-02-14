# @react-utils/layouts

React layout composition helpers migrated from `react-dx` (phase 1, no optimization).

## Install

```bash
pnpm add @react-utils/layouts
```

## Usage

```tsx
import { withLayouts, useLayoutProps } from '@react-utils/layouts'

type PageProps = { title: string }

const Page: React.FC<PageProps> = ({ title }) => <div>{title}</div>

const Layout: React.FC<React.PropsWithChildren> = ({ children }) => {
  const props = useLayoutProps(Page)
  const allLayoutProps = useLayoutProps()
  return (
    <section>
      <h1>{props.title}</h1>
      <p>allLayoutProps.size: {allLayoutProps.size}</p>
      {children}
    </section>
  )
}

export const ComposedPage = withLayouts(Page, [Layout])
```

## Breaking Changes (v2)

- `usePageProps` and `useAllPageProps` were removed.
- `useLayoutProps(target)` returns props for a specific component with inferred types.
- `useLayoutProps()` returns all props as `ReadonlyMap<ComponentType<any>, unknown>`.
- `withLayouts` now infers props from `Page` and supports typed `propertiesHoist`.

## Acknowledgements

This package was originally migrated from [react-dx](https://github.com/yunsii/react-dx).  
Special thanks to the original author for the foundational ideas and implementation.
