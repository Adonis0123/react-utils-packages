'use client'

import { useRef, useState } from 'react'

import { useLayoutProps, withLayouts } from '@react-utils/layouts'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@react-utils/ui'

interface PageProps {
  defaultPage: number
}

const PageContent: React.FC<PageProps> = ({ defaultPage }) => {
  const [count, setCount] = useState(defaultPage)

  return (
    <Card className='border-slate-300 bg-white'>
      <CardHeader>
        <CardTitle>Page Content</CardTitle>
        <CardDescription>State initialized from page props.</CardDescription>
      </CardHeader>
      <CardContent className='space-y-3 text-sm text-slate-700'>
        <p>defaultPage: {defaultPage}</p>
        <Button onClick={() => setCount((v) => v + 1)}>count +1: {count}</Button>
      </CardContent>
    </Card>
  )
}

const Layout1: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <Card className='border-cyan-300 bg-cyan-50'>
      <CardHeader>
        <CardTitle>Layout1</CardTitle>
      </CardHeader>
      <CardContent className='space-y-3'>
        <div className='text-xs text-slate-600'>Start</div>
        {children}
        <div className='text-xs text-slate-600'>End</div>
      </CardContent>
    </Card>
  )
}

const InternalLayout2: React.FC<React.PropsWithChildren> = ({ children }) => {
  const renderCountRef = useRef(0)
  renderCountRef.current += 1

  const allLayoutProps = useLayoutProps()
  const pageProps = useLayoutProps(PageContent)
  const currentLayoutProps = useLayoutProps(InternalLayout2)

  return (
    <Card className='border-blue-300 bg-blue-50'>
      <CardHeader>
        <CardTitle>Layout2</CardTitle>
        <CardDescription>Context value from withLayouts provider.</CardDescription>
      </CardHeader>
      <CardContent className='space-y-2 text-sm text-slate-700'>
        <p>renderCount: {renderCountRef.current}</p>
        <p>allLayoutProps.size: {allLayoutProps.size}</p>
        <p>useLayoutProps(PageContent): {pageProps.defaultPage}</p>
        <p>useLayoutProps(InternalLayout2).children: {currentLayoutProps.children ? 'yes' : 'no'}</p>
        {children}
      </CardContent>
    </Card>
  )
}

const Layout2 = withLayouts(InternalLayout2, [
  ({ children }) => {
    const pageProps = useLayoutProps(PageContent)
    return (
      <Card className='border-indigo-300 bg-indigo-50'>
        <CardHeader>
          <CardTitle>Layout2 Inner</CardTitle>
        </CardHeader>
        <CardContent className='space-y-2 text-sm text-slate-700'>
          <p>Current page defaultPage: {pageProps.defaultPage}</p>
          {children}
        </CardContent>
      </Card>
    )
  },
])

const Layout3: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <Card className='border-emerald-300 bg-emerald-50'>
      <CardHeader>
        <CardTitle>Layout3</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

const ComposedPage = withLayouts(PageContent, [
  Layout1,
  ({ children }) => {
    const [localCount, setLocalCount] = useState(0)

    return (
      <div className='space-y-3'>
        <Button variant='outline' onClick={() => setLocalCount((v) => v + 1)}>
          localCount +1: {localCount}
        </Button>
        <Layout2>{children}</Layout2>
      </div>
    )
  },
  Layout3,
])

export function LayoutsDemo({ compact = false }: { compact?: boolean }) {
  const [defaultPage, setDefaultPage] = useState(10)

  return (
    <div className='grid gap-4'>
      {!compact
        ? (
            <>
              <h2 className='text-xl font-semibold'>withLayouts Showcase</h2>
              <p className='text-sm text-slate-600'>
                This page is hosted in Next.js and demonstrates the migrated `@react-utils/layouts` behavior.
              </p>
            </>
          )
        : (
            <p className='text-sm text-slate-600'>
              Live preview of `withLayouts` rendered with `@react-utils/ui` components.
            </p>
          )}
      <div>
        <Button onClick={() => setDefaultPage((v) => v + 1)}>
          defaultPage +1: {defaultPage}
        </Button>
      </div>
      <ComposedPage defaultPage={defaultPage} />
    </div>
  )
}
