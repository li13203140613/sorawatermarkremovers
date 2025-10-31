import { createAdminClient } from '@/lib/supabase/admin'
import { CreateLogParams } from './types'

/**
 * 记录操作日志到数据库
 */
export async function createUsageLog(params: CreateLogParams): Promise<boolean> {
  try {
    const supabase = createAdminClient()

    const { error } = await supabase.from('usage_logs').insert({
      user_id: params.userId || null,
      user_email: params.userEmail || null,
      original_url: params.originalUrl,
      processed_url: params.processedUrl || null,
      credits_used: params.creditsUsed || 0,
      credits_remaining: params.creditsRemaining || null,
      status: params.status,
      error_message: params.errorMessage || null,
      platform: params.platform || null,
      ip_address: params.ipAddress || null,
      user_agent: params.userAgent || null,
      action_type: params.actionType || 'watermark_removal',
    })

    if (error) {
      console.error('记录日志失败:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('记录日志异常:', error)
    return false
  }
}

/**
 * 从 URL 中提取平台信息
 */
export function extractPlatform(url: string): string | null {
  try {
    if (url.includes('xiaohongshu.com') || url.includes('xhslink.com')) {
      return 'xiaohongshu'
    }
    if (url.includes('douyin.com')) {
      return 'douyin'
    }
    return 'unknown'
  } catch {
    return null
  }
}

/**
 * 从请求中获取 IP 地址
 */
export function getClientIp(request: Request): string | null {
  // 尝试从不同的 header 中获取 IP
  const headers = request.headers

  return (
    headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    headers.get('x-real-ip') ||
    headers.get('cf-connecting-ip') || // Cloudflare
    null
  )
}

/**
 * 从请求中获取 User Agent
 */
export function getUserAgent(request: Request): string | null {
  return request.headers.get('user-agent')
}