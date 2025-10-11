export interface RemoveWatermarkRequest {
  share_link: string
}

export interface RemoveWatermarkResponse {
  data: string // 去水印后的视频 URL
}

export interface VideoProcessResult {
  success: boolean
  videoUrl?: string
  error?: string
  shouldConsumeCredit?: boolean
  source?: 'cookie' | 'database'
}

export interface VideoRecord {
  id: string
  user_id: string
  original_link: string
  processed_url: string | null
  status: 'pending' | 'processing' | 'completed' | 'failed'
  error_message: string | null
  created_at: string
  completed_at: string | null
}
