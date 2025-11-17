'use client'

import { useEffect } from 'react'
import { BlogPost } from '@/lib/blog/types'

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.sorawatermarkremovers.com'

interface BlogListSchemaProps {
  posts: BlogPost[]
  locale: string
}

/**
 * BlogListSchema 组件
 *
 * 生成符合 Schema.org ItemList 规范的 JSON-LD 结构化数据
 *
 * 好处：
 * 1. Google 可以识别这是一个文章列表页
 * 2. 提升搜索结果中的显示效果
 * 3. 帮助 Google 理解页面结构
 *
 * @param posts - 博客文章列表
 * @param locale - 语言（zh/en）
 */
export function BlogListSchema({ posts, locale }: BlogListSchemaProps) {
  useEffect(() => {
    if (!posts || posts.length === 0) return

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      itemListElement: posts.slice(0, 10).map((post, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Article',
          '@id': `${SITE_URL}/${locale}/blog/${post.slug}`,
          url: `${SITE_URL}/${locale}/blog/${post.slug}`,
          headline: post.title,
          description: post.description,
          datePublished: post.date,
          author: {
            '@type': 'Person',
            name: post.author,
          },
          keywords: post.tags.join(', '),
        },
      })),
    }

    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.text = JSON.stringify(schema)
    script.id = 'blog-list-schema'

    document.head.appendChild(script)

    return () => {
      const existingScript = document.getElementById('blog-list-schema')
      if (existingScript) {
        existingScript.remove()
      }
    }
  }, [posts, locale])

  return null
}
