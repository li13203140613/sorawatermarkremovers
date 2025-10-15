'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { serialize } from 'next-mdx-remote/serialize'
import { MDXRemoteSerializeResult } from 'next-mdx-remote'
import remarkGfm from 'remark-gfm'
import rehypePrism from 'rehype-prism-plus'
import BlogHeader from '@/components/blog/BlogHeader'
import BlogContent from '@/components/blog/BlogContent'
import BlogRelated from '@/components/blog/BlogRelated'
import { BlogPost, Language } from '@/lib/blog/types'
import Link from 'next/link'

const UI_TEXT = {
  zh: {
    loading: '加载中...',
    notFound: '文章不存在',
    backToBlog: '← 返回博客',
    switchToEn: 'English',
    switchToZh: '中文',
  },
  en: {
    loading: 'Loading...',
    notFound: 'Article not found',
    backToBlog: '← Back to Blog',
    switchToZh: '中文',
    switchToEn: 'English',
  }
}

export default function BlogPostPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const slug = params.slug as string
  const urlLang = searchParams.get('lang') as Language | null

  const [lang, setLang] = useState<Language>('zh')
  const [post, setPost] = useState<BlogPost | null>(null)
  const [mdxSource, setMdxSource] = useState<MDXRemoteSerializeResult | null>(null)
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const text = UI_TEXT[lang]

  // 初始化语言
  useEffect(() => {
    const initialLang = urlLang ||
      (document.cookie.includes('blog_lang=en') ? 'en' : 'zh')
    setLang(initialLang)
  }, [urlLang])

  // 获取文章
  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true)
      setNotFound(false)

      try {
        const response = await fetch(`/api/blog/posts/${slug}?lang=${lang}`)

        if (!response.ok) {
          setNotFound(true)
          return
        }

        const data = await response.json()

        if (!data.post) {
          setNotFound(true)
          return
        }

        setPost(data.post)
        setRelatedPosts(data.relatedPosts || [])

        // 序列化 MDX 内容
        const mdx = await serialize(data.post.content, {
          mdxOptions: {
            remarkPlugins: [remarkGfm],
            rehypePlugins: [rehypePrism],
          },
        })

        setMdxSource(mdx)
      } catch (error) {
        console.error('Failed to fetch post:', error)
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }

    if (slug && lang) {
      fetchPost()
    }
  }, [slug, lang])

  const switchLanguage = (newLang: Language) => {
    setLang(newLang)
    document.cookie = `blog_lang=${newLang}; path=/; max-age=31536000`
    const url = new URL(window.location.href)
    url.searchParams.set('lang', newLang)
    window.history.pushState({}, '', url)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">{text.loading}</p>
      </div>
    )
  }

  if (notFound || !post || !mdxSource) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400 text-xl mb-4">{text.notFound}</p>
        <Link
          href={`/blog?lang=${lang}`}
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
        >
          {text.backToBlog}
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Language Switcher */}
        <div className="flex justify-between items-center mb-8">
          <Link
            href={`/blog?lang=${lang}`}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
          >
            {text.backToBlog}
          </Link>

          <button
            onClick={() => switchLanguage(lang === 'zh' ? 'en' : 'zh')}
            className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            {lang === 'zh' ? text.switchToEn : text.switchToZh}
          </button>
        </div>

        {/* Article Header */}
        <BlogHeader post={post} lang={lang} />

        {/* Article Content */}
        <div className="mt-8">
          <BlogContent source={mdxSource} />
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <BlogRelated posts={relatedPosts} lang={lang} />
        )}
      </article>
    </div>
  )
}
