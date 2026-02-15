import React from 'react'

import type {
  AnyServerComponent,
  ServerAllLayoutPropsValue,
  ServerComponent,
  ServerGetLayoutProps,
  ServerLayoutComponent,
} from '../server'
import { withServerLayouts } from '../server'

interface PageProps {
  title: string
}

type PageComponent = ServerComponent<PageProps> & {
  routeMeta?: {
    auth: boolean
  }
}

const Page = (async ({ title }: PageProps) => <div>{title}</div>) as PageComponent
Page.routeMeta = { auth: true }

const MissingComponent: ServerComponent<{ missing: boolean }> = async () => null

const Layout: ServerLayoutComponent<PageProps> = async ({
  children,
  pageProps,
  allLayoutProps,
  getLayoutProps,
}) => {
  const title: string = pageProps.title
  const pagePropsByComponent = getLayoutProps(Page)
  const current = getLayoutProps<PageProps>()
  const missing = getLayoutProps(MissingComponent)

  const maybeTitleByComponent: string | undefined = pagePropsByComponent?.title
  const maybeTitleByNoArg: string | undefined = current?.title
  const isMissing: boolean = missing === undefined

  allLayoutProps.get(Page)
  allLayoutProps.has(Layout as unknown as AnyServerComponent)

  // @ts-expect-error ReadonlyMap cannot be mutated
  allLayoutProps.set(Page, { title: 'mutate' })

  // @ts-expect-error props can be undefined
  const requiredTitle: string = pagePropsByComponent.title

  const readOnlyMap: ServerAllLayoutPropsValue = allLayoutProps
  const getter: ServerGetLayoutProps = getLayoutProps

  void maybeTitleByComponent
  void maybeTitleByNoArg
  void isMissing
  void requiredTitle
  void readOnlyMap
  void getter
  void title
  return <>{children}</>
}

const Wrapped = withServerLayouts(Page, [Layout], { propertiesHoist: ['routeMeta'] as const })

const wrappedInput: Parameters<typeof Wrapped>[0] = { title: 'ok' }
const wrappedOutput: ReturnType<typeof Wrapped> = Promise.resolve(<div />)

wrappedInput.title
void wrappedOutput
Wrapped.routeMeta?.auth

const LayoutWithoutProps: ServerLayoutComponent<PageProps> = ({ children }) => <>{children}</>
void LayoutWithoutProps

// @ts-expect-error invalid hoist key
withServerLayouts(Page, [Layout], { propertiesHoist: ['missing'] as const })
