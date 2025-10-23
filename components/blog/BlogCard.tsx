import Link from 'next/link'
import { BlogPost } from '@/lib/blog/types'

interface BlogCardProps {
  post: BlogPost
  lang: 'zh' | 'en'
}

const UI_TEXT = {
  zh: {
    readMore: '阅读更多',
    readTime: '阅读时间'
  },
  en: {
    readMore: 'Read More',
    readTime: 'Reading Time'
  }
}

export default function BlogCard({ post, lang }: BlogCardProps) {
  const text = UI_TEXT[lang]

  return (
    <article className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      <div className="p-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
          <time dateTime={post.date}>
            {new Date(post.date).toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </time>
          <span>•</span>
          <span>{post.readingTime}</span>
        </div>

        <Link href={`/blog/${post.slug}?lang=${lang}`}>
          <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
            {post.title}
          </h2>
        </Link>

        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
          {post.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {post.tags.slice(0, 3).map(tag => (
              <span
                key={tag}
                className="px-3 py-1 text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>

          <Link
            href={`/blog/${post.slug}?lang=${lang}`}
            className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 font-medium text-sm transition-colors"
          >
            {text.readMore} →
          </Link>
        </div>
      </div>
    </article>
  )
}
