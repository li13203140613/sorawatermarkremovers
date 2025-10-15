import { notFound } from 'next/navigation'
import { getRequestConfig } from 'next-intl/server'

export const locales = ['en', 'zh'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'zh'

export default getRequestConfig(async ({ locale }) => {
  // 验证传入的 locale 是否有效
  if (!locale || !locales.includes(locale as any)) notFound()

  return {
    locale: locale as string,
    messages: (await import(`./messages/${locale}.json`)).default
  }
})