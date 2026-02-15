import { withServerLayouts } from '@adonis-kit/react-layouts/server'
import type {
  ServerComponent,
  ServerLayoutComponent,
} from '@adonis-kit/react-layouts/server'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@adonis-kit/ui'

const serverUsageSnippet = `import { withServerLayouts, type ServerLayoutComponent } from '@adonis-kit/react-layouts/server'

type PageProps = { title: string }

const Page = async ({ title }: PageProps) => <article>{title}</article>

const Layout: ServerLayoutComponent<PageProps> = ({ children, pageProps, allLayoutProps, getLayoutProps }) => {
  const fromPage = getLayoutProps(Page)?.title
  const latest = getLayoutProps<PageProps>()?.title

  return (
    <section data-has-page={String(allLayoutProps.has(Page))}>
      <h1>{pageProps.title}</h1>
      <small>
        By component: {fromPage ?? 'n/a'} | Latest: {latest ?? 'n/a'}
      </small>
      {children}
    </section>
  )
}

export const ServerPage = withServerLayouts(Page, [Layout])`

interface DemoPageProps {
  title: string
}

const MissingComponent: ServerComponent<{ id: string }> = async () => null

const DemoPage: ServerComponent<DemoPageProps> = async ({ title }) => (
  <article className='rounded border border-slate-300 bg-white p-4 text-sm text-slate-700'>
    <strong>Page output:</strong> {title}
  </article>
)

const ServerInspectorLayout: ServerLayoutComponent<DemoPageProps> = ({
  children,
  pageProps,
  allLayoutProps,
  getLayoutProps,
}) => {
  const byComponent = getLayoutProps(DemoPage)
  const latest = getLayoutProps<DemoPageProps>()
  const missing = getLayoutProps(MissingComponent)

  return (
    <Card className='border-amber-300 bg-amber-50'>
      <CardHeader>
        <CardTitle>ServerInspectorLayout</CardTitle>
        <CardDescription>
          Reads <code>pageProps</code>, <code>allLayoutProps</code>, and{' '}
          <code>getLayoutProps</code> injected by <code>withServerLayouts</code>.
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-2 text-sm text-slate-700'>
        <p>pageProps.title: {pageProps.title}</p>
        <p>allLayoutProps.has(DemoPage): {String(allLayoutProps.has(DemoPage))}</p>
        <p>allLayoutProps.size: {allLayoutProps.size}</p>
        <p>getLayoutProps(DemoPage)?.title: {byComponent?.title ?? 'n/a'}</p>
        <p>getLayoutProps&lt;DemoPageProps&gt;()?.title: {latest?.title ?? 'n/a'}</p>
        <p>getLayoutProps(MissingComponent) is undefined: {String(missing === undefined)}</p>
        {children}
      </CardContent>
    </Card>
  )
}

const ServerDemo = withServerLayouts(DemoPage, [ServerInspectorLayout])

export async function ReactLayoutsServerDemo() {
  const rendered = await ServerDemo({ title: 'Hello from server' })

  return (
    <div className='grid gap-8'>
      <header className='space-y-2'>
        <h2 className='text-xl font-semibold'>react-layouts showcase-server</h2>
        <p className='text-sm text-slate-600'>
          Server entry demo for <code>@adonis-kit/react-layouts/server</code>.
        </p>
      </header>

      <section className='grid gap-3'>
        <h3 className='text-lg font-medium'>Runtime Demo</h3>
        <p className='text-sm text-slate-500'>
          This section renders a real <code>withServerLayouts</code> composition result.
        </p>
        {rendered}
      </section>

      <section className='grid gap-3'>
        <h3 className='text-lg font-medium'>Usage Snippet</h3>
        <p className='text-sm text-slate-500'>
          Reference snippet for server <code>layout.tsx/page.tsx</code> usage.
        </p>
        <pre className='overflow-x-auto rounded bg-slate-900 p-3 text-xs text-slate-100'>
          <code>{serverUsageSnippet}</code>
        </pre>
      </section>
    </div>
  )
}
