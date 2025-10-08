import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { processVideo } from '@/lib/video'

export async function POST(request: NextRequest) {
  try {
    // 1. 验证用户身份
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: '未登录，请先登录' },
        { status: 401 }
      )
    }

    // 2. 获取请求参数
    const body = await request.json()
    const { shareLink } = body

    if (!shareLink) {
      return NextResponse.json(
        { error: '缺少分享链接参数' },
        { status: 400 }
      )
    }

    // 3. 处理视频
    const result = await processVideo(shareLink, user.id)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    // 4. 返回结果
    return NextResponse.json({
      success: true,
      videoUrl: result.videoUrl,
    })
  } catch (error) {
    console.error('API 错误:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}
