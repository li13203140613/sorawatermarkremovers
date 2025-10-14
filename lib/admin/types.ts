/**
 * 后台管理系统类型定义
 */

/**
 * 操作日志
 */
export interface UsageLog {
  id: string
  user_id: string | null
  user_email: string | null
  original_url: string
  processed_url: string | null
  credits_used: number
  credits_remaining: number | null
  status: 'success' | 'failed'
  error_message: string | null
  platform: string | null
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

/**
 * 用户统计信息
 */
export interface UserStats {
  id: string
  email: string
  credits: number
  total_usage: number
  last_used: string | null
}

/**
 * 后台统计数据
 */
export interface AdminStats {
  totalUsers: number
  todayProcessed: number
  successRate: number
  activeUsers7d: number
  todayNewUsers: number
  totalCreditsConsumed: number
}

/**
 * 日志列表响应
 */
export interface LogsResponse {
  logs: UsageLog[]
  total: number
}

/**
 * 用户列表响应
 */
export interface UsersResponse {
  users: UserStats[]
  total: number
}

/**
 * 日志筛选参数
 */
export interface LogsFilter {
  page?: number
  limit?: number
  userId?: string
  userEmail?: string
  status?: 'success' | 'failed' | 'all'
  dateFrom?: string
  dateTo?: string
}

/**
 * 创建日志的参数
 */
export interface CreateLogParams {
  userId?: string | null
  userEmail?: string | null
  originalUrl: string
  processedUrl?: string | null
  creditsUsed?: number
  creditsRemaining?: number | null
  status: 'success' | 'failed'
  errorMessage?: string | null
  platform?: string | null
  ipAddress?: string | null
  userAgent?: string | null
}