/**
 * 积分系统类型定义
 */

/**
 * 访客 Cookie 积分数据结构
 */
export interface VisitorCredits {
  /** 访客唯一 ID */
  visitorId: string
  /** 剩余积分（1 或 0） */
  credits: number
  /** 创建时间 */
  createdAt: string
  /** 过期时间 */
  expiresAt: string
}

/**
 * 积分来源类型
 */
export type CreditSource = 'cookie' | 'database'

/**
 * 积分状态
 */
export interface CreditsState {
  /** 剩余积分数 */
  credits: number
  /** 积分来源 */
  source: CreditSource
  /** 是否正在加载 */
  loading: boolean
  /** 错误信息 */
  error: string | null
}

/**
 * 消费积分结果
 */
export interface ConsumeResult {
  success: boolean
  remainingCredits: number
  error?: string
}
