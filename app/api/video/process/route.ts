import { NextRequest } from 'next/server'
import { createClient, createClientWithCookie } from '@/lib/supabase/server'
import { processVideo } from '@/lib/video'
import { verifyTurnstileToken } from '@/lib/turnstile/verify'
import {
  createUsageLog,
  extractPlatform,
  getClientIp,
  getUserAgent,
} from '@/lib/admin'
import {
  handleCorsPreflightRequest,
  apiError,
  apiSuccess,
} from '@/lib/api/utils'
import { videoLogger } from '@/lib/logger'

/**
 * 处理 CORS 预检请求
 */
export async function OPTIONS(request: NextRequest) {
  const corsResponse = handleCorsPreflightRequest(request)
  return corsResponse || apiSuccess({ data: null })
}

/**
 * 视频处理 API 端点
 * 支持 Bearer Token 和 Cookie 双认证
 */
export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin')

  try {
    // 1. 用户认证 - 支持 Bearer Token 和 Cookie 两种方式
    const authHeader = request.headers.get('authorization')
    const cookieHeader = request.headers.get('cookie')
    let user = null
    let supabase

    // 优先检查 Bearer Token (Chrome 插件)
    if (authHeader?.startsWith('Bearer ')) {
      videoLogger.info('使用 Bearer Token 认证 (Chrome 插件)')
      const token = authHeader.substring(7)

      try {
        // 创建临时客户端验证 token
        const { createClient: createSupabaseClient } = await import('@supabase/supabase-js')
        const tempClient = createSupabaseClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        const { data: userData, error: authError } = await tempClient.auth.getUser(token)

        if (authError || !userData.user) {
          videoLogger.error('Bearer Token 验证失败', authError?.message)
          return apiError({
            message: '认证失败，请重新登录',
            status: 401,
            origin,
          })
        }

        user = userData.user
        videoLogger.success('Bearer Token 验证成功', user.email)

        // 创建 Service Role 客户端用于数据库操作
        supabase = createSupabaseClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        )
      } catch (error) {
        videoLogger.error('Bearer Token 处理异常', error)
        return apiError({
          message: '认证失败',
          status: 401,
          origin,
        })
      }
    } else if (cookieHeader) {
      // Cookie 认证 (网页版或扩展的 Cookie 模式)
      videoLogger.info('使用 Cookie 认证')
      supabase = createClientWithCookie(cookieHeader)
      const { data: { user: cookieUser } } = await supabase.auth.getUser()
      user = cookieUser
    } else {
      // 回退到标准 Cookie 认证
      videoLogger.info('使用标准 Cookie 认证')
      supabase = await createClient()
      const { data: { user: standardUser } } = await supabase.auth.getUser()
      user = standardUser
    }

    // 2. 获取请求参数
    const body = await request.json()
    const { shareLink, visitorId, turnstileToken } = body

    if (!shareLink) {
      return apiError({
        message: '缺少分享链接参数',
        status: 400,
        origin,
      })
    }

    // 3. 未登录用户需要验证 Turnstile（开发环境跳过）
    const isDevelopment = process.env.NODE_ENV === 'development'

    if (!user && visitorId && !isDevelopment) {
      if (!turnstileToken) {
        return apiError({
          message: 'Missing Turnstile verification',
          status: 400,
          origin,
        })
      }

      const isValidToken = await verifyTurnstileToken(turnstileToken)
      if (!isValidToken) {
        return apiError({
          message: 'Turnstile verification failed. Please try again.',
          status: 403,
          origin,
        })
      }
    }

    // 4. 判断用户类型并处理视频
    let result

    if (user) {
      // 已登录用户 → Database 轨道
      videoLogger.info('处理已登录用户视频', { userId: user.id, shareLink })
      result = await processVideo(shareLink, user.id, undefined, supabase)
    } else if (visitorId) {
      // 未登录用户 → Cookie 轨道
      videoLogger.info('处理访客视频', { visitorId, shareLink })
      result = await processVideo(shareLink, null, visitorId)
    } else {
      return apiError({
        message: '缺少用户身份信息',
        status: 400,
        origin,
      })
    }

    // 5. 记录操作日志
    const platform = extractPlatform(shareLink)
    const ipAddress = getClientIp(request)
    const userAgent = getUserAgent(request)

    // 获取用户剩余积分（如果已登录）
    let creditsRemaining: number | null = null
    if (user && supabase) {
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
      videoLogger.error('视频处理失败', result.error)
      return apiError({
        message: result.error || '处理失败',
        status: 400,
        origin,
      })
    }

    // 6. 返回结果
    videoLogger.success('视频处理成功', { videoUrl: result.videoUrl })
    return apiSuccess({
      data: {
        success: true,
        videoUrl: result.videoUrl,
        shouldConsumeCredit: result.shouldConsumeCredit, // Cookie 轨道需要
      },
      origin,
    })
  } catch (error) {
    videoLogger.error('API 错误', error)
    return apiError({
      message: '服务器错误',
      status: 500,
      origin,
      details: error instanceof Error ? error.message : String(error),
    })
  }
}
