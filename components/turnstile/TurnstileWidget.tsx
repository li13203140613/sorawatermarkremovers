'use client'

import { Turnstile } from '@marsidev/react-turnstile'
import { useState } from 'react'

interface TurnstileWidgetProps {
  onSuccess: (token: string) => void
  onError?: () => void
}

export function TurnstileWidget({ onSuccess, onError }: TurnstileWidgetProps) {
  const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle')

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

  if (!siteKey) {
    console.error('Turnstile site key not configured')
    return null
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <Turnstile
        siteKey={siteKey}
        onSuccess={(token) => {
          setStatus('success')
          onSuccess(token)
        }}
        onError={() => {
          setStatus('error')
          onError?.()
        }}
        onExpire={() => {
          setStatus('idle')
        }}
        options={{
          theme: 'light',
          size: 'normal',
        }}
      />

      {status === 'error' && (
        <p className="text-sm text-red-600">
          Verification failed. Please try again.
        </p>
      )}
    </div>
  )
}
