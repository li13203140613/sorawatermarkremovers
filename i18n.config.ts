export const locales = ['en', 'zh', 'ja', 'de', 'zh-hant'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'en'
