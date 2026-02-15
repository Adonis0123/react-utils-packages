import Link from 'next/link'

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@adonis-kit/ui'

const entries = [
  {
    key: 'showcase-client',
    title: 'showcase-client',
    description:
      'Client entry demos for withLayouts, useLayoutProps, and useAllLayoutProps.',
    href: '/features/react-layouts/showcase-client',
    tags: ['client entry', '@adonis-kit/react-layouts/client', 'hooks'],
  },
  {
    key: 'showcase-server',
    title: 'showcase-server',
    description:
      'Server entry demo for withServerLayouts, allLayoutProps, and getLayoutProps.',
    href: '/features/react-layouts/showcase-server',
    tags: ['server entry', '@adonis-kit/react-layouts/server', 'accessors'],
  },
] as const

export default function FeatureReactLayoutsPage() {
  return (
    <div className='grid gap-6'>
      <header className='space-y-2'>
        <h2 className='text-2xl font-semibold tracking-tight'>react-layouts demos</h2>
        <p className='text-sm text-slate-600'>
          Split demos by runtime boundary so client and server usage stay explicit.
        </p>
      </header>

      <section className='grid gap-4 md:grid-cols-2'>
        {entries.map((entry) => (
          <Card key={entry.key}>
            <CardHeader>
              <CardTitle>{entry.title}</CardTitle>
              <CardDescription>{entry.description}</CardDescription>
            </CardHeader>
            <CardContent className='space-y-3'>
              <div className='flex flex-wrap gap-2'>
                {entry.tags.map((tag) => (
                  <span
                    key={tag}
                    className='rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700'
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <Button asChild>
                <Link href={entry.href}>Open {entry.title}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  )
}
