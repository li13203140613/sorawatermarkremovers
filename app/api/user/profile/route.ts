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

      // 创建一个新的 Supabase 客户端实例
      const { createClient } = await import('@supabase/supabase-js')
      const supabaseClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          global: {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        }
      )

      // 使用 token 获取用户信息（不需要传递 token，会自动从 headers 中获取）
      const { data: userData, error } = await supabaseClient.auth.getUser()
      if (!error && userData.user) {
        user = userData.user
        supabase = supabaseClient
        console.log('✅ Bearer token 验证成功，用户:', userData.user.email)
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
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('credits, avatar_url, full_name')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('获取用户 profile 失败:', profileError)
    }

    // 返回用户信息
    return NextResponse.json(
      {
        id: user.id,
        email: user.email,
        name: profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0],
        avatar_url: profile?.avatar_url || user.user_metadata?.avatar_url,
        credits: profile?.credits || 0,
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
