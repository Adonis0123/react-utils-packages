'use client'

import { useState } from 'react'

import { useAllLayoutProps, useLayoutProps, withLayouts } from '@adonis-kit/react-layouts/client'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@adonis-kit/ui'

// ─── Example 1: Basic ────────────────────────────────────────────────────────

interface BasicPageProps {
  title: string
  defaultCount: number
}

const BasicPage: React.FC<BasicPageProps> = ({ title, defaultCount }) => {
  const [count, setCount] = useState(defaultCount)

  return (
    <Card className='border-slate-300 bg-white'>
      <CardHeader>
        <CardTitle>Page</CardTitle>
        <CardDescription>The innermost page component.</CardDescription>
      </CardHeader>
      <CardContent className='space-y-3 text-sm text-slate-700'>
        <p>title: {title}</p>
        <Button type='button' onClick={() => setCount((v) => v + 1)}>
          count +1: {count}
        </Button>
      </CardContent>
    </Card>
  )
}

const Header: React.FC<React.PropsWithChildren> = ({ children }) => {
  const pageProps = useLayoutProps(BasicPage)

  return (
    <Card className='border-cyan-300 bg-cyan-50'>
      <CardHeader>
        <CardTitle>Header</CardTitle>
        <CardDescription>
          Reads page title via <code>useLayoutProps(BasicPage)</code>
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-2 text-sm text-slate-700'>
        <p>Page title: {pageProps?.title ?? 'n/a'}</p>
        {children}
      </CardContent>
    </Card>
  )
}

const Sidebar: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <Card className='border-emerald-300 bg-emerald-50'>
      <CardHeader>
        <CardTitle>Sidebar</CardTitle>
        <CardDescription>Outermost layout wraps Header and Page.</CardDescription>
      </CardHeader>
      <CardContent className='flex gap-4'>
        <nav className='w-24 shrink-0 rounded bg-emerald-100 p-2 text-xs text-emerald-700'>
          Nav items
        </nav>
        <div className='flex-1'>{children}</div>
      </CardContent>
    </Card>
  )
}

const BasicExample = withLayouts(BasicPage, [Header, Sidebar])

// ─── Example 2: Advanced ─────────────────────────────────────────────────────

interface AdvancedPageProps {
  user: string
}

const AdvancedPage: React.FC<AdvancedPageProps> = ({ user }) => {
  return (
    <Card className='border-slate-300 bg-white'>
      <CardHeader>
        <CardTitle>Page</CardTitle>
      </CardHeader>
      <CardContent className='text-sm text-slate-700'>
        <p>user: {user}</p>
      </CardContent>
    </Card>
  )
}

const PropsInspector: React.FC<React.PropsWithChildren> = ({ children }) => {
  const latestProps = useLayoutProps<AdvancedPageProps>()
  const allProps = useAllLayoutProps()

  return (
    <Card className='border-blue-300 bg-blue-50'>
      <CardHeader>
        <CardTitle>PropsInspector</CardTitle>
        <CardDescription>
          Uses <code>useLayoutProps&lt;T&gt;()</code> (no argument) and{' '}
          <code>useAllLayoutProps()</code>
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-2 text-sm text-slate-700'>
        <p>useLayoutProps&lt;AdvancedPageProps&gt;().user: {latestProps?.user ?? 'n/a'}</p>
        <p>useAllLayoutProps().size: {allProps.size}</p>
        {children}
      </CardContent>
    </Card>
  )
}

const SubLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  const pageProps = useLayoutProps(AdvancedPage)

  return (
    <Card className='border-indigo-300 bg-indigo-50'>
      <CardHeader>
        <CardTitle>SubLayout</CardTitle>
        <CardDescription>Inner layout composed via nested withLayouts.</CardDescription>
      </CardHeader>
      <CardContent className='space-y-2 text-sm text-slate-700'>
        <p>Page user (from outer context): {pageProps?.user ?? 'n/a'}</p>
        {children}
      </CardContent>
    </Card>
  )
}

const ComposedLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <Card className='border-violet-300 bg-violet-50'>
      <CardHeader>
        <CardTitle>ComposedLayout</CardTitle>
        <CardDescription>This layout itself uses withLayouts internally.</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

const NestedComposedLayout = withLayouts(ComposedLayout, [SubLayout])

const AdvancedExample = withLayouts(AdvancedPage, [PropsInspector, NestedComposedLayout])

// ─── Showcase ────────────────────────────────────────────────────────────────

export function ReactLayoutsClientDemo({ compact = false }: { compact?: boolean }) {
  const [title, setTitle] = useState('Hello')
  const [user, setUser] = useState('Alice')

  return (
    <div className='grid gap-8'>
      {!compact && (
        <>
          <h2 className='text-xl font-semibold'>react-layouts showcase-client</h2>
          <p className='text-sm text-slate-600'>
            Client entry demo for <code>@adonis-kit/react-layouts/client</code>, covering
            layout composition and props hooks.
          </p>
        </>
      )}

      <section className='grid gap-3'>
        <h3 className='text-lg font-medium'>Basic - Page + Named Layouts</h3>
        <p className='text-sm text-slate-500'>
          <code>withLayouts(BasicPage, [Header, Sidebar])</code> where Header reads page props
          and Sidebar wraps everything.
        </p>
        <div>
          <Button
            type='button'
            variant='outline'
            onClick={() => setTitle((v) => (v === 'Hello' ? 'World' : 'Hello'))}
          >
            Toggle title: {title}
          </Button>
        </div>
        <BasicExample title={title} defaultCount={0} />
      </section>

      <section className='grid gap-3'>
        <h3 className='text-lg font-medium'>Advanced - No-arg Hook, AllProps, Nested Composition</h3>
        <p className='text-sm text-slate-500'>
          <code>useLayoutProps&lt;T&gt;()</code> without argument,{' '}
          <code>useAllLayoutProps()</code>, and nested <code>withLayouts</code>.
        </p>
        <div>
          <Button
            type='button'
            variant='outline'
            onClick={() => setUser((v) => (v === 'Alice' ? 'Bob' : 'Alice'))}
          >
            Toggle user: {user}
          </Button>
        </div>
        <AdvancedExample user={user} />
      </section>
    </div>
  )
}
