import { NextRequest, NextResponse } from 'next/server'
import { createClient, createClientWithCookie } from '@/lib/supabase/server'
import { processVideo } from '@/lib/video'
import { verifyTurnstileToken } from '@/lib/turnstile/verify'
import {
  createUsageLog,
  extractPlatform,
  getClientIp,
  getUserAgent,
} from '@/lib/admin'

// ========== CORS 配置 ==========

// 定义允许的来源
const ALLOWED_ORIGINS = [
  'https://www.sora-prompt.io',
  'chrome-extension://ibeimhfbbijepbkhppinidodjbolpold'  // Chrome 插件
]

// 检查来源是否允许
function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false
  return ALLOWED_ORIGINS.includes(origin)
}

// 生成 CORS 响应头
function getCorsHeaders(origin: string | null) {
  return {
    'Access-Control-Allow-Origin': isOriginAllowed(origin) ? origin! : 'https://www.sora-prompt.io',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400', // 24 小时缓存预检请求
  }
}

// 处理 OPTIONS 预检请求
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin')
  return new NextResponse(null, {
    status: 200,
    headers: getCorsHeaders(origin),
  })
}

// ========== POST 请求处理 ==========

export async function POST(request: NextRequest) {
  // 获取请求来源并设置 CORS 响应头
  const origin = request.headers.get('origin')
  const headers = getCorsHeaders(origin)
  try {
    // 1. 用户认证 - 支持 Bearer Token 和 Cookie 两种方式
    const authHeader = request.headers.get('authorization')
    const cookieHeader = request.headers.get('cookie')
    let user = null
    let supabase

    // 优先检查 Bearer Token (Chrome 插件)
    if (authHeader && authHeader.startsWith('Bearer ')) {
      console.log('🔑 使用 Bearer Token 认证 (Chrome 插件)')
      const token = authHeader.split(' ')[1]

      try {
        // 创建临时客户端验证 token
        const { createClient: createSupabaseClient } = await import('@supabase/supabase-js')
        const tempClient = createSupabaseClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        // 验证 token 并获取用户
        const { data: userData, error: authError } = await tempClient.auth.getUser(token)

        if (authError || !userData.user) {
          console.error('❌ Bearer Token 验证失败:', authError?.message)
          return NextResponse.json(
            { error: '认证失败，请重新登录' },
            { status: 401, headers }
          )
        }

        user = userData.user
        console.log('✅ Bearer Token 验证成功:', user.email)

        // 创建 Service Role 客户端用于数据库操作
        supabase = createSupabaseClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        )
      } catch (error) {
        console.error('❌ Bearer Token 处理异常:', error)
        return NextResponse.json(
          { error: '认证失败' },
          { status: 401, headers }
        )
      }

    } else if (cookieHeader) {
      // Cookie 认证 (网页版或扩展的 Cookie 模式)
      console.log('🍪 使用 Cookie 认证')
      supabase = createClientWithCookie(cookieHeader)

      const { data: { user: cookieUser } } = await supabase.auth.getUser()
      user = cookieUser

    } else {
      // 回退到标准 Cookie 认证
      console.log('🌐 使用标准 Cookie 认证')
      supabase = await createClient()

      const { data: { user: standardUser } } = await supabase.auth.getUser()
      user = standardUser
    }

    // 3. 获取请求参数
    const body = await request.json()
    const { shareLink, visitorId, turnstileToken } = body

    if (!shareLink) {
      return NextResponse.json(
        { error: '缺少分享链接参数' },
        { status: 400, headers }
      )
    }

    // 4. 未登录用户需要验证 Turnstile（开发环境跳过）
    const isDevelopment = process.env.NODE_ENV === 'development'

    if (!user && visitorId && !isDevelopment) {
      if (!turnstileToken) {
        return NextResponse.json(
          { error: 'Missing Turnstile verification' },
          { status: 400, headers }
        )
      }

      const isValidToken = await verifyTurnstileToken(turnstileToken)
      if (!isValidToken) {
        return NextResponse.json(
          { error: 'Turnstile verification failed. Please try again.' },
          { status: 403, headers }
        )
      }
    }

    // 5. 判断用户类型并处理视频
    let result

    if (user) {
      // 已登录用户 → Database 轨道
      result = await processVideo(shareLink, user.id, undefined, supabase)
    } else if (visitorId) {
      // 未登录用户 → Cookie 轨道
      result = await processVideo(shareLink, null, visitorId)
    } else {
      return NextResponse.json(
        { error: '缺少用户身份信息' },
        { status: 400, headers }
      )
    }

    // 6. 记录操作日志
    const platform = extractPlatform(shareLink)
    const ipAddress = getClientIp(request)
    const userAgent = getUserAgent(request)

    // 获取用户剩余积分（如果已登录）
    let creditsRemaining: number | null = null
    if (user) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('credits')
        .eq('id', user.id)
        .single()
      creditsRemaining = profile?.credits ?? null
    }

    await createUsageLog({
      userId: user?.id,
      userEmail: user?.email,
      originalUrl: shareLink,
      processedUrl: result.success ? result.videoUrl : null,
      creditsUsed: result.success ? 1 : 0,
      creditsRemaining,
      status: result.success ? 'success' : 'failed',
      errorMessage: result.success ? null : result.error,
      platform,
      ipAddress,
      userAgent,
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400, headers }
      )
    }

    // 7. 返回结果（带上 CORS 响应头）
    return NextResponse.json({
      success: true,
      videoUrl: result.videoUrl,
      shouldConsumeCredit: result.shouldConsumeCredit, // Cookie 轨道需要
    }, { headers })
  } catch (error) {
    console.error('API 错误:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500, headers }
    )
  }
}
