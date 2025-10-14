import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

/**
 * 验证是否为管理员
 * 检查 admin-session Cookie
 */
export async function isAdmin(request: NextRequest): Promise<boolean> {
  try {
    const cookieStore = await cookies()
    const adminSession = cookieStore.get('admin-session')

    return adminSession?.value === 'true'
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
