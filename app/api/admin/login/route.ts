import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    const adminUsername = process.env.ADMIN_USERNAME
    const adminPassword = process.env.ADMIN_PASSWORD

    if (!adminUsername || !adminPassword) {
      return NextResponse.json(
        { error: '管理员凭证未配置' },
        { status: 500 }
      )
    }

    // 验证用户名和密码
    if (username === adminUsername && password === adminPassword) {
      // 设置 Cookie 标记已登录
      const cookieStore = await cookies()
      cookieStore.set('admin-session', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 天
      })

      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json(
        { error: '用户名或密码错误' },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error('登录错误:', error)
    return NextResponse.json({ error: '登录失败' }, { status: 500 })
  }
}
