import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { processVideo } from '@/lib/video'
import { verifyTurnstileToken } from '@/lib/turnstile/verify'

export async function POST(request: NextRequest) {
  try {
    // 1. 验证用户身份
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // 2. 获取请求参数
    const body = await request.json()
    const { shareLink, visitorId, turnstileToken } = body

    if (!shareLink) {
      return NextResponse.json(
        { error: '缺少分享链接参数' },
        { status: 400 }
      )
    }

    // 3. 未登录用户需要验证 Turnstile
    if (!user && visitorId) {
      if (!turnstileToken) {
        return NextResponse.json(
          { error: 'Missing Turnstile verification' },
          { status: 400 }
        )
      }

      const isValidToken = await verifyTurnstileToken(turnstileToken)
      if (!isValidToken) {
        return NextResponse.json(
          { error: 'Turnstile verification failed. Please try again.' },
          { status: 403 }
        )
      }
    }

    // 4. 判断用户类型并处理视频
    let result

    if (user) {
      // 已登录用户 → Database 轨道
      result = await processVideo(shareLink, user.id, undefined)
    } else if (visitorId) {
      // 未登录用户 → Cookie 轨道
      result = await processVideo(shareLink, null, visitorId)
    } else {
      return NextResponse.json(
        { error: '缺少用户身份信息' },
        { status: 400 }
      )
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    // 5. 返回结果
    return NextResponse.json({
      success: true,
      videoUrl: result.videoUrl,
      shouldConsumeCredit: result.shouldConsumeCredit, // Cookie 轨道需要
    })
  } catch (error) {
    console.error('API 错误:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}
