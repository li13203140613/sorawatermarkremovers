import { createClient } from '@/lib/supabase/server'
import { removeWatermark, validateSoraLink } from './api'
import { VideoProcessResult } from './types'

/**
 * 处理视频去水印（服务器端）
 * @param shareLink Sora2 分享链接
 * @param userId 用户 ID
 */
export async function processVideo(
  shareLink: string,
  userId: string
): Promise<VideoProcessResult> {
  // 1. 验证链接格式
  if (!validateSoraLink(shareLink)) {
    return {
      success: false,
      error: '无效的 Sora2 分享链接格式',
    }
  }

  const supabase = await createClient()

  try {
    // 2. 检查用户积分
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

    // 3. 创建处理记录
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

    // 4. 调用去水印 API
    let videoUrl: string
    try {
      videoUrl = await removeWatermark(shareLink)
    } catch (apiError) {
      // 更新记录为失败状态
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

    // 5. 扣除积分
    const { error: creditError } = await supabase.rpc('consume_credit', {
      user_id: userId,
    })

    if (creditError) {
      return {
        success: false,
        error: '扣除积分失败',
      }
    }

    // 6. 更新记录为完成状态
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
    }
  } catch (error) {
    console.error('视频处理错误:', error)
    return {
      success: false,
      error: '处理过程中发生错误',
    }
  }
}
