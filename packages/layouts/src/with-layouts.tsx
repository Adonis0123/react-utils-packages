import React, { useMemo } from 'react'

import { getDisplayName } from './internal/react-nodes'
import { AllPagePropsContext } from './context'
import { useLayoutProps } from './hooks'

import type { AllPagePropsValue, AnyComponent } from './context'

type PropsOf<C extends AnyComponent> = React.ComponentProps<C>
type LayoutComponent = React.ComponentType<React.PropsWithChildren>

export interface WithLayoutsOptions<
  C extends AnyComponent,
  K extends readonly (keyof C & string)[] = readonly [],
> {
  /** page properties to hoist */
  propertiesHoist?: K
}

/**
 * Compose page with various layouts
 *
 * Example:
 *
 * `Page` and `[Layout1, Layout2]`
 *
 * result:
 *
 * ```
 * <Layout2>
 *   <Layout1>
 *     <Page />
 *   </Layout1>
 * </Layout2>
 * ```
 */
export function withLayouts<
  C extends AnyComponent,
  K extends readonly (keyof C & string)[] = readonly [],
>(
  Page: C,
  Layouts: readonly LayoutComponent[],
  options: WithLayoutsOptions<C, K> = {},
): React.FC<PropsOf<C>> & Pick<C, K[number]> {
  const { propertiesHoist = [] } = options
  const pageDisplayName = getDisplayName(Page)

  const WithLayoutsPage: React.FC<PropsOf<C>> = (pageProps) => {
    const allPageProps = useLayoutProps()

    let children = <Page {...pageProps} />

    for (const Layout of Layouts) {
      children = <Layout>{children}</Layout>
    }

    const pagePropsValue = useMemo<AllPagePropsValue>(() => {
      const state: AllPagePropsValue = new Map(allPageProps)
      state.set(Page, pageProps)
      return state
    }, [allPageProps, pageProps])

    children = (
      <AllPagePropsContext.Provider value={pagePropsValue}>
        {children}
      </AllPagePropsContext.Provider>
    )

    return children
  }

  WithLayoutsPage.displayName = `WithLayouts(${pageDisplayName})`

  const WrappedPage = WithLayoutsPage as React.FC<PropsOf<C>> & Pick<C, K[number]>

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
