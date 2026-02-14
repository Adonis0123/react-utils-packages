import { readFileSync } from 'fs'
import { resolve } from 'path'
import Link from 'next/link'

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@adonis-kit/ui'
import { CopyButton } from './copy-button'
import { features } from '@/lib/features'

const registryPath = resolve(process.cwd(), '../../registry.json')
const registry = JSON.parse(readFileSync(registryPath, 'utf-8'))
const components = registry.items as { name: string; title: string; description: string }[]

function CodeBlock({ children, copyable }: { children: string; copyable?: string }) {
  return (
    <div className='relative min-w-0'>
      <pre className='rounded-lg bg-slate-900 px-4 py-3 pr-16 font-mono text-xs text-slate-50 overflow-x-auto'>
        <code>{children}</code>
      </pre>
      {copyable !== undefined && <CopyButton text={copyable} />}
    </div>
  )
}

export default function HomePage() {
  return (
    <div className='grid gap-6'>
      <Card>
        <CardHeader>
          <CardTitle>Personal shadcn dual distribution</CardTitle>
          <CardDescription>
            Feature-first showcase. Keep each capability isolated by route so new features can be added cleanly.
          </CardDescription>
        </CardHeader>
        <CardContent className='grid gap-6 text-sm text-slate-700'>
          {/* Install */}
          <div className='grid gap-4'>
            <h3 className='text-base font-semibold text-slate-900'>Install</h3>

            <div className='grid gap-2'>
              <p className='font-medium'>Method 1: URL (zero config)</p>
              <p className='text-xs text-slate-500'>Directly specify the full URL, no extra configuration needed.</p>
              <CodeBlock copyable='pnpm dlx shadcn@latest add https://adonis-kit.vercel.app/r/button.json'>{`pnpm dlx shadcn@latest add https://adonis-kit.vercel.app/r/button.json`}</CodeBlock>
            </div>

            <div className='grid gap-2'>
              <p className='font-medium'>Method 2: Namespace (recommended)</p>
              <p className='text-xs text-slate-500'>
                Add registry to your components.json once, then install by short name.
              </p>
              <CodeBlock>{`// components.json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "registries": {
    "@adonis-kit": {
      "url": "https://adonis-kit.vercel.app/r"
    }
  }
}`}</CodeBlock>
              <CodeBlock copyable='pnpm dlx shadcn@latest add @adonis-kit/button'>{`pnpm dlx shadcn@latest add @adonis-kit/button`}</CodeBlock>
              <p className='text-xs text-slate-500'>
                This config works alongside official shadcn — <code className='rounded bg-slate-100 px-1 py-0.5 font-mono text-[11px]'>shadcn add button</code> still installs from the official registry, while <code className='rounded bg-slate-100 px-1 py-0.5 font-mono text-[11px]'>shadcn add @adonis-kit/button</code> installs from this registry.
              </p>
            </div>
          </div>

          {/* Available Components */}
          <div className='grid gap-3'>
            <h3 className='text-base font-semibold text-slate-900'>Available Components</h3>
            <div className='grid gap-3 sm:grid-cols-2'>
              {components.map((comp) => (
                <div key={comp.name} className='min-w-0 rounded-lg border border-slate-200 p-4 grid gap-3'>
                  <div>
                    <p className='font-semibold text-slate-900'>{comp.title}</p>
                    <p className='text-xs text-slate-500'>{comp.description}</p>
                  </div>
                  <div className='grid gap-1.5'>
                    <p className='text-[11px] font-medium text-slate-400'>URL</p>
                    <CodeBlock copyable={`pnpm dlx shadcn@latest add https://adonis-kit.vercel.app/r/${comp.name}.json`}>{`pnpm dlx shadcn@latest add https://adonis-kit.vercel.app/r/${comp.name}.json`}</CodeBlock>
                  </div>
                  <div className='grid gap-1.5'>
                    <p className='text-[11px] font-medium text-slate-400'>Namespace</p>
                    <CodeBlock copyable={`pnpm dlx shadcn@latest add @adonis-kit/${comp.name}`}>{`pnpm dlx shadcn@latest add @adonis-kit/${comp.name}`}</CodeBlock>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className='flex flex-wrap gap-3'>
            <Button asChild>
              <Link href='/features'>Open feature hub</Link>
            </Button>
            <Button asChild variant='outline'>
              <a href='/registry.json'>Open registry.json</a>
            </Button>
          </div>
        </CardContent>
      </Card>
      <section className='grid gap-4 md:grid-cols-2'>
        {features.map((feature) => (
          <Card key={feature.key}>
            <CardHeader>
              <CardTitle>{feature.title}</CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
            <CardContent className='space-y-3'>
              <div className='flex flex-wrap gap-2'>
                {feature.tags.map((tag) => (
                  <span
                    key={tag}
                    className='rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700'
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <Button asChild variant='outline'>
                <Link href={feature.href}>Open</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  )
}
