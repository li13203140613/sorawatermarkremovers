'use client'

import { useEffect } from 'react'
import { BlogPost } from '@/lib/blog/types'

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.sorawatermarkremovers.com'
const SITE_NAME = 'Sora Watermark Remover'
const LOGO_URL = `${SITE_URL}/sora2-icon.svg`

interface BlogArticleSchemaProps {
  post: BlogPost
  locale: string
}

/**
 * BlogArticleSchema 组件
 *
 * 生成符合 Schema.org Article 规范的 JSON-LD 结构化数据
 *
 * 好处：
 * 1. Google 搜索结果中显示作者、发布日期、修改日期
 * 2. 可能显示在"热门故事"轮播中
 * 3. 提升文章的搜索排名
 * 4. 支持 Google Discover 推荐
 *
 * @param post - 博客文章数据
 * @param locale - 语言（zh/en）
 */
export function BlogArticleSchema({ post, locale }: BlogArticleSchemaProps) {
  useEffect(() => {
    // 构建文章 URL
    const articleUrl = `${SITE_URL}/${locale}/blog/${post.slug}`

    // 构建结构化数据
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: post.title,
      description: post.description,
      image: `${SITE_URL}/og-image.jpg`, // 可以根据文章添加不同的图片
      author: {
        '@type': 'Person',
        name: post.author,
        url: `${SITE_URL}/${locale}/blog`,
      },
      publisher: {
        '@type': 'Organization',
        name: SITE_NAME,
        logo: {
          '@type': 'ImageObject',
          url: LOGO_URL,
        },
      },
      datePublished: post.date,
      dateModified: post.date, // 如果有修改日期，可以添加单独字段
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': articleUrl,
      },
      articleSection: post.tags[0] || 'Technology',
      keywords: post.tags.join(', '),
      wordCount: post.content.split(/\s+/).length,
      timeRequired: post.readingTime,
      inLanguage: locale === 'zh' ? 'zh-CN' : 'en-US',
    }

    // 创建 script 标签
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.text = JSON.stringify(schema)
    script.id = 'blog-article-schema'

    // 添加到 head
    document.head.appendChild(script)

    // 清理函数
    return () => {
      const existingScript = document.getElementById('blog-article-schema')
      if (existingScript) {
        existingScript.remove()
      }
    }
  }, [post, locale])

  return null // 不渲染任何可见内容
}
