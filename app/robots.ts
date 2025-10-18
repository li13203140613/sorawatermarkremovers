import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/dashboard/',
          '/payment/',
          '/test-*',
          '/auth/',
        ],
      },
    ],
    sitemap: 'https://www.sora-prompt.io/sitemap.xml',
    host: 'https://www.sora-prompt.io',
  }
}
