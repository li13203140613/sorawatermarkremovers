'use client'

import { useState, useEffect } from 'react'
import { VideoResult } from './VideoResult'
import { useTranslations } from 'next-intl'
import { useCredits } from '@/hooks/useCredits'
import { TurnstileWidget } from '@/components/turnstile/TurnstileWidget'
import Link from 'next/link'

interface ProcessResponse {
  success: boolean
  videoUrl?: string
  error?: string
  shouldConsumeCredit?: boolean
}

interface VideoProcessorProps {
  onVideoProcessed?: () => void
}

export function VideoProcessor({ onVideoProcessed }: VideoProcessorProps = {}) {
  const t = useTranslations('video')
  const tDashboard = useTranslations('dashboard')
  const { credits, hasCredits, isLoggedIn, consumeCredit, getVisitorId, refresh } = useCredits()
  const [shareLink, setShareLink] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [showTurnstile, setShowTurnstile] = useState(false)

  // 未登录用户页面加载后立即预加载 Turnstile
  useEffect(() => {
    if (!isLoggedIn) {
      setShowTurnstile(true)
    }
  }, [isLoggedIn])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setVideoUrl(null)

    // 检查积分
    if (!hasCredits) {
      setError('INSUFFICIENT_CREDITS')
      return
    }

    // 未登录用户需要先验证 Turnstile
    if (!isLoggedIn && !turnstileToken) {
      setError('VERIFICATION_REQUIRED')
      return
    }

    setLoading(true)

    try {
      // 构建请求体
      const body: any = { shareLink }

      // 如果未登录，传递 visitorId 和 turnstileToken
      if (!isLoggedIn) {
        body.visitorId = getVisitorId()
        body.turnstileToken = turnstileToken
      }

      const response = await fetch('/api/video/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      const data: ProcessResponse = await response.json()

      if (!response.ok) {
        setError(data.error || t('errors.processingFailed'))
        return
      }

      if (data.success && data.videoUrl) {
        setVideoUrl(data.videoUrl)
        setShareLink('') // 清空输入框
        setTurnstileToken(null) // 重置 token
        setShowTurnstile(false) // 隐藏验证组件

        // 如果是 Cookie 积分，客户端负责扣除
        if (data.shouldConsumeCredit) {
          consumeCredit()
        } else {
          // 如果是数据库积分，刷新显示
          await refresh()
        }

        // 通知父组件视频处理成功
        onVideoProcessed?.()
      } else {
        setError(t('errors.processingFailed'))
      }
    } catch (err) {
      setError(t('errors.processingFailed'))
      console.error('Processing error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleTurnstileSuccess = (token: string) => {
    setTurnstileToken(token)
    setError('')
  }

  const handleTurnstileError = () => {
    setError('VERIFICATION_FAILED')
    setTurnstileToken(null)
  }

  return (
    <div className="space-y-6">
      <div className="bg-white py-12 md:py-16 px-8 md:px-12 rounded-2xl shadow-2xl max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-12">
          <div>
            <input
              id="shareLink"
              type="url"
              value={shareLink}
              onChange={(e) => setShareLink(e.target.value)}
              placeholder={t('pasteLink')}
              required
              disabled={loading}
              className="w-full px-6 py-5 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
            />
          </div>

          {/* 错误提示 */}
          {error && error !== 'VERIFICATION_FAILED' && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
              {error === 'INSUFFICIENT_CREDITS' ? (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-red-700">{t('errors.insufficientCredits')}</span>
                  <Link
                    href={isLoggedIn ? '/pricing' : '/login'}
                    className="ml-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    {isLoggedIn ? t('buyCredits') : t('loginForMore')}
                  </Link>
                </div>
              ) : error === 'VERIFICATION_REQUIRED' ? (
                <span className="text-sm text-red-700">{t('errors.verificationRequired')}</span>
              ) : (
                <span className="text-sm text-red-700">{error}</span>
              )}
            </div>
          )}

          {/* 未登录用户显示 Turnstile 验证 */}
          {!isLoggedIn && showTurnstile && (
            <div className="space-y-4">
              <TurnstileWidget
                onSuccess={handleTurnstileSuccess}
                onError={handleTurnstileError}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !shareLink}
            className="w-full py-5 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-base font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {t('processing')}
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                🎬 {t('process')}
              </span>
            )}
          </button>
        </form>
      </div>

      {videoUrl && <VideoResult videoUrl={videoUrl} />}
    </div>
  )
}
