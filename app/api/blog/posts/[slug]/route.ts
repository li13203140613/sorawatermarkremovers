import { NextRequest, NextResponse } from 'next/server'
import { getPostBySlug, getRelatedPosts } from '@/lib/blog/utils'
import { Language } from '@/lib/blog/types'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { searchParams } = new URL(request.url)
  const lang = (searchParams.get('lang') || 'zh') as Language
  const { slug } = await params

  try {
    const post = getPostBySlug(slug, lang)

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    const relatedPosts = getRelatedPosts(slug, lang, 3)

    return NextResponse.json({
      post,
      relatedPosts
    })
  } catch (error) {
    console.error('Error fetching post:', error)
    return NextResponse.json(
      { error: 'Failed to fetch post' },
      { status: 500 }
    )
  }
}
