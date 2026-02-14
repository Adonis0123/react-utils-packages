import type React from 'react'
import { useContext } from 'react'

import { getDisplayName } from './internal/react-nodes'
import { AllPagePropsContext } from './context'
import type { AnyComponent } from './context'

type PropsOf<C extends AnyComponent> = React.ComponentProps<C>

export function useLayoutProps(): ReadonlyMap<AnyComponent, unknown>
export function useLayoutProps<C extends AnyComponent>(component: C): Readonly<PropsOf<C>>
export function useLayoutProps<C extends AnyComponent>(component?: C) {
  const allPageProps = useContext(AllPagePropsContext)

  if (component) {
    if (!allPageProps.has(component)) {
      throw new Error(`useLayoutProps: props for "${getDisplayName(component)}" were not found in context`)
    }
    return allPageProps.get(component) as Readonly<PropsOf<C>>
  }

  return allPageProps as ReadonlyMap<AnyComponent, unknown>
}
