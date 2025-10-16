import { NextRequest, NextResponse } from 'next/server'
import { createClient, createClientWithCookie } from '@/lib/supabase/server'
import { classifyError, logErrorDetail, API_ERRORS } from '@/lib/api/error-classifier'

/**
 * CORS 配置
 */
const ALLOWED_ORIGINS = [
  'https://www.sora-prompt.io',
  'chrome-extension://ibeimhfbbijepbkhppinidodjbolpold'  // Chrome 插件
]

function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false
  return ALLOWED_ORIGINS.includes(origin)
}

function getCorsHeaders(origin: string | null) {
  return {
    'Access-Control-Allow-Origin': isOriginAllowed(origin) ? origin! : 'https://www.sora-prompt.io',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
  }
}

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin')
  return new NextResponse(null, {
    status: 200,
    headers: getCorsHeaders(origin),
  })
}

/**
 * 获取用户信息
 */
export async function GET(request: NextRequest) {
  const origin = request.headers.get('origin')
  const headers = getCorsHeaders(origin)

  try {
    console.log('\n📡 ============ API 请求开始 ============')
    console.log('🌐 Origin:', origin)
    console.log('🕐 时间:', new Date().toISOString())

    // ===== 阶段 1: 环境变量检查 =====
    console.log('\n🔧 检查环境变量配置...')
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const errorDetail = {
        ...API_ERRORS.CONFIG_MISSING_SUPABASE_URL,
        technicalDetail: 'NEXT_PUBLIC_SUPABASE_URL is undefined',
        timestamp: new Date().toISOString(),
      }
      logErrorDetail('环境配置检查', errorDetail)
      return NextResponse.json(
        { error: errorDetail },
        { status: errorDetail.httpStatus, headers }
      )
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const errorDetail = {
        ...API_ERRORS.CONFIG_MISSING_ANON_KEY,
        technicalDetail: 'NEXT_PUBLIC_SUPABASE_ANON_KEY is undefined',
        timestamp: new Date().toISOString(),
      }
      logErrorDetail('环境配置检查', errorDetail)
      return NextResponse.json(
        { error: errorDetail },
        { status: errorDetail.httpStatus, headers }
      )
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const errorDetail = {
        ...API_ERRORS.CONFIG_MISSING_SERVICE_KEY,
        technicalDetail: 'SUPABASE_SERVICE_ROLE_KEY is undefined',
        timestamp: new Date().toISOString(),
      }
      logErrorDetail('环境配置检查', errorDetail)
      return NextResponse.json(
        { error: errorDetail },
        { status: errorDetail.httpStatus, headers }
      )
    }

    console.log('✅ 环境变量配置完整')

    // ===== 阶段 2: 用户认证 =====
    const authHeader = request.headers.get('authorization')
    const cookieHeader = request.headers.get('cookie')

    let supabase
    let user = null

    console.log('\n🔐 开始用户认证...')
    console.log('   Auth Header:', authHeader ? '存在' : '不存在')
    console.log('   Cookie Header:', cookieHeader ? '存在' : '不存在')

    // 1. 优先检查 Bearer token（扩展 OAuth 登录）
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1]
      console.log('\n🔑 使用 Bearer Token 认证')
      console.log('   Token 长度:', token.length, '字符')
      console.log('   Token 前缀:', token.substring(0, 20) + '...')

      try {
        // 创建一个临时的 Supabase 客户端用于验证 token
        const { createClient: createSupabaseClient } = await import('@supabase/supabase-js')
        const tempClient = createSupabaseClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        // 使用用户 token 验证身份
        const { data: userData, error: authError } = await tempClient.auth.getUser(token)

        if (authError) {
          // 详细分类认证错误
          const errorDetail = classifyError(authError, 'auth')
          logErrorDetail('Bearer Token 认证', errorDetail)

          // Bearer token 失败后不再尝试其他认证方式，直接返回错误
          return NextResponse.json(
            { error: errorDetail },
            { status: errorDetail.httpStatus, headers }
          )
        }

        if (!userData.user) {
          const errorDetail = {
            ...API_ERRORS.AUTH_USER_NOT_FOUND,
            technicalDetail: 'Token 验证成功但未返回用户信息',
            timestamp: new Date().toISOString(),
          }
          logErrorDetail('Bearer Token 认证', errorDetail)
          return NextResponse.json(
            { error: errorDetail },
            { status: errorDetail.httpStatus, headers }
          )
        }

        user = userData.user
        console.log('✅ Bearer Token 验证成功')
        console.log('   用户 ID:', user.id)
        console.log('   邮箱:', user.email)

        // 验证成功后，创建 Service Role 客户端用于查询数据库（绕过 RLS）
        supabase = createSupabaseClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        )
        console.log('✅ Service Role 客户端已创建（绕过 RLS）')

      } catch (error) {
        const errorDetail = classifyError(error, 'auth')
        logErrorDetail('Bearer Token 认证异常', errorDetail)
        return NextResponse.json(
          { error: errorDetail },
          { status: errorDetail.httpStatus, headers }
        )
      }
    }

    // 2. 如果 Bearer token 失败或不存在，尝试 Cookie
    if (!user) {
      console.log('\n🍪 使用 Cookie 认证')

      if (cookieHeader) {
        console.log('   Cookie 来源: Extension Header')
        supabase = createClientWithCookie(cookieHeader)
      } else {
        console.log('   Cookie 来源: 标准 Request')
        supabase = await createClient()
      }

      // 获取用户信息
      const { data: { user: cookieUser }, error: authError } = await supabase.auth.getUser()

      if (authError || !cookieUser) {
        const errorDetail = classifyError(authError || new Error('未登录'), 'auth')
        logErrorDetail('Cookie 认证', errorDetail)
        return NextResponse.json(
          { error: errorDetail },
          { status: 401, headers }
        )
      }

      user = cookieUser
      console.log('✅ Cookie 认证成功')
      console.log('   用户 ID:', user.id)
      console.log('   邮箱:', user.email)
    }

    // ===== 阶段 3: 查询用户档案和积分 =====
    console.log('\n🗄️ 查询用户档案...')
    console.log('   查询用户 ID:', user.id)
    console.log('   查询邮箱:', user.email)

    if (!supabase) {
      const errorDetail = {
        code: 'SUPABASE_CLIENT_NOT_INITIALIZED',
        message: 'Supabase 客户端未初始化',
        technicalDetail: 'Supabase client is undefined after authentication',
        httpStatus: 500,
        timestamp: new Date().toISOString(),
      }
      logErrorDetail('数据库客户端', errorDetail)
      return NextResponse.json(
        { error: errorDetail },
        { status: 500, headers }
      )
    }

    let { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('credits')
      .eq('id', user.id)
      .single()

    // 处理查询错误
    if (profileError) {
      console.log('\n⚠️ 用户档案查询遇到问题')
      console.log('   错误代码:', profileError.code)
      console.log('   错误消息:', profileError.message)

      // 用户档案不存在（PGRST116），自动创建
      if (profileError.code === 'PGRST116') {
        console.log('\n🆕 用户档案不存在，开始创建...')
        console.log('   用户 ID:', user.id)
        console.log('   邮箱:', user.email)
        console.log('   默认积分: 0')

        const { data: newProfile, error: insertError } = await supabase
          .from('user_profiles')
          .insert({
            id: user.id,
            email: user.email,
            credits: 0 // 默认 0 积分
          })
          .select('credits')
          .single()

        if (insertError) {
          // 创建失败，详细分类错误
          const errorDetail = classifyError(insertError, 'database')
          errorDetail.code = 'PROFILE_CREATE_FAILED'
          errorDetail.message = '创建用户档案失败'
          logErrorDetail('用户档案创建', errorDetail)
          return NextResponse.json(
            { error: errorDetail },
            { status: errorDetail.httpStatus, headers }
          )
        }

        profile = newProfile
        console.log('✅ 用户档案创建成功')
        console.log('   积分:', profile?.credits)
      } else {
        // 其他数据库错误，详细分类
        const errorDetail = classifyError(profileError, 'database')
        errorDetail.code = 'CREDITS_QUERY_FAILED'
        errorDetail.message = '积分查询失败'
        logErrorDetail('用户档案查询', errorDetail)
        return NextResponse.json(
          { error: errorDetail },
          { status: errorDetail.httpStatus, headers }
        )
      }
    } else {
      console.log('✅ 用户档案查询成功')
      console.log('   积分:', profile?.credits)
    }

    // ===== 阶段 4: 返回结果 =====
    const responseData = {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.full_name || user.email?.split('@')[0],
      avatar_url: user.user_metadata?.avatar_url || null,
      credits: profile?.credits !== undefined ? profile.credits : 0, // 数据库为准，默认 0
    }

    console.log('\n✅ ============ API 请求成功 ============')
    console.log('📦 返回数据:')
    console.log('   用户 ID:', responseData.id)
    console.log('   邮箱:', responseData.email)
    console.log('   积分:', responseData.credits)
    console.log('   用户名:', responseData.name)
    console.log('==========================================\n')

    return NextResponse.json(responseData, { status: 200, headers })

  } catch (error) {
    // 捕获所有未预期的错误
    const errorDetail = classifyError(error, 'business')
    logErrorDetail('API 未知错误', errorDetail)
    return NextResponse.json(
      { error: errorDetail },
      { status: 500, headers }
    )
  }
}
