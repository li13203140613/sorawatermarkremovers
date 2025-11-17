'use client'

import { usePathname } from 'next/navigation'

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.sorawatermarkremovers.com'
const LANGUAGES = ['zh', 'en', 'ja', 'de', 'zh-hant'] as const

/**
 * AlternateLangs 组件
 *
 * 用于生成 hreflang 和 canonical 标签，解决 Google Search Console 的以下问题：
 * 1. "重复网页，用户未选定规范网页" - 通过 canonical 标签指定主版本
 * 2. 多语言页面的正确索引 - 通过 hreflang 标签告知 Google 语言关系
 *
 * @example
 * // 在 layout.tsx 中使用
 * <head>
 *   <AlternateLangs />
 * </head>
 */
export function AlternateLangs() {
  const pathname = usePathname()

  // 提取当前路径（不含语言前缀）
  const currentLang = LANGUAGES.find(lang => pathname.startsWith(`/${lang}`))
  const pathWithoutLang = currentLang
    ? pathname.replace(`/${currentLang}`, '') || '/'
    : pathname

  // 生成 canonical URL（当前语言版本）
  const canonicalUrl = `${SITE_URL}${pathname}`

  return (
    <>
      {/* Canonical 标签 - 指定当前页面的规范 URL */}
      <link rel="canonical" href={canonicalUrl} />

      {/* hreflang 标签 - 指定所有语言版本的关系 */}
      {LANGUAGES.map(lang => {
        const langPath = pathWithoutLang === '/' ? '' : pathWithoutLang
        const href = `${SITE_URL}/${lang}${langPath}`

        return (
          <link
            key={lang}
            rel="alternate"
            hrefLang={lang}
            href={href}
          />
        )
      })}

      {/* x-default 标签 - 指定默认语言（中文） */}
      <link
        rel="alternate"
        hrefLang="x-default"
        href={`${SITE_URL}/zh${pathWithoutLang === '/' ? '' : pathWithoutLang}`}
      />
    </>
  )
}
