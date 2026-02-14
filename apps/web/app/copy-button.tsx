'use client'

import { useState } from 'react'

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  return (
    <button
      type='button'
      className='absolute top-2 right-2 z-10 cursor-pointer rounded-md bg-slate-800 px-1.5 py-1 text-[11px] text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors'
      onClick={() => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      }}
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  )
}
