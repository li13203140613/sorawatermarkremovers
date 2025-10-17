'use client'

import { useTranslations } from 'next-intl'

export function CreditUsage() {
  const t = useTranslations('payment.usage')

  const features = [
    {
      icon: '✨',
      key: 'watermark',
      cost: 1
    },
    {
      icon: '🎬',
      key: 'generate',
      cost: 1
    },
    {
      icon: '💎',
      key: 'premium',
      cost: 2
    },
  ]

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
        {t('title')}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {features.map(({ icon, key, cost }) => (
          <div key={key} className="bg-white rounded-lg p-4 text-center shadow-sm hover:shadow-md transition-shadow">
            <div className="text-3xl mb-2">{icon}</div>
            <div className="font-medium text-gray-900">{t(`${key}.title`)}</div>
            <div className="text-sm text-gray-600 mt-1">{t(`${key}.desc`)}</div>
            <div className="text-blue-600 font-bold mt-2">
              {cost} {t('credits')}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
