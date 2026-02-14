import React from 'react'

import { useLayoutProps } from '../hooks'
import { withLayouts } from '../with-layouts'

interface PageProps {
  title: string
}

type PageComponent = React.FC<PageProps> & {
  routeMeta?: {
    auth: boolean
  }
}

const Page = (({ title }) => <div>{title}</div>) as PageComponent
Page.routeMeta = { auth: true }

const Layout: React.FC<React.PropsWithChildren> = ({ children }) => {
  const props = useLayoutProps(Page)
  const title: string = props.title

  // @ts-expect-error property does not exist
  props.count

  void title
  return <>{children}</>
}

const Wrapped = withLayouts(Page, [Layout], { propertiesHoist: ['routeMeta'] as const })
const wrappedProps: React.ComponentProps<typeof Wrapped> = { title: 'ok' }

wrappedProps.title
Wrapped.routeMeta?.auth

const ReadonlyMapLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  const allProps = useLayoutProps()

  allProps.get(Page)
  allProps.has(Layout)

  // @ts-expect-error ReadonlyMap cannot be mutated
  allProps.set(Page, { title: 'mutate' })

  return <>{children}</>
}

void ReadonlyMapLayout

// @ts-expect-error invalid hoist key
withLayouts(Page, [Layout], { propertiesHoist: ['missing'] as const })

