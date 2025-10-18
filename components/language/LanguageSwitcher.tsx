'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useTransition, useState } from 'react'
import { locales, localeNames, type Locale } from '@/i18n'

export default function LanguageSwitcher() {
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  const [isOpen, setIsOpen] = useState(false)

  // 从 URL 路径中获取当前语言
  const currentLocale = (pathname.split('/')[1] as Locale) || 'en'

  const handleLanguageChange = (newLocale: Locale) => {
    setIsOpen(false)

    if (newLocale === currentLocale) return

    startTransition(() => {
      // 将当前路径的语言部分替换为新语言
      const pathWithoutLocale = pathname.replace(`/${currentLocale}`, '')
      const newPath = `/${newLocale}${pathWithoutLocale || ''}`

      router.push(newPath)
    })
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
        <span>{localeNames[currentLocale]}</span>
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
          <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
            {locales.map((locale) => (
              <button
                key={locale}
                onClick={() => handleLanguageChange(locale)}
                className={`w-full px-4 py-2 text-sm text-left hover:bg-gray-100 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                  currentLocale === locale ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-gray-700'
                }`}
              >
                {localeNames[locale]}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
