import { NextRequest, NextResponse } from 'next/server'
import { getAllPosts, getAllTags } from '@/lib/blog/utils'
import { Language } from '@/lib/blog/types'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const lang = (searchParams.get('lang') || 'en') as Language

  try {
    const posts = getAllPosts(lang)
    const tags = getAllTags(lang)

    return NextResponse.json({
      posts,
      tags,
      total: posts.length
    })
  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}
