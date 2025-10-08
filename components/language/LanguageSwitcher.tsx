'use client'

import { useTransition } from 'react'
import { locales, type Locale } from '@/i18n'

export default function LanguageSwitcher() {
  const [isPending, startTransition] = useTransition()

  const handleLanguageChange = (locale: Locale) => {
    startTransition(() => {
      document.cookie = `locale=${locale}; path=/; max-age=31536000`
      window.location.reload()
    })
  }

  return (
    <div className="flex gap-2">
      {locales.map((locale) => (
        <button
          key={locale}
          onClick={() => handleLanguageChange(locale)}
          disabled={isPending}
          className="px-3 py-1 text-sm rounded-md transition-colors hover:bg-gray-100 disabled:opacity-50"
        >
          {locale === 'en' ? 'EN' : '中文'}
        </button>
      ))}
    </div>
  )
}
