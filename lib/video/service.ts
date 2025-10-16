import { createClient } from '@/lib/supabase/server'
import { removeWatermark, validateSoraLink } from './api'
import { VideoProcessResult } from './types'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * 处理视频去水印（双轨积分系统）
 * @param shareLink Sora2 分享链接
 * @param userId 用户 ID（已登录用户）
 * @param visitorId 访客 ID（未登录用户）
 * @param supabaseClient Supabase 客户端（可选，用于 Bearer Token 认证）
 */
export async function processVideo(
  shareLink: string,
  userId: string | null,
  visitorId?: string,
  supabaseClient?: SupabaseClient
): Promise<VideoProcessResult> {
  // 1. 验证链接格式
  if (!validateSoraLink(shareLink)) {
    return {
      success: false,
      error: '无效的 Sora2 分享链接格式',
    }
  }

  // 2. 根据用户类型选择积分轨道
  if (userId) {
    // ✅ 已登录 → Database 轨道
    return await processWithDatabaseCredits(shareLink, userId, supabaseClient)
  } else if (visitorId) {
    // ✅ 未登录 → Cookie 轨道
    return await processWithCookieCredits(shareLink, visitorId)
  } else {
    return {
      success: false,
      error: '缺少用户身份信息',
    }
  }
}

/**
 * Database 轨道：已登录用户
 */
async function processWithDatabaseCredits(
  shareLink: string,
  userId: string,
  supabaseClient?: SupabaseClient
): Promise<VideoProcessResult> {
  const supabase = supabaseClient || await createClient()

  try {
    // 1. 检查数据库积分
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('credits')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      return {
        success: false,
        error: '无法获取用户信息',
      }
    }

    if (profile.credits < 1) {
      return {
        success: false,
        error: '积分不足，请先充值',
      }
    }

    // 2. 创建处理记录（status: processing）
    const { data: record, error: recordError } = await supabase
      .from('video_processes')
      .insert({
        user_id: userId,
        original_link: shareLink,
        status: 'processing',
      })
      .select()
      .single()

    if (recordError || !record) {
      return {
        success: false,
        error: '创建处理记录失败',
      }
    }

    // 3. 调用去水印 API
    let videoUrl: string
    try {
      videoUrl = await removeWatermark(shareLink)
    } catch (apiError) {
      // API 失败 → 更新记录状态
      await supabase
        .from('video_processes')
        .update({
          status: 'failed',
          error_message: apiError instanceof Error ? apiError.message : '未知错误',
        })
        .eq('id', record.id)

      return {
        success: false,
        error: apiError instanceof Error ? apiError.message : 'API 调用失败',
      }
    }

    // 4. 扣除数据库积分
    const { error: creditError } = await supabase.rpc('consume_credit', {
      user_id: userId,
    })

    if (creditError) {
      return {
        success: false,
        error: '扣除积分失败',
      }
    }

    // 5. 更新记录为完成状态
    await supabase
      .from('video_processes')
      .update({
        status: 'completed',
        processed_url: videoUrl,
        completed_at: new Date().toISOString(),
      })
      .eq('id', record.id)

    return {
      success: true,
      videoUrl,
      source: 'database',
    }
  } catch (error) {
    console.error('Database 轨道错误:', error)
    return {
      success: false,
      error: '处理过程中发生错误',
    }
  }
}

/**
 * Cookie 轨道：未登录访客
 */
async function processWithCookieCredits(
  shareLink: string,
  visitorId: string
): Promise<VideoProcessResult> {
  try {
    // 1. 验证访客 ID 格式（防止恶意输入）
    if (!isValidVisitorId(visitorId)) {
      return {
        success: false,
        error: '无效的访客 ID',
      }
    }

    // 2. 调用去水印 API
    // 注意：这里不检查积分，因为服务端无法直接读取 Cookie
    // 积分检查由客户端在发送请求前完成
    let videoUrl: string
    try {
      videoUrl = await removeWatermark(shareLink)
    } catch (apiError) {
      return {
        success: false,
        error: apiError instanceof Error ? apiError.message : 'API 调用失败',
      }
    }

    // 3. 返回成功结果
    return {
      success: true,
      videoUrl,
      source: 'cookie',
      shouldConsumeCredit: true, // ← 通知客户端扣除 Cookie 积分
    }
  } catch (error) {
    console.error('Cookie 轨道错误:', error)
    return {
      success: false,
      error: '处理过程中发生错误',
    }
  }
}

/**
 * 验证访客 ID 格式（UUID v4）
 */
function isValidVisitorId(visitorId: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(visitorId)
}
