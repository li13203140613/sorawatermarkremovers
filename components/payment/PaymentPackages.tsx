'use client'

import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { PAYMENT_PACKAGES } from '@/lib/payment/types'
import { useTranslations, useLocale } from 'next-intl'
import { useAuth } from '@/lib/auth/context'

// 初始化 Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export function PaymentPackages() {
  const t = useTranslations('payment')
  const tCommon = useTranslations('common')
  const locale = useLocale()
  const { user } = useAuth()
  const [loading, setLoading] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [accountCopied, setAccountCopied] = useState(false)

  // 调试：打印当前语言
  console.log('Current locale:', locale)

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
        setError(data.error || t('errors.failed'))
        setLoading(null)
        return
      }

      const data = await response.json()

      if (!data.url) {
        setError(t('errors.failed'))
        setLoading(null)
        return
      }

      // 跳转到 Stripe Checkout 页面
      window.location.href = data.url
    } catch (err) {
      console.error('Payment error:', err)
      setError(t('errors.failed'))
      setLoading(null)
    }
  }

  const handleCopyAccount = () => {
    const account = user?.email || user?.id || ''
    if (account) {
      navigator.clipboard.writeText(account)
      setAccountCopied(true)
      setTimeout(() => setAccountCopied(false), 2000)
    }
  }

  return (
    <div className="space-y-12">
      {/* Stripe 支付区域 */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">{t('title')}</h2>

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
                    {t('packages.popular')}
                  </span>
                </div>
              )}

              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  ${pkg.amount}
                </div>
                <div className="text-2xl font-semibold text-blue-600 mb-1">
                  {pkg.credits} {tCommon('credits')}
                </div>
                <div className="text-sm text-gray-500 mb-4">
                  {t(`packages.${pkg.label}`)}
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
                      {t('processing')}
                    </span>
                  ) : (
                    t('purchase')
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 微信支付区域 - 仅中文显示 */}
      {locale === 'zh' && (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 p-8 rounded-lg shadow-lg">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('wechat.title')}</h2>
            <p className="text-sm text-gray-600">{t('wechat.subtitle')}</p>
          </div>

          {/* 人民币价格套餐 */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-center mb-4 text-gray-700">
              {t('wechat.packagesTitle')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              {PAYMENT_PACKAGES.map((pkg, index) => (
                <div
                  key={index}
                  className={`bg-white border-2 rounded-lg p-4 text-center ${
                    pkg.popular ? 'border-green-500 shadow-md' : 'border-gray-300'
                  }`}
                >
                  {pkg.popular && (
                    <div className="text-xs font-bold text-green-600 mb-1">
                      {t('packages.popular')}
                    </div>
                  )}
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    ¥{pkg.cnyAmount}
                  </div>
                  <div className="text-lg font-semibold text-gray-700">
                    {pkg.credits} {tCommon('credits')}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 用户账号 - 仅登录用户显示 */}
          {user && (
            <div className="mb-6 max-w-2xl mx-auto">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('wechat.accountLabel')}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={user.email || user.id || ''}
                  className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-800 font-mono text-sm"
                />
                <button
                  onClick={handleCopyAccount}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium transition-colors whitespace-nowrap"
                >
                  {accountCopied ? t('wechat.accountCopied') : t('wechat.copyAccount')}
                </button>
              </div>
            </div>
          )}

          {/* 收款码 */}
          <div className="max-w-md mx-auto">
            <h3 className="text-center text-lg font-semibold mb-4 text-gray-700">
              {t('wechat.qrCodeTitle')}
            </h3>
            <div className="bg-white p-4 rounded-lg shadow-md">
              <img
                src="/shoukuan.jpg"
                alt="微信收款码"
                className="w-full h-auto rounded-lg"
              />
            </div>
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-gray-700 text-center">
                💡 {t('wechat.instruction')}
              </p>
              <p className="text-sm text-gray-600 text-center mt-1">
                {t('wechat.notice')}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
