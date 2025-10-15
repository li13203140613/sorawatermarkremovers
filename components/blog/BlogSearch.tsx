'use client'

import { useState } from 'react'

interface BlogSearchProps {
  lang: 'zh' | 'en'
  onSearch: (query: string) => void
}

const UI_TEXT = {
  zh: {
    placeholder: '搜索文章...',
    search: '搜索'
  },
  en: {
    placeholder: 'Search articles...',
    search: 'Search'
  }
}

export default function BlogSearch({ lang, onSearch }: BlogSearchProps) {
  const [query, setQuery] = useState('')
  const text = UI_TEXT[lang]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(query)
  }

  return (
    <form onSubmit={handleSubmit} className="mb-8">
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={text.placeholder}
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
        />
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          {text.search}
        </button>
      </div>
    </form>
  )
}
