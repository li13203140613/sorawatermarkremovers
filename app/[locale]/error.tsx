'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function LocaleError({ error, reset }: ErrorProps) {
  const router = useRouter()

  useEffect(() => {
    console.error('Locale Error Boundary caught:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8 md:p-12">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center text-4xl">⚠️</div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 text-center mb-4">Something went wrong!</h1>

        <p className="text-lg text-gray-600 text-center mb-8">
          The application encountered an unexpected error. We&apos;ve logged this issue and will fix it as soon as
          possible.
        </p>

        {process.env.NODE_ENV === 'development' && (
          <div className="mb-8 p-4 bg-gray-100 rounded-lg border border-gray-300">
            <p className="text-sm font-mono text-gray-800 mb-2">
              <strong>Error Message:</strong>
            </p>
            <p className="text-sm font-mono text-red-600 break-all">{error.message}</p>
            {error.digest && (
              <p className="text-sm font-mono text-gray-600 mt-2">
                <strong>Error Digest:</strong> {error.digest}
              </p>
            )}
            {error.stack && (
              <details className="mt-4">
                <summary className="text-sm font-mono text-gray-700 cursor-pointer">Stack Trace (click to expand)</summary>
                <pre className="text-xs font-mono text-gray-600 mt-2 overflow-x-auto whitespace-pre-wrap">{error.stack}</pre>
              </details>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            🔄 Try Again
          </button>

          <button
            onClick={() => router.push('/')}
            className="px-8 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            🏠 Go Home
          </button>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 text-center">
            If the problem persists, please contact{' '}
            <a href="mailto:support@sorawatermarkremovers.com" className="text-blue-600 hover:text-blue-700 underline font-medium">
              technical support
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
