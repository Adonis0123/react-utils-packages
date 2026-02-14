import React, { useRef, useState } from 'react'

import { useLayoutProps, withLayouts } from '@react-utils/layouts'

interface PageProps {
  defaultPage: number
}

const PageContent: React.FC<PageProps> = ({ defaultPage }) => {
  const [count, setCount] = useState(defaultPage)

  return (
    <section className='panel panel-page'>
      <h3>Page Content</h3>
      <p>defaultPage: {defaultPage}</p>
      <button type='button' onClick={() => setCount((v) => v + 1)}>
        count +1: {count}
      </button>
    </section>
  )
}

const Layout1: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <section className='panel panel-l1'>
      <div className='panel-title'>Layout1 Start</div>
      {children}
      <div className='panel-title'>Layout1 End</div>
    </section>
  )
}

const InternalLayout2: React.FC<React.PropsWithChildren<{ mark?: string }>> = ({ children }) => {
  const renderCountRef = useRef(0)
  renderCountRef.current += 1

  const allLayoutProps = useLayoutProps()
  const pageProps = useLayoutProps(PageContent)
  const currentLayoutProps = useLayoutProps(InternalLayout2)

  return (
    <section className='panel panel-l2'>
      <div className='panel-title'>Layout2 Start</div>
      <p>renderCount: {renderCountRef.current}</p>
      <p>Map size (AllLayoutProps): {allLayoutProps.size}</p>
      <p>useLayoutProps(PageContent): {pageProps.defaultPage}</p>
      <p>useLayoutProps(InternalLayout2).mark: {currentLayoutProps.mark ?? 'n/a'}</p>
      {children}
      <div className='panel-title'>Layout2 End</div>
    </section>
  )
}

const Layout2 = withLayouts(InternalLayout2, [
  ({ children }) => {
    const pageProps = useLayoutProps(PageContent)
    const layoutProps = useLayoutProps(InternalLayout2)
    return (
      <section className='panel panel-l2x'>
        <div className='panel-title'>Layout2-Inner Start</div>
        <p>Current page defaultPage: {pageProps.defaultPage}</p>
        <p>Outer layout mark: {layoutProps.mark ?? 'n/a'}</p>
        {children}
        <div className='panel-title'>Layout2-Inner End</div>
      </section>
    )
  },
])

const Layout3: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <section className='panel panel-l3'>
      <div className='panel-title'>Layout3 Start</div>
      {children}
      <div className='panel-title'>Layout3 End</div>
    </section>
  )
}

const ComposedPage = withLayouts(PageContent, [
  Layout1,
  ({ children }) => {
    const [localCount, setLocalCount] = useState(0)

    return (
      <Layout2 mark='demo'>
        <button type='button' onClick={() => setLocalCount((v) => v + 1)}>
          localCount +1: {localCount}
        </button>
        {children}
      </Layout2>
    )
  },
  Layout3,
])

export function DemoApp() {
  const [defaultPage, setDefaultPage] = useState(10)

  return (
    <main className='demo-shell'>
      <header>
        <h1>@react-utils/layouts Demo</h1>
        <p>Phase 1 migration showcase with nested layouts and page props context.</p>
      </header>
      <button type='button' onClick={() => setDefaultPage((v) => v + 1)}>
        defaultPage +1: {defaultPage}
      </button>
      <ComposedPage defaultPage={defaultPage} />
    </main>
  )
}
