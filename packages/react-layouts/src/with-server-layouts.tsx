import React from 'react'

import { getDisplayName } from './internal/react-nodes'

type Asyncable<T> = T | Promise<T>

export type ServerComponent<P = Record<string, unknown>> = (props: P) => Asyncable<React.ReactNode>
export type AnyServerComponent = ServerComponent<any>

type PropsOf<C extends AnyServerComponent> = C extends (props: infer P) => Asyncable<any> ? P : never

export type ServerAllLayoutPropsValue = ReadonlyMap<AnyServerComponent, unknown>

export interface ServerGetLayoutProps {
  <T = unknown>(): T | undefined
  <C extends AnyServerComponent>(component: C): Readonly<PropsOf<C>> | undefined
}

export interface ServerLayoutRuntimeProps<PageProps> {
  pageProps: Readonly<PageProps>
  allLayoutProps: ServerAllLayoutPropsValue
  getLayoutProps: ServerGetLayoutProps
}

export type ServerLayoutComponent<PageProps> = ((
  props: React.PropsWithChildren<ServerLayoutRuntimeProps<PageProps>>,
) => Asyncable<React.ReactNode>) & { displayName?: string }

export interface WithServerLayoutsOptions<
  C extends AnyServerComponent,
  K extends readonly (keyof C & string)[] = readonly [],
> {
  /** page properties to hoist */
  propertiesHoist?: K
}

interface ServerLayoutExecutionContext {
  allLayoutProps: Map<AnyServerComponent, unknown>
  order: AnyServerComponent[]
}

const INTERNAL_EXECUTE = Symbol('withServerLayouts.internalExecute')

type InternalWrappedServerComponent<P = Record<string, unknown>> = ServerComponent<P> & {
  [INTERNAL_EXECUTE]?: (
    pageProps: P,
    parentContext?: ServerLayoutExecutionContext,
  ) => Asyncable<React.ReactNode>
}

function createExecutionContext(
  page: AnyServerComponent,
  pageProps: unknown,
  parentContext?: ServerLayoutExecutionContext,
): ServerLayoutExecutionContext {
  const allLayoutProps = parentContext
    ? new Map(parentContext.allLayoutProps)
    : new Map<AnyServerComponent, unknown>()
  const order = parentContext ? [...parentContext.order] : []

  allLayoutProps.set(page, pageProps)

  const existingIndex = order.indexOf(page)
  if (existingIndex >= 0) {
    order.splice(existingIndex, 1)
  }
  order.push(page)

  return { allLayoutProps, order }
}

function createLayoutAccessors(context: ServerLayoutExecutionContext) {
  const allLayoutProps = new Map(context.allLayoutProps) as ServerAllLayoutPropsValue
  const order = [...context.order]

  const getLayoutProps = ((component?: AnyServerComponent) => {
    if (component) {
      return allLayoutProps.get(component)
    }

    const lastKey = order[order.length - 1]
    return lastKey ? allLayoutProps.get(lastKey) : undefined
  }) as ServerGetLayoutProps

  return { allLayoutProps, getLayoutProps }
}

/**
 * Compose a server page with server layouts.
 *
 * Layouts are applied inside-out:
 * `withServerLayouts(Page, [Layout1, Layout2])` =>
 * `<Layout2><Layout1><Page /></Layout1></Layout2>`
 */
export function withServerLayouts<
  C extends AnyServerComponent,
  K extends readonly (keyof C & string)[] = readonly [],
>(
  Page: C,
  Layouts: readonly ServerLayoutComponent<PropsOf<C>>[],
  options: WithServerLayoutsOptions<C, K> = {},
): ServerComponent<PropsOf<C>> & Pick<C, K[number]> {
  const { propertiesHoist = [] } = options
  const pageDisplayName = getDisplayName(Page as unknown as React.ComponentType<any>)

  const executeWithContext = async (
    pageProps: PropsOf<C>,
    parentContext?: ServerLayoutExecutionContext,
  ) => {
    const context = createExecutionContext(Page, pageProps, parentContext)
    const internalExecute = (Page as InternalWrappedServerComponent<PropsOf<C>>)[INTERNAL_EXECUTE]

    let children = internalExecute ? await internalExecute(pageProps, context) : await Page(pageProps)
    const { allLayoutProps, getLayoutProps } = createLayoutAccessors(context)

    for (let index = 0; index < Layouts.length; index++) {
      const Layout = Layouts[index]

      if (!Layout.displayName) {
        Layout.displayName = `Layout${index + 1}_${pageDisplayName}`
      }

      children = await Layout({ children, pageProps, allLayoutProps, getLayoutProps })
    }

    return children
  }

  const WithServerLayoutsPage: ServerComponent<PropsOf<C>> = (pageProps) => executeWithContext(pageProps)

  ;(WithServerLayoutsPage as { displayName?: string }).displayName = `WithServerLayouts(${pageDisplayName})`
  Object.defineProperty(WithServerLayoutsPage, INTERNAL_EXECUTE, {
    value: executeWithContext,
  })

  const WrappedPage = WithServerLayoutsPage as ServerComponent<PropsOf<C>> & Pick<C, K[number]>

  propertiesHoist.forEach((item) => {
    if (item in Page) {
      const descriptor = Object.getOwnPropertyDescriptor(Page, item)
      if (descriptor) {
        Object.defineProperty(WrappedPage, item, descriptor)
      }
    }
  })

  return WrappedPage
}
