/**
 * 轮询相关常量
 */

/**
 * 视频生成任务轮询配置
 */
export const VIDEO_GENERATION_POLLING = {
  /** 轮询间隔 (毫秒) */
  INTERVAL: 6000,

  /** 最大连续失败次数 */
  MAX_CONSECUTIVE_FAILURES: 5,

  /** 最大总轮询时间 (毫秒) - 10分钟 */
  MAX_TOTAL_TIME: 600000,

  /** 进度动画时长 (毫秒) */
  PROGRESS_ANIMATION_DURATION: 80000,
} as const

/**
 * API 超时配置
 */
export const API_TIMEOUTS = {
  /** 默认超时 (毫秒) */
  DEFAULT: 30000,

  /** 长时间操作超时 (毫秒) - 1分钟 */
  LONG: 60000,

  /** 文件上传超时 (毫秒) - 2分钟 */
  UPLOAD: 120000,
} as const

/**
 * 重试配置
 */
export const RETRY_CONFIG = {
  /** 最大重试次数 */
  MAX_RETRIES: 2,

  /** 重试延迟 (毫秒) */
  RETRY_DELAY: 1000,

  /** 重试延迟倍数 (指数退避) */
  BACKOFF_MULTIPLIER: 2,
} as const
