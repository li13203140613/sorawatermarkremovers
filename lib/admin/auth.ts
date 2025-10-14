import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * 验证是否为管理员
 * 使用环境变量 ADMIN_EMAIL 来指定管理员邮箱
 */
export async function isAdmin(request: NextRequest): Promise<boolean> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return false
    }

    // 从环境变量获取管理员邮箱
    const adminEmail = process.env.ADMIN_EMAIL

    if (!adminEmail) {
      console.error('❌ ADMIN_EMAIL 环境变量未设置')
      return false
    }

    // 检查用户邮箱是否匹配管理员邮箱
    return user.email === adminEmail
  } catch (error) {
    console.error('验证管理员失败:', error)
    return false
  }
}

/**
 * 管理员认证中间件
 * 在 API 路由中使用，确保只有管理员能访问
 */
export async function requireAdmin(
  request: NextRequest,
  handler: (request: NextRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  const admin = await isAdmin(request)

  if (!admin) {
    return NextResponse.json(
      { error: '无权访问' },
      { status: 403 }
    )
  }

  return handler(request)
}
