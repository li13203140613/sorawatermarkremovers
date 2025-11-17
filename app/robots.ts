import { MetadataRoute } from 'next'
import { locales } from '@/i18n.config'

export default function robots(): MetadataRoute.Robots {
  // 允许的路径（按多语言）
  const allowPaths = locales.flatMap(locale => [
    `/${locale}/`,
    `/${locale}/blog/`,
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
    sitemap: `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.sorawatermarkremovers.com'}/sitemap.xml`,
    host: process.env.NEXT_PUBLIC_APP_URL || 'https://www.sorawatermarkremovers.com',
  }
}
