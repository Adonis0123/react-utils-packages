'use client'

import { useEffect } from 'react'

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@adonis-kit/ui'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('App Router error boundary captured an error:', error)
  }, [error])

  return (
    <div className='mx-auto grid w-full max-w-2xl gap-4 py-8'>
      <Card>
        <CardHeader>
          <CardTitle>Something went wrong</CardTitle>
          <CardDescription>
            A runtime error was captured by the app error boundary. You can retry the render.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4 text-sm text-slate-700'>
          <p className='rounded-md bg-slate-100 px-3 py-2 font-mono text-xs text-slate-600'>
            {error.message || 'Unknown error'}
          </p>
          <Button type='button' onClick={reset}>
            Retry
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
