/**
 * 后台管理系统类型定义
 */

/**
 * 操作类型
 */
export type ActionType = 'watermark_removal' | 'video_generation' | 'prompt_generation'

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
  action_type: ActionType
  created_at: string
}

/**
 * 用户会话记录
 */
export interface UserSession {
  id: string
  user_id: string | null
  user_email: string | null
  session_started_at: string
  session_ended_at: string | null
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
 * 高级分析统计数据
 */
export interface AnalyticsStats {
  // 用户统计
  totalVisitors: number              // 总登录访客数
  todayVisitors: number              // 今日登录访客数
  newRegistrations: number           // 新注册人数（总）
  todayRegistrations: number         // 今日新注册人数

  // 操作统计
  promptGenerations: number          // 提示词生成次数（总）
  todayPromptGenerations: number     // 今日提示词生成次数
  watermarkRemovals: number          // 去水印次数（总）
  todayWatermarkRemovals: number     // 今日去水印次数
  videoGenerations: number           // 视频生成次数（总）
  todayVideoGenerations: number      // 今日视频生成次数

  // 趋势数据（最近7天）
  dailyStats: DailyStats[]
}

/**
 * 每日统计数据
 */
export interface DailyStats {
  date: string
  visitors: number
  registrations: number
  promptGenerations: number
  watermarkRemovals: number
  videoGenerations: number
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
  actionType?: ActionType
}

/**
 * 创建会话记录的参数
 */
export interface CreateSessionParams {
  userId?: string | null
  userEmail?: string | null
  ipAddress?: string | null
  userAgent?: string | null
}