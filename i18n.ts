import { getRequestConfig } from 'next-intl/server'
import { notFound } from 'next/navigation'

// 支持的语言列表（后端支持所有语言，但前端只显示中英文）
export const locales = ['en', 'zh', 'ja', 'de', 'zh-hant'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'en'

// 前端显示的语言（只显示中英文）
export const displayLocales = ['en', 'zh'] as const
export type DisplayLocale = (typeof displayLocales)[number]

// 语言显示名称
export const localeNames: Record<Locale, string> = {
  en: 'English',
  zh: '简体中文',
  ja: '日本語',
  de: 'Deutsch',
  'zh-hant': '繁體中文'
}

export default getRequestConfig(async ({ locale }) => {
  // 验证传入的 locale 是否在支持的语言列表中
  if (!locales.includes(locale as any)) {
    notFound()
  }

  return {
    locale: locale as string,
    messages: (await import(`./messages/${locale}.json`)).default
  }
})