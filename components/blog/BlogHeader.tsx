import { BlogPost } from '@/lib/blog/types'

interface BlogHeaderProps {
  post: BlogPost
  lang: 'zh' | 'en'
}

const UI_TEXT = {
  zh: {
    author: '作者',
    publishedOn: '发布于'
  },
  en: {
    author: 'Author',
    publishedOn: 'Published on'
  }
}

export default function BlogHeader({ post, lang }: BlogHeaderProps) {
  const text = UI_TEXT[lang]

  return (
    <header className="mb-8">
      <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
        {post.title}
      </h1>

      <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
        {post.description}
      </p>

      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <span className="font-medium">{text.author}:</span>
          <span>{post.author}</span>
        </div>

        <span>•</span>

        <time dateTime={post.date}>
          {text.publishedOn}{' '}
          {new Date(post.date).toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </time>

        <span>•</span>

        <span>{post.readingTime}</span>
      </div>

      <div className="flex flex-wrap gap-2 mt-4">
        {post.tags.map(tag => (
          <span
            key={tag}
            className="px-3 py-1 text-sm font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full"
          >
            {tag}
          </span>
        ))}
      </div>

      <hr className="mt-6 border-gray-200 dark:border-gray-700" />
    </header>
  )
}
