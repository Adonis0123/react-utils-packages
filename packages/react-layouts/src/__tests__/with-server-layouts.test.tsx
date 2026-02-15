import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import type { ServerComponent, ServerLayoutComponent } from '../server'
import { withServerLayouts } from '../server'

describe('withServerLayouts', () => {
  it('applies layout nesting order and forwards pageProps', async () => {
    interface PageProps {
      title: string
    }

    const Page: ServerComponent<PageProps> = async ({ title }) => <span>{title}</span>

    const Layout1: ServerLayoutComponent<PageProps> = async ({ children, pageProps }) => (
      <div data-layout='layout-1' data-title={pageProps.title}>
        {children}
      </div>
    )

    const Layout2: ServerLayoutComponent<PageProps> = ({ children }) => (
      <section data-layout='layout-2'>{children}</section>
    )

    const Wrapped = withServerLayouts(Page, [Layout1, Layout2])
    const result = await Wrapped({ title: 'hello' })
    const html = renderToStaticMarkup(<>{result}</>)

    expect(html).toContain('data-layout="layout-2"')
    expect(html).toContain('data-layout="layout-1"')
    expect(html).toContain('data-title="hello"')
    expect(html).toContain('<span>hello</span>')
  })

  it('injects allLayoutProps and getLayoutProps', async () => {
    interface PageProps {
      title: string
    }

    const Page: ServerComponent<PageProps> = async ({ title }) => <span>{title}</span>
    const MissingComponent: ServerComponent<{ id: string }> = async () => null

    const Layout: ServerLayoutComponent<PageProps> = ({ children, allLayoutProps, getLayoutProps }) => {
      const componentProps = getLayoutProps(Page)
      const latestProps = getLayoutProps<PageProps>()
      const missingProps = getLayoutProps(MissingComponent)

      return (
        <div
          data-has-page={String(allLayoutProps.has(Page))}
          data-title-by-component={componentProps?.title}
          data-title-by-noarg={latestProps?.title}
          data-missing={String(missingProps === undefined)}
        >
          {children}
        </div>
      )
    }

    const Wrapped = withServerLayouts(Page, [Layout])
    const result = await Wrapped({ title: 'hello' })
    const html = renderToStaticMarkup(<>{result}</>)

    expect(html).toContain('data-has-page="true"')
    expect(html).toContain('data-title-by-component="hello"')
    expect(html).toContain('data-title-by-noarg="hello"')
    expect(html).toContain('data-missing="true"')
  })

  it('supports V2 chain visibility: child sees parent, parent does not see child', async () => {
    interface PageProps {
      slug: string
    }

    const ChildPage: ServerComponent<PageProps> = async ({ slug }) => <span>{slug}</span>

    const ChildLayout: ServerLayoutComponent<PageProps> = ({ children, allLayoutProps, getLayoutProps }) => (
      <div
        data-child-sees-parent={String(allLayoutProps.has(ChildWrapped))}
        data-child-parent-slug={getLayoutProps(ChildWrapped)?.slug}
      >
        {children}
      </div>
    )

    const ChildWrapped = withServerLayouts(ChildPage, [ChildLayout])

    const ParentLayout: ServerLayoutComponent<PageProps> = ({ children, allLayoutProps, getLayoutProps }) => (
      <section
        data-parent-sees-child={String(allLayoutProps.has(ChildPage))}
        data-parent-child-missing={String(getLayoutProps(ChildPage) === undefined)}
      >
        {children}
      </section>
    )

    const ParentWrapped = withServerLayouts(ChildWrapped, [ParentLayout])
    const result = await ParentWrapped({ slug: 'chain' })
    const html = renderToStaticMarkup(<>{result}</>)

    expect(html).toContain('data-child-sees-parent="true"')
    expect(html).toContain('data-child-parent-slug="chain"')
    expect(html).toContain('data-parent-sees-child="false"')
    expect(html).toContain('data-parent-child-missing="true"')
  })

  it('assigns displayName for anonymous layout during execution', async () => {
    const Page: ServerComponent<{}> = async () => null

    const AnonymousLayout: ServerLayoutComponent<{}> = async ({ children }) => <>{children}</>
    expect(AnonymousLayout.displayName).toBeUndefined()

    const Wrapped = withServerLayouts(Page, [AnonymousLayout])
    await Wrapped({})

    expect(AnonymousLayout.displayName).toBe('Layout1_Page')
  })

  it('hoists selected static properties', () => {
    interface PageProps {
      id: string
    }

    type PageComponent = ServerComponent<PageProps> & { routeMeta?: { auth: boolean } }

    const Page = (async ({ id }: PageProps) => <span>{id}</span>) as PageComponent
    Page.routeMeta = { auth: true }

    const Wrapped = withServerLayouts(Page, [], { propertiesHoist: ['routeMeta'] }) as PageComponent

    expect(Wrapped.routeMeta).toEqual({ auth: true })
  })
})
