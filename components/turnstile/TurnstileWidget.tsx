'use client'

import { Turnstile } from '@marsidev/react-turnstile'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface TurnstileWidgetProps {
  onSuccess: (token: string) => void
  onError?: () => void
}

export function TurnstileWidget({ onSuccess, onError }: TurnstileWidgetProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('loading')
  const [loadTimeout, setLoadTimeout] = useState(false)

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

  // 检测加载超时
  useEffect(() => {
    const timer = setTimeout(() => {
      if (status === 'loading') {
        setLoadTimeout(true)
        setStatus('error')
        onError?.()
      }
    }, 15000) // 15秒超时

    return () => clearTimeout(timer)
  }, [status, onError])

  if (!siteKey) {
    console.error('Turnstile site key not configured')
    return (
      <div className="flex flex-col items-center gap-4 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">Verification service not configured</p>
        <Link
          href="/login"
          className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Login to Skip Verification
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {!loadTimeout && (
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
          onLoad={() => {
            setStatus('idle')
          }}
          options={{
            theme: 'light',
            size: 'normal',
          }}
        />
      )}

      {status === 'loading' && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading verification...
        </div>
      )}

      {(status === 'error' || loadTimeout) && (
        <div className="flex flex-col items-center gap-3 p-6 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700 text-center">
            {loadTimeout
              ? 'Verification widget failed to load. This may be due to network issues or ad blockers.'
              : 'Verification failed. Please try again.'}
          </p>
          <Link
            href="/login"
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Login to Skip Verification
          </Link>
        </div>
      )}
    </div>
  )
}
