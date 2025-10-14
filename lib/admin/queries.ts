import { createAdminClient } from '@/lib/supabase/admin'
import {
  UsageLog,
  UserStats,
  AdminStats,
  LogsResponse,
  UsersResponse,
  LogsFilter,
} from './types'

/**
 * 获取操作日志列表（带分页和筛选）
 */
export async function getLogs(filter: LogsFilter = {}): Promise<LogsResponse> {
  try {
    const supabase = createAdminClient()
    const {
      page = 1,
      limit = 50,
      userId,
      userEmail,
      status,
      dateFrom,
      dateTo,
    } = filter

    let query = supabase
      .from('usage_logs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    // 应用筛选条件
    if (userId) {
      query = query.eq('user_id', userId)
    }

    if (userEmail) {
      query = query.ilike('user_email', `%${userEmail}%`)
    }

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    if (dateFrom) {
      query = query.gte('created_at', dateFrom)
    }

    if (dateTo) {
      query = query.lte('created_at', dateTo)
    }

    // 分页
    const start = (page - 1) * limit
    query = query.range(start, start + limit - 1)

    const { data, error, count } = await query

    if (error) {
      console.error('获取日志失败:', error)
      return { logs: [], total: 0 }
    }

    return {
      logs: (data || []) as UsageLog[],
      total: count || 0,
    }
  } catch (error) {
    console.error('获取日志异常:', error)
    return { logs: [], total: 0 }
  }
}

/**
 * 获取用户列表及使用统计
 */
export async function getUsers(
  page = 1,
  limit = 20
): Promise<UsersResponse> {
  try {
    const supabase = createAdminClient()

    // 获取所有用户基本信息
    const { data: profiles, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, email, credits')
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1)

    if (profileError) {
      console.error('获取用户列表失败:', profileError)
      return { users: [], total: 0 }
    }

    // 获取总用户数
    const { count } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })

    // 为每个用户获取使用统计
    const usersWithStats = await Promise.all(
      (profiles || []).map(async (profile) => {
        // 获取使用次数
        const { count: usageCount } = await supabase
          .from('usage_logs')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', profile.id)

        // 获取最后使用时间
        const { data: lastLog } = await supabase
          .from('usage_logs')
          .select('created_at')
          .eq('user_id', profile.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        return {
          id: profile.id,
          email: profile.email || 'Unknown',
          credits: profile.credits || 0,
          total_usage: usageCount || 0,
          last_used: lastLog?.created_at || null,
        } as UserStats
      })
    )

    return {
      users: usersWithStats,
      total: count || 0,
    }
  } catch (error) {
    console.error('获取用户列表异常:', error)
    return { users: [], total: 0 }
  }
}

/**
 * 获取统计数据
 */
export async function getStats(): Promise<AdminStats> {
  try {
    const supabase = createAdminClient()
    const now = new Date()
    const todayStart = new Date(now.setHours(0, 0, 0, 0)).toISOString()
    const sevenDaysAgo = new Date(
      now.getTime() - 7 * 24 * 60 * 60 * 1000
    ).toISOString()

    // 1. 总用户数
    const { count: totalUsers } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })

    // 2. 今日处理次数
    const { count: todayProcessed } = await supabase
      .from('usage_logs')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', todayStart)

    // 3. 成功率
    const { count: totalLogs } = await supabase
      .from('usage_logs')
      .select('*', { count: 'exact', head: true })

    const { count: successLogs } = await supabase
      .from('usage_logs')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'success')

    const successRate =
      totalLogs && totalLogs > 0 ? (successLogs || 0) / totalLogs : 0

    // 4. 7天活跃用户数
    const { data: activeUserIds } = await supabase
      .from('usage_logs')
      .select('user_id')
      .gte('created_at', sevenDaysAgo)
      .not('user_id', 'is', null)

    const uniqueActiveUsers = new Set(
      activeUserIds?.map((log) => log.user_id)
    ).size

    // 5. 今日新增用户
    const { count: todayNewUsers } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', todayStart)

    // 6. 总消耗积分
    const { data: creditsData } = await supabase
      .from('usage_logs')
      .select('credits_used')

    const totalCreditsConsumed = creditsData?.reduce(
      (sum, log) => sum + (log.credits_used || 0),
      0
    ) || 0

    return {
      totalUsers: totalUsers || 0,
      todayProcessed: todayProcessed || 0,
      successRate: Math.round(successRate * 100),
      activeUsers7d: uniqueActiveUsers,
      todayNewUsers: todayNewUsers || 0,
      totalCreditsConsumed,
    }
  } catch (error) {
    console.error('获取统计数据异常:', error)
    return {
      totalUsers: 0,
      todayProcessed: 0,
      successRate: 0,
      activeUsers7d: 0,
      todayNewUsers: 0,
      totalCreditsConsumed: 0,
    }
  }
}
