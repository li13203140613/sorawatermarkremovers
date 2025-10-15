import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import readingTime from 'reading-time'
import { BlogPost, BlogFrontmatter, Language } from './types'

const contentDirectory = path.join(process.cwd(), 'content/blog')

/**
 * 获取指定语言的所有博客文章
 */
export function getAllPosts(lang: Language): BlogPost[] {
  const langDir = path.join(contentDirectory, lang)

  // 检查目录是否存在
  if (!fs.existsSync(langDir)) {
    return []
  }

  const files = fs.readdirSync(langDir).filter(file => file.endsWith('.mdx'))

  const posts = files.map(filename => {
    const slug = filename.replace('.mdx', '')
    return getPostBySlug(slug, lang)
  }).filter(Boolean) as BlogPost[]

  // 按日期降序排序
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

/**
 * 根据 slug 和语言获取单篇文章
 */
export function getPostBySlug(slug: string, lang: Language): BlogPost | null {
  try {
    const filePath = path.join(contentDirectory, lang, `${slug}.mdx`)

    if (!fs.existsSync(filePath)) {
      return null
    }

    const fileContents = fs.readFileSync(filePath, 'utf8')
    const { data, content } = matter(fileContents)
    const frontmatter = data as BlogFrontmatter

    return {
      slug,
      title: frontmatter.title,
      description: frontmatter.description,
      date: frontmatter.date,
      author: frontmatter.author,
      tags: frontmatter.tags || [],
      readingTime: readingTime(content).text,
      lang,
      content
    }
  } catch (error) {
    console.error(`Error reading post ${slug}:`, error)
    return null
  }
}

/**
 * 获取所有文章的 slug（用于静态生成）
 */
export function getAllPostSlugs(lang: Language): string[] {
  const langDir = path.join(contentDirectory, lang)

  if (!fs.existsSync(langDir)) {
    return []
  }

  const files = fs.readdirSync(langDir).filter(file => file.endsWith('.mdx'))
  return files.map(filename => filename.replace('.mdx', ''))
}

/**
 * 根据标签筛选文章
 */
export function getPostsByTag(tag: string, lang: Language): BlogPost[] {
  const allPosts = getAllPosts(lang)
  return allPosts.filter(post => post.tags.includes(tag))
}

/**
 * 搜索文章（标题、描述、标签）
 */
export function searchPosts(query: string, lang: Language): BlogPost[] {
  const allPosts = getAllPosts(lang)
  const lowerQuery = query.toLowerCase()

  return allPosts.filter(post =>
    post.title.toLowerCase().includes(lowerQuery) ||
    post.description.toLowerCase().includes(lowerQuery) ||
    post.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  )
}

/**
 * 获取相关文章（基于标签）
 */
export function getRelatedPosts(slug: string, lang: Language, limit = 3): BlogPost[] {
  const currentPost = getPostBySlug(slug, lang)
  if (!currentPost) return []

  const allPosts = getAllPosts(lang).filter(post => post.slug !== slug)

  // 计算相关度分数
  const postsWithScore = allPosts.map(post => {
    const commonTags = post.tags.filter(tag => currentPost.tags.includes(tag))
    return {
      post,
      score: commonTags.length
    }
  })

  // 按相关度排序并返回前 N 篇
  return postsWithScore
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.post)
}

/**
 * 获取所有标签
 */
export function getAllTags(lang: Language): string[] {
  const allPosts = getAllPosts(lang)
  const tagsSet = new Set<string>()

  allPosts.forEach(post => {
    post.tags.forEach(tag => tagsSet.add(tag))
  })

  return Array.from(tagsSet).sort()
}
