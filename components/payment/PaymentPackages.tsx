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

// 获取套餐专属功能列表
function getPackageFeatures(label: string, credits: number, usage: { watermark: number; generate: number; premium: number }, t: any) {
  const baseFeatures = [
    { key: 'credits', text: `${credits} ${t('features.credits')}`, bold: true },
    { key: 'watermark', text: t('features.watermark', { count: usage.watermark }) },
    { key: 'generate', text: t('features.generate', { count: usage.generate }) },
    { key: 'premium', text: t('features.premium', { count: usage.premium }) },
  ]

  // 标准套餐额外功能
  if (label === 'standard') {
    return [
      ...baseFeatures,
      { key: 'hd', text: t('features.hd') },
      { key: 'noWatermarkDownload', text: t('features.noWatermarkDownload') },
      { key: 'priority', text: t('features.priority') },
      { key: 'fastProcessing', text: t('features.fastProcessing') },
    ]
  }

  // 超值套餐额外功能
  if (label === 'premium') {
    return [
      ...baseFeatures,
      { key: 'unlimited', text: t('features.unlimited') },
      { key: 'allPro', text: t('features.allPro') },
      { key: 'topPriority', text: t('features.topPriority') },
      { key: 'vipSupport', text: t('features.vipSupport') },
    ]
  }

  // 入门套餐只返回基础功能
  return baseFeatures
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
    <div className="max-w-6xl mx-auto">
      {error && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {PAYMENT_PACKAGES.map((pkg, index) => {
          const credits = locale === 'zh' ? pkg.creditsCNY : pkg.credits
          const usage = locale === 'zh' ? pkg.usageCNY : pkg.usageUSD
          const features = getPackageFeatures(pkg.label, credits, usage, t)

          return (
            <div
              key={index}
              className={`relative rounded-xl p-8 transition-all hover:shadow-xl ${
                pkg.popular
                  ? 'border-2 border-blue-500 shadow-lg bg-white'
                  : 'border border-gray-200 bg-white hover:border-blue-300'
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-bold px-4 py-1.5 rounded-full shadow-md">
                    🏆 {t('packages.popular')}
                  </span>
                </div>
              )}

              {/* 标题区域 - 调整顺序: 套餐名 → 积分 → 价格 */}
              <div className="text-center mb-6 pt-2">
                {/* 1. 套餐名称 */}
                <div className="text-lg font-bold text-gray-800 mb-3">
                  {t(`packages.${pkg.label}`)}
                </div>

                {/* 2. 积分数量 */}
                <div className="text-4xl font-bold text-blue-600 mb-3">
                  {credits} {tCommon('credits')}
                </div>

                {/* 3. 价格 */}
                <div className="text-3xl font-bold text-gray-900">
                  {currencySymbol}{locale === 'zh' ? pkg.amountCNY : pkg.amountUSD}
                </div>
              </div>

              {/* 功能列表 */}
              <div className="space-y-2.5 mb-6">
                {features.map((feature, idx) => (
                  <div key={idx} className="flex items-start text-sm text-gray-700">
                    <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className={feature.bold ? 'font-semibold' : ''}>{feature.text}</span>
                  </div>
                ))}
              </div>

              {/* 购买按钮 */}
              <button
                onClick={() => handlePurchase(locale === 'zh' ? pkg.amountCNY : pkg.amountUSD, index)}
                disabled={loading !== null}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-all ${
                  pkg.popular
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading === index ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
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
          )
        })}
      </div>
    </div>
  )
}
