'use client'

import { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { PAYMENT_PACKAGES } from '@/lib/payment/types'
import { useTranslations } from 'next-intl'

// 初始化 Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

// 从 cookie 读取当前语言
function getCurrentLocale(): string {
  if (typeof window === 'undefined') return 'en'

  const cookie = document.cookie
    .split('; ')
    .find(row => row.startsWith('NEXT_LOCALE='))

  return cookie?.split('=')[1] || 'en'
}

export function PaymentPackages() {
  const t = useTranslations('payment')
  const tCommon = useTranslations('common')
  // 初始化时就尝试读取 locale,避免闪烁
  const [locale, setLocale] = useState(() => getCurrentLocale())
  const [loading, setLoading] = useState<number | null>(null)
  const [error, setError] = useState('')

  // 在客户端挂载后再次确认语言设置,并监听 cookie 变化
  useEffect(() => {
    const updateLocale = () => {
      const currentLocale = getCurrentLocale()
      console.log('[PaymentPackages] Updating locale from cookie:', currentLocale)
      setLocale(currentLocale)
    }

    // 立即更新一次
    updateLocale()

    // 监听页面可见性变化(当用户切换回标签页时更新)
    document.addEventListener('visibilitychange', updateLocale)

    // 监听焦点事件(当窗口获得焦点时更新)
    window.addEventListener('focus', updateLocale)

    return () => {
      document.removeEventListener('visibilitychange', updateLocale)
      window.removeEventListener('focus', updateLocale)
    }
  }, [])

  // 根据语言环境确定货币类型
  const currency = locale === 'zh' ? 'cny' : 'usd'
  const currencySymbol = locale === 'zh' ? '¥' : '$'

  console.log('[PaymentPackages] Locale:', locale)
  console.log('[PaymentPackages] Currency:', currency)
  console.log('[PaymentPackages] Currency Symbol:', currencySymbol)

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
        body: JSON.stringify({ amount, currency, locale }),
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

  return (
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
                {currencySymbol}{locale === 'zh' ? pkg.amountCNY : pkg.amountUSD}
              </div>
              <div className="text-2xl font-semibold text-blue-600 mb-1">
                {locale === 'zh' ? pkg.creditsCNY : pkg.credits} {tCommon('credits')}
              </div>
              <div className="text-sm text-gray-500 mb-4">
                {t(`packages.${pkg.label}`)}
              </div>

              <button
                onClick={() => handlePurchase(locale === 'zh' ? pkg.amountCNY : pkg.amountUSD, index)}
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
  )
}
