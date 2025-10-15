'use client'

/**
 * 插件登录回调页面
 * 登录成功后,将 Token 发送给插件
 */

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

// Chrome API 类型声明
declare global {
  interface Window {
    chrome?: typeof chrome
  }
}

interface ChromeRuntime {
  sendMessage: (
    extensionId: string,
    message: any,
    callback?: (response: any) => void
  ) => void
  lastError?: { message: string }
}

interface Chrome {
  runtime?: ChromeRuntime
}

declare const chrome: Chrome | undefined

export default function ExtensionCallbackPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function handleCallback() {
      try {
        const supabase = createClient()

        // 获取当前 session
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error || !session) {
          throw new Error('未登录或登录已过期')
        }

        // 获取 URL 参数
        const urlParams = new URLSearchParams(window.location.search)
        const extensionId = urlParams.get('extensionId')

        if (!extensionId) {
          throw new Error('缺少插件 ID')
        }

        // 发送 Token 给插件
        if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
          chrome.runtime.sendMessage(
            extensionId,
            {
              action: 'saveToken',
              token: session.access_token,
            },
            (response) => {
              if (chrome?.runtime?.lastError) {
                console.error('发送消息失败:', chrome.runtime.lastError)
                setStatus('error')
                setMessage('无法连接到插件，请确保插件已安装')
              } else {
                console.log('✅ Token 已发送到插件:', response)
                setStatus('success')
                setMessage('登录成功！窗口将自动关闭...')

                // 1 秒后关闭窗口
                setTimeout(() => {
                  window.close()
                }, 1000)
              }
            }
          )
        } else {
          throw new Error('无法访问 Chrome API')
        }

      } catch (err) {
        console.error('处理回调失败:', err)
        setStatus('error')
        setMessage(err instanceof Error ? err.message : '处理登录失败')
      }
    }

    handleCallback()
  }, [])

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {status === 'loading' && (
          <>
            <div style={styles.spinner} />
            <h2 style={styles.title}>正在处理登录...</h2>
            <p style={styles.description}>请稍候</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={styles.icon}>✓</div>
            <h2 style={styles.title}>登录成功</h2>
            <p style={styles.description}>{message}</p>
            <p style={styles.hint}>此页面将自动关闭...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={styles.errorIcon}>✕</div>
            <h2 style={styles.title}>出错了</h2>
            <p style={styles.description}>{message}</p>
            <button style={styles.button} onClick={() => window.close()}>
              关闭页面
            </button>
          </>
        )}
      </div>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    padding: '20px',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '48px',
    maxWidth: '400px',
    width: '100%',
    textAlign: 'center' as const,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  },
  spinner: {
    width: '48px',
    height: '48px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #4CAF50',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 24px',
  },
  icon: {
    width: '64px',
    height: '64px',
    backgroundColor: '#4CAF50',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px',
    color: 'white',
    margin: '0 auto 24px',
  },
  errorIcon: {
    width: '64px',
    height: '64px',
    backgroundColor: '#f44336',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px',
    color: 'white',
    margin: '0 auto 24px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '600',
    marginBottom: '12px',
    color: '#333',
  },
  description: {
    fontSize: '16px',
    color: '#666',
    marginBottom: '8px',
  },
  hint: {
    fontSize: '14px',
    color: '#999',
  },
  button: {
    marginTop: '24px',
    padding: '12px 24px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
  },
}
