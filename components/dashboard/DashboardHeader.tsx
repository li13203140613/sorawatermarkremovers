'use client'

import { useTranslations } from 'next-intl'

export default function DashboardHeader() {
  const t = useTranslations('dashboard')

  return (
    <div className="text-center pt-16 pb-12 px-4">
      <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
        {t('title')}
      </h1>
      <p className="text-base md:text-lg text-gray-600">
        {t('subtitle')}
      </p>
    </div>
  )
}
