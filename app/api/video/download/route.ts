import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const url = searchParams.get('url')

    if (!url) {
      return NextResponse.json({ error: 'Missing video URL' }, { status: 400 })
    }

    // 检查用户认证和积分
    const supabase = await createClient()

    // 获取当前用户
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (user) {
      // 已登录用户，检查数据库积分
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('credits')
        .eq('id', user.id)
        .single()

      if (profileError || !profile) {
        return NextResponse.json({ error: '无法获取用户信息' }, { status: 403 })
      }

      if (profile.credits < 1) {
        return NextResponse.json({ error: '积分不足，请充值后再下载' }, { status: 403 })
      }

      // 扣除积分
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ credits: profile.credits - 1 })
        .eq('id', user.id)

      if (updateError) {
        console.error('Failed to deduct credits:', updateError)
        return NextResponse.json({ error: '扣除积分失败' }, { status: 500 })
      }

      // 记录使用日志
      await supabase
        .from('usage_logs')
        .insert({
          user_id: user.id,
          action: 'download_video',
          credits_used: 1,
          metadata: { video_url: url }
        })
    }
    // 未登录用户的积分检查和扣除在客户端处理

    // 从外部 URL 获取视频
    const response = await fetch(url)

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch video' }, { status: 500 })
    }

    // 获取视频数据
    const videoData = await response.arrayBuffer()

    // 返回视频文件，设置正确的 headers
    return new NextResponse(videoData, {
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Disposition': 'attachment; filename="video.mp4"',
        'Cache-Control': 'public, max-age=31536000',
      },
    })
  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json({ error: 'Download failed' }, { status: 500 })
  }
}
