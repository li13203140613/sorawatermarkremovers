'use client'

import { useEffect } from 'react'
import { BlogPost } from '@/lib/blog/types'

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.sorawatermarkremovers.com'
const SITE_NAME = 'Sora Watermark Remover'

interface BlogSEOHeadProps {
  post: BlogPost
  locale: string
}

/**
 * BlogSEOHead 组件
 *
 * 在客户端组件中动态设置 SEO meta 标签
 *
 * 包含：
 * - Title 和 Description
 * - Open Graph 标签（社交分享）
 * - Twitter Card 标签
 * - Canonical URL
 * - Hreflang 标签（多语言）
 *
 * @param post - 博客文章数据
 * @param locale - 语言（zh/en）
 */
export function BlogSEOHead({ post, locale }: BlogSEOHeadProps) {
  useEffect(() => {
    const articleUrl = `${SITE_URL}/${locale}/blog/${post.slug}`

    // 设置 title
    document.title = `${post.title} | ${SITE_NAME}`

    // 更新或创建 meta 标签的辅助函数
    const setMetaTag = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name'
      let meta = document.querySelector(`meta[${attribute}="${name}"]`)

      if (!meta) {
        meta = document.createElement('meta')
        meta.setAttribute(attribute, name)
        document.head.appendChild(meta)
      }

      meta.setAttribute('content', content)
    }

    // 基础 meta 标签
    setMetaTag('description', post.description)
    setMetaTag('keywords', post.tags.join(', '))
    setMetaTag('author', post.author)

    // Open Graph 标签
    setMetaTag('og:type', 'article', true)
    setMetaTag('og:title', post.title, true)
    setMetaTag('og:description', post.description, true)
    setMetaTag('og:url', articleUrl, true)
    setMetaTag('og:site_name', SITE_NAME, true)
    setMetaTag('og:locale', locale === 'zh' ? 'zh_CN' : 'en_US', true)
    setMetaTag('og:image', `${SITE_URL}/og-image.jpg`, true)
    setMetaTag('article:published_time', post.date, true)
    setMetaTag('article:author', post.author, true)
    setMetaTag('article:tag', post.tags[0] || '', true)

    // Twitter Card 标签
    setMetaTag('twitter:card', 'summary_large_image')
    setMetaTag('twitter:title', post.title)
    setMetaTag('twitter:description', post.description)
    setMetaTag('twitter:image', `${SITE_URL}/og-image.jpg`)

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', articleUrl)

    // Hreflang 标签（多语言）
    const languages = ['zh', 'en']

    // 清除旧的 hreflang 标签
    document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(el => el.remove())

    // 添加新的 hreflang 标签
    languages.forEach(lang => {
      const link = document.createElement('link')
      link.setAttribute('rel', 'alternate')
      link.setAttribute('hreflang', lang)
      link.setAttribute('href', `${SITE_URL}/${lang}/blog/${post.slug}`)
      document.head.appendChild(link)
    })

    // x-default
    const xDefault = document.createElement('link')
    xDefault.setAttribute('rel', 'alternate')
    xDefault.setAttribute('hreflang', 'x-default')
    xDefault.setAttribute('href', `${SITE_URL}/zh/blog/${post.slug}`)
    document.head.appendChild(xDefault)

    // 清理函数
    return () => {
      // 恢复默认 title
      document.title = SITE_NAME
    }
  }, [post, locale])

  return null
}
