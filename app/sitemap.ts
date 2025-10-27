import { MetadataRoute } from 'next'
import { getAllPosts } from '@/lib/blog/utils'

const SITE_URL = 'https://sora-prompt.io'

// 支持的语言
const LANGUAGES = ['zh', 'en']

// 静态页面路由
const STATIC_ROUTES = [
  '',  // 首页
  '/dashboard',
  '/video-generation',
  '/soraprompting',
  '/pricing',
  '/blog',
  '/login',
  '/privacy',
]

export default function sitemap(): MetadataRoute.Sitemap {
  const sitemap: MetadataRoute.Sitemap = []

  // 1. 添加静态页面（包含所有语言版本）
  STATIC_ROUTES.forEach(route => {
    LANGUAGES.forEach(lang => {
      sitemap.push({
        url: `${SITE_URL}/${lang}${route}`,
        lastModified: new Date(),
        changeFrequency: route === '' ? 'daily' : 'weekly',
        priority: route === '' ? 1.0 : 0.8,
      })
    })
  })

  // 2. 添加博客文章（所有语言）
  LANGUAGES.forEach(lang => {
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
