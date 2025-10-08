import { RemoveWatermarkRequest, RemoveWatermarkResponse } from './types'

/**
 * 调用 Sora2 去水印 API
 * @param shareLink Sora2 分享链接
 * @returns 去水印后的视频 URL
 */
export async function removeWatermark(shareLink: string): Promise<string> {
  const response = await fetch(process.env.SORA_API_URL!, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': process.env.SORA_API_KEY!,
    },
    body: JSON.stringify({
      share_link: shareLink,
    } as RemoveWatermarkRequest),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`API 请求失败: ${response.status} - ${errorText}`)
  }

  const result: RemoveWatermarkResponse = await response.json()

  if (!result.data) {
    throw new Error('API 返回数据格式错误')
  }

  return result.data
}

/**
 * 验证 Sora2 分享链接格式
 */
export function validateSoraLink(link: string): boolean {
  try {
    const url = new URL(link)
    return url.hostname === 'sora.chatgpt.com' && url.pathname.startsWith('/p/')
  } catch {
    return false
  }
}
