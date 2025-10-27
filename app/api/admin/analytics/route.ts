import { NextRequest, NextResponse } from 'next/server'
import { getAnalyticsStats } from '@/lib/admin/queries'
import { isAdmin } from '@/lib/admin/auth'

/**
 * 获取高级分析统计数据
 * GET /api/admin/analytics
 */
export async function GET(request: NextRequest) {
  try {
    // 验证管理员权限
    const adminCheck = await isAdmin()
    if (!adminCheck) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // 获取统计数据
    const stats = await getAnalyticsStats()

    return NextResponse.json(stats)
  } catch (error) {
    console.error('获取分析统计数据失败:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
