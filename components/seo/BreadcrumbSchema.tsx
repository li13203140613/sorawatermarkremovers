'use client'

import { useEffect } from 'react'

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.sorawatermarkremovers.com'

interface BreadcrumbItem {
  name: string
  url: string
}

interface BreadcrumbSchemaProps {
  items: BreadcrumbItem[]
}

/**
 * BreadcrumbSchema 组件
 *
 * 生成符合 Schema.org BreadcrumbList 规范的 JSON-LD 结构化数据
 *
 * 好处：
 * 1. Google 搜索结果中显示面包屑导航
 * 2. 提升用户体验（显示页面层级结构）
 * 3. 提升 SEO 排名
 *
 * 示例：
 * 首页 > 博客 > 文章标题
 *
 * @param items - 面包屑项目列表
 */
export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  useEffect(() => {
    if (!items || items.length === 0) return

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url,
      })),
    }

    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.text = JSON.stringify(schema)
    script.id = 'breadcrumb-schema'

    document.head.appendChild(script)

    return () => {
      const existingScript = document.getElementById('breadcrumb-schema')
      if (existingScript) {
        existingScript.remove()
      }
    }
  }, [items])

  return null
}

/**
 * 为博客文章生成面包屑数据
 */
export function getBlogBreadcrumbs(locale: string, postTitle?: string): BreadcrumbItem[] {
  const breadcrumbs: BreadcrumbItem[] = [
    {
      name: locale === 'zh' ? '首页' : 'Home',
      url: `${SITE_URL}/${locale}`,
    },
    {
      name: locale === 'zh' ? '博客' : 'Blog',
      url: `${SITE_URL}/${locale}/blog`,
    },
  ]

  if (postTitle) {
    breadcrumbs.push({
      name: postTitle,
      url: window.location.href,
    })
  }

  return breadcrumbs
}
