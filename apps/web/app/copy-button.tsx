'use client'

import { useEffect, useRef, useState } from 'react'

type CopyStatus = 'idle' | 'copied' | 'unsupported' | 'failed'

export function CopyButton({ text }: { text: string }) {
  const [status, setStatus] = useState<CopyStatus>('idle')
  const resetTimerRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (resetTimerRef.current !== null) {
        window.clearTimeout(resetTimerRef.current)
      }
    }
  }, [])

  const scheduleReset = () => {
    if (resetTimerRef.current !== null) {
      window.clearTimeout(resetTimerRef.current)
    }

    resetTimerRef.current = window.setTimeout(() => {
      setStatus('idle')
      resetTimerRef.current = null
    }, 1500)
  }

  const handleCopy = async () => {
    if (!navigator.clipboard?.writeText) {
      setStatus('unsupported')
      scheduleReset()
      return
    }

    try {
      await navigator.clipboard.writeText(text)
      setStatus('copied')
      scheduleReset()
    } catch {
      setStatus('failed')
      scheduleReset()
    }
  }

  const label = status === 'copied'
    ? 'Copied!'
    : status === 'unsupported'
      ? 'Clipboard unavailable'
      : status === 'failed'
        ? 'Copy failed'
        : 'Copy'

  return (
    <button
      type='button'
      className='absolute top-2 right-2 z-10 cursor-pointer rounded-md bg-slate-800 px-1.5 py-1 text-[11px] text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors'
      onClick={handleCopy}
    >
      {label}
    </button>
  )
}
