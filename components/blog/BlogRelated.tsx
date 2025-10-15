import Link from 'next/link'
import { BlogPost } from '@/lib/blog/types'

interface BlogRelatedProps {
  posts: BlogPost[]
  lang: 'zh' | 'en'
}

const UI_TEXT = {
  zh: {
    relatedPosts: '相关文章'
  },
  en: {
    relatedPosts: 'Related Posts'
  }
}

export default function BlogRelated({ posts, lang }: BlogRelatedProps) {
  if (posts.length === 0) return null

  const text = UI_TEXT[lang]

  return (
    <section className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        {text.relatedPosts}
      </h2>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map(post => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}?lang=${lang}`}
            className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-lg transition-shadow"
          >
            <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400">
              {post.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {post.description}
            </p>
            <div className="flex gap-2 mt-3">
              {post.tags.slice(0, 2).map(tag => (
                <span
                  key={tag}
                  className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
