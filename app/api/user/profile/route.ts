import { NextRequest, NextResponse } from 'next/server'
import { createClient, createClientWithCookie } from '@/lib/supabase/server'

/**
 * CORS 配置
 */
const ALLOWED_ORIGINS = [
  'https://www.sora-prompt.io',
  'chrome-extension://*'
]

function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false
  return ALLOWED_ORIGINS.some(allowed => {
    if (allowed.endsWith('*')) {
      const prefix = allowed.slice(0, -1)
      return origin.startsWith(prefix)
    }
    return origin === allowed
  })
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
    // 检测请求来源并创建 Supabase 客户端
    const authHeader = request.headers.get('authorization')
    const cookieHeader = request.headers.get('cookie')
    let supabase
    let user = null

    // 1. 优先检查 Bearer token（扩展 OAuth 登录）
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1]
      console.log('🔑 使用 Bearer token 认证')

      // 创建一个临时的 Supabase 客户端用于验证 token
      const { createClient: createSupabaseClient } = await import('@supabase/supabase-js')
      const tempClient = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      // 使用用户 token 验证身份
      const { data: userData, error } = await tempClient.auth.getUser(token)
      if (!error && userData.user) {
        user = userData.user
        console.log('✅ Bearer token 验证成功，用户:', userData.user.email)

        // 验证成功后，创建 Service Role 客户端用于查询数据库（绕过 RLS）
        supabase = createSupabaseClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        )
      } else {
        console.log('❌ Bearer token 验证失败:', error?.message)
      }
    }

    // 2. 如果 Bearer token 失败或不存在，尝试 Cookie
    if (!user) {
      if (cookieHeader) {
        console.log('🍪 扩展请求，手动解析 Cookie')
        supabase = createClientWithCookie(cookieHeader)
      } else {
        console.log('🌐 网页请求，使用标准 Cookie')
        supabase = await createClient()
      }

      // 获取用户信息
      const { data: { user: cookieUser }, error: authError } = await supabase.auth.getUser()

      if (authError || !cookieUser) {
        return NextResponse.json(
          { error: '未登录' },
          { status: 401, headers }
        )
      }
      user = cookieUser
    }

    // 如果 supabase 客户端未定义，创建一个默认的
    if (!supabase) {
      supabase = await createClient()
    }

    // 获取用户 profile（包含积分）
    let { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('credits, avatar_url, full_name')
      .eq('id', user.id)
      .single()

    // 如果用户 profile 不存在，自动创建一条默认记录
    if (profileError && profileError.code === 'PGRST116') {
      console.log('⚠️ 用户 profile 不存在，自动创建...')
      console.log('   用户 ID:', user.id)
      console.log('   邮箱:', user.email)

      const { data: newProfile, error: insertError } = await supabase
        .from('user_profiles')
        .insert({
          id: user.id,
          email: user.email,
          credits: 0, // 默认 0 积分
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
          avatar_url: user.user_metadata?.avatar_url,
        })
        .select('credits, avatar_url, full_name')
        .single()

      if (insertError) {
        console.error('❌ 创建用户 profile 失败:', insertError)
      } else {
        console.log('✅ 用户 profile 创建成功')
        profile = newProfile
      }
    } else if (profileError) {
      console.error('❌ 获取用户 profile 失败:', profileError)
      console.error('   用户 ID:', user.id)
      console.error('   错误详情:', profileError.message)
    } else {
      console.log('✅ 用户 profile 查询成功')
      console.log('   积分:', profile?.credits)
      console.log('   用户名:', profile?.full_name)
    }

    // 返回用户信息（积分必须以数据库为准，查询失败则返回 null）
    return NextResponse.json(
      {
        id: user.id,
        email: user.email,
        name: profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0],
        avatar_url: profile?.avatar_url || user.user_metadata?.avatar_url,
        credits: profile?.credits !== undefined ? profile.credits : null, // 必须以数据库为准
      },
      { status: 200, headers }
    )

  } catch (error) {
    console.error('❌ 获取用户信息失败:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500, headers }
    )
  }
}
