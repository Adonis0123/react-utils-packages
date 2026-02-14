import React from 'react'

export type AnyComponent = React.ComponentType<any>
export type AllPagePropsValue = Map<AnyComponent, unknown>

export const AllPagePropsContext = React.createContext<AllPagePropsValue>(new Map())
