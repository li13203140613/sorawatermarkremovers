import { MetadataRoute } from 'next'
import { getAllPosts } from '@/lib/blog/utils'
import { locales } from '@/i18n.config'

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.sorawatermarkremovers.com'

// 当前有效、可索引的静态页（多语言）
const STATIC_ROUTES = [
  '', // 首页
  '/pricing',
  '/blog',
  '/privacy',
]

export default function sitemap(): MetadataRoute.Sitemap {
  const sitemap: MetadataRoute.Sitemap = []

  // 静态页
  STATIC_ROUTES.forEach(route => {
    locales.forEach(lang => {
      sitemap.push({
        url: `${SITE_URL}/${lang}${route}`,
        lastModified: new Date(),
        changeFrequency: route === '' ? 'daily' : 'weekly',
        priority: route === '' ? 1.0 : 0.8,
      })
    })
  })

  // 博客文章（目前仅中英）
  locales
    .filter(lang => ['en', 'zh'].includes(lang))
    .forEach(lang => {
      const posts = getAllPosts(lang as 'zh' | 'en')
      posts.forEach(post => {
        sitemap.push({
          url: `${SITE_URL}/${lang}/blog/${post.slug}`,
          lastModified: new Date(post.date),
          changeFrequency: 'monthly',
          priority: 0.6,
        })
      })
    })

  return sitemap
}
