import Link from 'next/link'
import { BlogPost } from '@/lib/blog/types'
import { ArrowRight, Clock } from 'lucide-react'

interface BlogRelatedProps {
  posts: BlogPost[]
  lang: 'zh' | 'en'
}

const UI_TEXT = {
  zh: {
    relatedPosts: '相关文章推荐',
    subtitle: '您可能对这些内容也感兴趣',
    readArticle: '阅读文章'
  },
  en: {
    relatedPosts: 'Related Articles',
    subtitle: 'You might also be interested in these',
    readArticle: 'Read Article'
  }
}

export default function BlogRelated({ posts, lang }: BlogRelatedProps) {
  if (posts.length === 0) return null

  const text = UI_TEXT[lang]

  return (
    <section className="mt-16 pt-12 border-t border-gray-200 dark:border-gray-700">
      {/* Section Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {text.relatedPosts}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {text.subtitle}
        </p>
      </div>

      {/* Related Posts Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {posts.map(post => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}?lang=${lang}`}
            className="group block bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-purple-500 hover:shadow-lg transition-all duration-200 overflow-hidden"
          >
            {/* Card Header */}
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 p-6">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-2">
                {post.title}
              </h3>
            </div>

            {/* Card Content */}
            <div className="p-6 space-y-4">
              {/* Description */}
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                {post.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {post.tags.slice(0, 3).map(tag => (
                  <span
                    key={tag}
                    className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Meta Info */}
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{post.readingTime}</span>
                </div>
                <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-medium group-hover:gap-2 transition-all">
                  <span>{text.readArticle}</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* SEO Tip */}
      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          💡 <strong>{lang === 'zh' ? '提示' : 'Tip'}:</strong>{' '}
          {lang === 'zh'
            ? '这些相关文章根据标签自动匹配，帮助您深入了解相关主题。'
            : 'These related articles are automatically matched based on tags to help you explore related topics.'
          }
        </p>
      </div>
    </section>
  )
}
