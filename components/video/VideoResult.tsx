'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

interface VideoResultProps {
  videoUrl: string
}

export function VideoResult({ videoUrl }: VideoResultProps) {
  const t = useTranslations('video')
  const [downloading, setDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState('')

  const handleDownload = async () => {
    try {
      setDownloading(true)
      setDownloadError('')

      // 使用代理下载 API
      const downloadUrl = `/api/video/download?url=${encodeURIComponent(videoUrl)}`

      const response = await fetch(downloadUrl)

      if (!response.ok) {
        throw new Error('下载失败')
      }

      // 获取 blob 数据
      const blob = await response.blob()

      // 创建下载链接
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `sora-video-${Date.now()}.mp4`
      document.body.appendChild(a)
      a.click()

      // 清理
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Download error:', error)
      setDownloadError('下载失败，请重试')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="bg-white p-8 md:p-12 rounded-2xl shadow-2xl max-w-2xl mx-auto">
      <h3 className="text-2xl font-semibold text-center mb-6 text-gray-800">
        {t('result')}
      </h3>

      {/* 视频播放器 */}
      <div className="mb-8 bg-black rounded-xl overflow-hidden shadow-lg">
        <video
          src={videoUrl}
          controls
          className="w-full max-h-[500px] object-contain"
          preload="metadata"
        >
          {t('errors.processingFailed')}
        </video>
      </div>

      {/* 错误提示 */}
      {downloadError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 text-center">
          {downloadError}
        </div>
      )}

      {/* 下载按钮 */}
      <div className="flex justify-center">
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex items-center justify-center gap-3 py-4 px-8 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-lg font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {downloading ? (
            <>
              <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              下载中...
            </>
          ) : (
            <>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {t('download')}
            </>
          )}
        </button>
      </div>
    </div>
  )
}
