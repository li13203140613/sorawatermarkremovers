'use client'

import { useState } from 'react'
import { VideoResult } from './VideoResult'

interface ProcessResponse {
  success: boolean
  videoUrl?: string
  error?: string
}

export function VideoProcessor() {
  const [shareLink, setShareLink] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [videoUrl, setVideoUrl] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setVideoUrl(null)
    setLoading(true)

    try {
      const response = await fetch('/api/video/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ shareLink }),
      })

      const data: ProcessResponse = await response.json()

      if (!response.ok) {
        setError(data.error || '处理失败')
        return
      }

      if (data.success && data.videoUrl) {
        setVideoUrl(data.videoUrl)
        setShareLink('') // 清空输入框
      } else {
        setError('处理失败，请重试')
      }
    } catch (err) {
      setError('网络错误，请检查连接')
      console.error('处理错误:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">视频水印去除</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="shareLink" className="block text-sm font-medium text-gray-700 mb-2">
              Sora2 分享链接
            </label>
            <input
              id="shareLink"
              type="url"
              value={shareLink}
              onChange={(e) => setShareLink(e.target.value)}
              placeholder="https://sora.chatgpt.com/p/s_..."
              required
              disabled={loading}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <p className="mt-1 text-xs text-gray-500">
              粘贴您的 Sora2 视频分享链接，消耗 1 积分
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !shareLink}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                处理中...
              </span>
            ) : (
              '开始去除水印'
            )}
          </button>
        </form>

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">
            💡 <strong>提示：</strong>处理一个视频需要消耗 1 个积分，请确保您有足够的积分。
          </p>
        </div>
      </div>

      {videoUrl && <VideoResult videoUrl={videoUrl} />}
    </div>
  )
}
