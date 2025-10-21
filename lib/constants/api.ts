/**
 * API 端点常量
 */

/**
 * 第三方 API 基础 URL
 */
export const EXTERNAL_API_URLS = {
  /** AICoding API 基础 URL */
  AICODING: 'https://api.aicoding.sh/v1',

  /** Sora 官网 */
  SORA_OFFICIAL: 'https://sora.com',
} as const

/**
 * 内部 API 端点
 */
export const INTERNAL_API_ROUTES = {
  /** 视频处理 */
  VIDEO_PROCESS: '/api/video/process',

  /** 视频生成 - 创建 */
  VIDEO_GENERATION_CREATE: '/api/video-generation/create',

  /** 视频生成 - 状态查询 */
  VIDEO_GENERATION_STATUS: (taskId: string) => `/api/video-generation/status/${taskId}`,

  /** 支付 - 创建会话 */
  PAYMENT_CREATE: '/api/payment/create-session',

  /** 用户信息 */
  USER_PROFILE: '/api/user/profile',
} as const

/**
 * 允许的 CORS 来源
 */
export const CORS_ALLOWED_ORIGINS = [
  'https://sora.com',
  'chrome-extension://njdkfjnpicmacjbflkcbbohkhmefffcp',
  process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
] as const
