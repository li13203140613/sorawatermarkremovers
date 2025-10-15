export interface BlogPost {
  slug: string
  title: string
  description: string
  date: string
  author: string
  tags: string[]
  readingTime: string
  lang: 'zh' | 'en'
  content: string
}

export interface BlogFrontmatter {
  title: string
  description: string
  date: string
  author: string
  tags: string[]
}

export type Language = 'zh' | 'en'
