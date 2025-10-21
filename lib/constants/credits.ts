/**
 * 积分系统常量
 */

/**
 * 默认免费积分
 */
export const DEFAULT_FREE_CREDITS = 3

/**
 * Cookie 积分数据键名
 */
export const COOKIE_CREDITS_KEY = 'visitor_credits'

/**
 * 视频处理积分消耗
 */
export const CREDITS_COST = {
  /** 视频去水印 */
  VIDEO_WATERMARK_REMOVAL: 1,

  /** AI 视频生成 - 标准版（带水印） */
  VIDEO_GENERATION_STANDARD: 1,

  /** AI 视频生成 - 专业版（无水印） */
  VIDEO_GENERATION_PRO: 2,
} as const
