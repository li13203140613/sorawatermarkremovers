'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-gray-900 mb-4">错误</h1>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">页面出错了</h2>
            <p className="text-gray-600 mb-8">请稍后再试</p>
            <button
              onClick={reset}
              className="inline-block bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
            >
              重试
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
