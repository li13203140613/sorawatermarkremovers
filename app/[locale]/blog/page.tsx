'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import BlogCard from '@/components/blog/BlogCard'
import { BlogPost, Language } from '@/lib/blog/types'
import { BlogListSchema, BreadcrumbSchema, getBlogBreadcrumbs } from '@/components/seo'

const UI_TEXT = {
  zh: {
    title: '博客',
    subtitle: '分享视频处理技巧、AI 技术和产品更新',
    allPosts: '所有文章',
    loading: '加载中...',
    noResults: '未找到相关文章',
    searchPlaceholder: '搜索文章...',
    filterByTag: '按标签筛选',
    allTags: '所有标签',
    switchToEn: 'English',
    switchToZh: '中文',
  },
  en: {
    title: 'Blog',
    subtitle: 'Share video processing tips, AI technology and product updates',
    allPosts: 'All Posts',
    loading: 'Loading...',
    noResults: 'No articles found',
    searchPlaceholder: 'Search articles...',
    filterByTag: 'Filter by tag',
    allTags: 'All Tags',
    switchToEn: 'English',
    switchToZh: '中文',
  }
}

export default function BlogPage() {
  const searchParams = useSearchParams()
  const urlLang = searchParams.get('lang') as Language | null

  const [lang, setLang] = useState<Language>('en')
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState<string>('all')
  const [allTags, setAllTags] = useState<string[]>([])

  const text = UI_TEXT[lang]

  // 初始化语言
  useEffect(() => {
    const initialLang = urlLang ||
      (document.cookie.includes('blog_lang=zh') ? 'zh' : 'en')
    setLang(initialLang)
  }, [urlLang])

  // 获取文章
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/blog/posts?lang=${lang}`)
        const data = await response.json()
        setPosts(data.posts || [])
        setFilteredPosts(data.posts || [])
        setAllTags(data.tags || [])
      } catch (error) {
        console.error('Failed to fetch posts:', error)
        setPosts([])
        setFilteredPosts([])
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [lang])

  // 搜索和筛选
  useEffect(() => {
    let result = posts

    // 按搜索关键词筛选
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        post =>
          post.title.toLowerCase().includes(query) ||
          post.description.toLowerCase().includes(query) ||
          post.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    // 按标签筛选
    if (selectedTag !== 'all') {
      result = result.filter(post => post.tags.includes(selectedTag))
    }

    setFilteredPosts(result)
  }, [searchQuery, selectedTag, posts])

  const switchLanguage = (newLang: Language) => {
    setLang(newLang)
    document.cookie = `blog_lang=${newLang}; path=/; max-age=31536000`
    const url = new URL(window.location.href)
    url.searchParams.set('lang', newLang)
    window.history.pushState({}, '', url)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* SEO Components */}
      {posts.length > 0 && <BlogListSchema posts={posts} locale={lang} />}
      <BreadcrumbSchema items={getBlogBreadcrumbs(lang)} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-end mb-4">
            <button
              onClick={() => switchLanguage(lang === 'zh' ? 'en' : 'zh')}
              className="px-4 py-2 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              {lang === 'zh' ? text.switchToEn : text.switchToZh}
            </button>
          </div>

          <h1 className="text-5xl font-bold mb-4 text-gray-900 dark:text-white">
            {text.title}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            {text.subtitle}
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          {/* Search */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={text.searchPlaceholder}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
          />

          {/* Tag Filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedTag('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedTag === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {text.allTags}
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedTag === tag
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Posts */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">{text.loading}</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">{text.noResults}</p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredPosts.map(post => (
              <BlogCard key={post.slug} post={post} lang={lang} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
