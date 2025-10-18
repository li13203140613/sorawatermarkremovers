import { MetadataRoute } from 'next'
import { locales } from '@/i18n.config'

export default function robots(): MetadataRoute.Robots {
  // 为每个语言创建 allow 规则
  const allowPaths = locales.flatMap(locale => [
    `/${locale}/`,
    `/${locale}/blog/`,
    `/${locale}/sora2prompt/`,
    `/${locale}/pricing/`,
    `/${locale}/privacy/`,
  ])

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', ...allowPaths],
        disallow: [
          '/api/',
          '/admin/',
          '/*/dashboard/',
          '/*/payment/',
          '/*/auth/',
          '/test-*',
        ],
      },
    ],
    sitemap: 'https://www.sora-prompt.io/sitemap.xml',
    host: 'https://www.sora-prompt.io',
  }
}
