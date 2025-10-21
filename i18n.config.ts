// 保持与 i18n.ts 一致
export const locales = ['en', 'zh', 'ja', 'de', 'zh-hant'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'en'

// 前端显示的语言（只显示中英文）
export const displayLocales = ['en', 'zh'] as const
