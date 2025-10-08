'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [processing, setProcessing] = useState(true)
  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    if (!sessionId) {
      router.push('/dashboard')
      return
    }

    // 给 webhook 一些时间处理
    const timer = setTimeout(() => {
      setProcessing(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [sessionId, router])

  if (processing) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold mb-2">处理中...</h1>
          <p className="text-gray-600">正在确认您的支付，请稍候</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">充值成功！</h1>
        <p className="text-gray-600 mb-6">
          您的积分已经到账，可以开始使用了
        </p>

        <div className="space-y-3">
          <Link
            href="/dashboard"
            className="block w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
          >
            返回控制台
          </Link>

          <Link
            href="/dashboard"
            className="block w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-md transition-colors"
          >
            立即使用
          </Link>
        </div>
      </div>
    </main>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold mb-2">加载中...</h1>
        </div>
      </main>
    }>
      <PaymentSuccessContent />
    </Suspense>
  )
}
