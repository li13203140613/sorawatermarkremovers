'use client'

import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { PAYMENT_PACKAGES } from '@/lib/payment/types'

// 初始化 Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export function PaymentPackages() {
  const [loading, setLoading] = useState<number | null>(null)
  const [error, setError] = useState('')

  const handlePurchase = async (amount: number, index: number) => {
    setError('')
    setLoading(index)

    try {
      // 创建支付会话
      const response = await fetch('/api/payment/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount }),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || '创建支付会话失败')
        setLoading(null)
        return
      }

      const data = await response.json()

      if (!data.url) {
        setError('未获取到支付链接')
        setLoading(null)
        return
      }

      // 跳转到 Stripe Checkout 页面
      window.location.href = data.url
    } catch (err) {
      console.error('支付错误:', err)
      setError(`网络错误: ${err instanceof Error ? err.message : '请重试'}`)
      setLoading(null)
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">充值积分</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {PAYMENT_PACKAGES.map((pkg, index) => (
          <div
            key={index}
            className={`relative border-2 rounded-lg p-6 transition-all ${
              pkg.popular
                ? 'border-blue-500 shadow-lg scale-105'
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            {pkg.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  推荐
                </span>
              </div>
            )}

            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                ${pkg.amount}
              </div>
              <div className="text-2xl font-semibold text-blue-600 mb-1">
                {pkg.credits} 积分
              </div>
              <div className="text-sm text-gray-500 mb-4">{pkg.label}</div>

              <div className="text-xs text-gray-400 mb-4">
                可处理 {pkg.credits} 个视频
              </div>

              <button
                onClick={() => handlePurchase(pkg.amount, index)}
                disabled={loading !== null}
                className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
                  pkg.popular
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading === index ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    处理中...
                  </span>
                ) : (
                  '立即购买'
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <div className="flex items-start gap-2">
          <svg
            className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">充值说明</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li>1 美元 = 10 积分</li>
              <li>最低充值金额为 1 美元</li>
              <li>支付成功后积分立即到账</li>
              <li>使用 Stripe 安全支付，支持信用卡</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
