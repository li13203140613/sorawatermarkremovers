import { getRequestConfig } from 'next-intl/server'

export const locales = ['en', 'zh'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'zh'

export default getRequestConfig(async ({ locale }) => {
  // 如果 locale 无效，使用默认语言作为 fallback
  // 不能在 root layout 中使用 notFound()
  const validLocale = locale && locales.includes(locale as any)
    ? locale
    : defaultLocale

  return {
    locale: validLocale,
    messages: (await import(`./messages/${validLocale}.json`)).default
  }
})