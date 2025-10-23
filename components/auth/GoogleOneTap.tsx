'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/lib/auth/context'
import { createClient } from '@/lib/supabase/client'
import Script from 'next/script'

// Google One Tap 类型定义
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: GoogleOneTapConfig) => void
          prompt: (callback?: (notification: PromptMomentNotification) => void) => void
          cancel: () => void
        }
      }
    }
  }
}

interface GoogleOneTapConfig {
  client_id: string
  callback: (response: CredentialResponse) => void
  auto_select?: boolean
  cancel_on_tap_outside?: boolean
  nonce?: string
  use_fedcm_for_prompt?: boolean
}

interface CredentialResponse {
  credential: string
  select_by: string
}

interface PromptMomentNotification {
  isDisplayed: () => boolean
  isNotDisplayed: () => boolean
  getNotDisplayedReason: () => string
  isSkippedMoment: () => boolean
  getSkippedReason: () => string
  isDismissedMoment: () => boolean
  getDismissedReason: () => string
}

export function GoogleOneTap() {
  const { user } = useAuth()
  const [isReady, setIsReady] = useState(false)
  const supabase = createClient()

  // 生成随机 nonce (安全令牌)
  const generateNonce = useCallback(() => {
    const randomBytes = new Uint8Array(32)
    crypto.getRandomValues(randomBytes)
    return Array.from(randomBytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  }, [])

  // 生成 SHA-256 哈希
  const hashNonce = useCallback(async (nonce: string) => {
    const encoder = new TextEncoder()
    const data = encoder.encode(nonce)
    const hash = await crypto.subtle.digest('SHA-256', data)
    return Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  }, [])

  // 处理 Google 登录回调
  const handleCredentialResponse = useCallback(async (response: CredentialResponse) => {
    try {
      const nonce = sessionStorage.getItem('google_nonce')
      if (!nonce) {
        console.error('Nonce not found')
        return
      }

      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: response.credential,
        nonce,
      })

      if (error) {
        console.error('Google One Tap login error:', error)
        // 如果 One Tap 失败，可以回退到传统 OAuth
        // await supabase.auth.signInWithOAuth({ provider: 'google' })
      } else {
        console.log('Google One Tap login success:', data)
        // 登录成功，可以重定向或刷新页面
        window.location.href = '/'
      }
    } catch (err) {
      console.error('Unexpected error:', err)
    } finally {
      // 清理 nonce
      sessionStorage.removeItem('google_nonce')
    }
  }, [supabase])

  // 初始化 Google One Tap
  const initializeGoogleOneTap = useCallback(async () => {
    console.log('[GoogleOneTap] Initializing...', {
      hasGoogle: !!window.google,
      isReady,
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    })

    if (!window.google || !isReady) {
      console.log('[GoogleOneTap] Not ready yet')
      return
    }

    try {
      // 生成并存储 nonce
      const nonce = generateNonce()
      const hashedNonce = await hashNonce(nonce)
      sessionStorage.setItem('google_nonce', nonce)
      console.log('[GoogleOneTap] Nonce generated')

      // 初始化 Google One Tap
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
        callback: handleCredentialResponse,
        auto_select: false, // 是否自动选择唯一账号
        cancel_on_tap_outside: false, // 点击外部不关闭
        nonce: hashedNonce,
        use_fedcm_for_prompt: true, // Chrome 隐私沙盒兼容
      })
      console.log('[GoogleOneTap] Initialized successfully')

      // 显示 One Tap 提示
      window.google.accounts.id.prompt((notification) => {
        console.log('[GoogleOneTap] Prompt callback triggered')
        if (notification.isNotDisplayed()) {
          console.warn('[GoogleOneTap] ⚠️ Not displayed:', notification.getNotDisplayedReason())
        } else if (notification.isSkippedMoment()) {
          console.warn('[GoogleOneTap] ⚠️ Skipped:', notification.getSkippedReason())
        } else if (notification.isDismissedMoment()) {
          console.warn('[GoogleOneTap] ⚠️ Dismissed:', notification.getDismissedReason())
        } else if (notification.isDisplayed()) {
          console.log('[GoogleOneTap] ✅ Displayed successfully!')
        }
      })
      console.log('[GoogleOneTap] Prompt called')
    } catch (err) {
      console.error('[GoogleOneTap] ❌ Failed to initialize:', err)
    }
  }, [isReady, generateNonce, hashNonce, handleCredentialResponse])

  // 组件挂载时初始化
  useEffect(() => {
    console.log('[GoogleOneTap] useEffect triggered', { user: !!user, isReady })

    // 如果已登录，不显示 One Tap
    if (user) {
      console.log('[GoogleOneTap] User already logged in, skipping')
      return
    }

    if (isReady) {
      initializeGoogleOneTap()
    }

    // 清理函数
    return () => {
      console.log('[GoogleOneTap] Cleanup')
      if (window.google) {
        window.google.accounts.id.cancel()
      }
      sessionStorage.removeItem('google_nonce')
    }
  }, [user, isReady, initializeGoogleOneTap])

  // Google One Tap 在 localhost 不工作,只在生产环境启用
  const isProduction = typeof window !== 'undefined' &&
    window.location.hostname !== 'localhost' &&
    !window.location.hostname.startsWith('127.0.0.1')

  // 检查环境变量
  if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
    console.error('NEXT_PUBLIC_GOOGLE_CLIENT_ID is not configured')
    return null
  }

  if (!isProduction) {
    // console.log('[GoogleOneTap] Disabled in development environment (localhost)')
    return null
  }

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onReady={() => {
          console.log('Google One Tap script loaded')
          setIsReady(true)
        }}
        onError={() => {
          console.error('Failed to load Google One Tap script')
        }}
      />
    </>
  )
}
