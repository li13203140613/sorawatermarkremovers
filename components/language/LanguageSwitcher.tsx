'use client'

import { useTransition, useState, useEffect } from 'react'
import { locales, type Locale } from '@/i18n'

export default function LanguageSwitcher() {
  const [isPending, startTransition] = useTransition()
  const [currentLocale, setCurrentLocale] = useState<Locale>('zh')
  const [isOpen, setIsOpen] = useState(false)

  // 读取当前语言
  useEffect(() => {
    const cookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('NEXT_LOCALE='))
    const locale = cookie?.split('=')[1] as Locale
    if (locale && locales.includes(locale)) {
      setCurrentLocale(locale)
    }
  }, [])

  const handleLanguageChange = (locale: Locale) => {
    setIsOpen(false)
    startTransition(() => {
      document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000`
      window.location.reload()
    })
  }

  const getLanguageLabel = (locale: Locale) => {
    return locale === 'en' ? 'EN' : '中文'
  }

  return (
    <div className="relative">
      {/* 下拉按钮 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50"
      >
        <span>🌐</span>
        <span>{getLanguageLabel(currentLocale)}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* 下拉菜单 */}
      {isOpen && (
        <>
          {/* 点击遮罩关闭 */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
            {locales.map((locale) => (
              <button
                key={locale}
                onClick={() => handleLanguageChange(locale)}
                className={`w-full px-4 py-2 text-sm text-left hover:bg-gray-100 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                  currentLocale === locale ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-gray-700'
                }`}
              >
                {getLanguageLabel(locale)}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
