'use client'

/**
 * 积分全局状态管理 Context
 * 解决多个组件间积分状态同步问题
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAuth } from '@/lib/auth'
import { CookieCreditsManager } from '@/lib/credits/cookie'
import { createClient } from '@/lib/supabase/client'
import type { CreditsState } from '@/lib/credits/types'

interface CreditsContextValue extends CreditsState {
  hasCredits: boolean
  isLoggedIn: boolean
  refresh: () => Promise<void>
  consumeCredit: () => { success: boolean; remainingCredits: number }
  getVisitorId: () => string | null
}

const CreditsContext = createContext<CreditsContextValue | null>(null)

export function CreditsProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth()
  const [state, setState] = useState<CreditsState>({
    credits: 0,
    source: 'cookie',
    loading: true,
    error: null,
  })

  useEffect(() => {
    async function loadCredits() {
      try {
        if (authLoading) {
          return
        }

        if (user) {
          // 已登录 → Database 轨道
          await loadDatabaseCredits()
        } else {
          // 未登录 → Cookie 轨道
          loadCookieCredits()
        }
      } catch (error) {
        setState({
          credits: 0,
          source: 'cookie',
          loading: false,
          error: '加载积分失败',
        })
      }
    }

    loadCredits()
  }, [user, authLoading])

  /**
   * 登录后触发每日登录奖励（服务端保证每天一次）
   */
  useEffect(() => {
    if (authLoading || !user) return

    const claimDailyLoginBonus = async () => {
      try {
        const res = await fetch('/api/user/daily-login', { method: 'POST' })
        if (res.ok) {
          const data = await res.json()
          if (data.rewarded) {
            await loadDatabaseCredits()
          }
        }
      } catch (error) {
        console.error('领取每日登录奖励失败:', error)
      }
    }

    claimDailyLoginBonus()
  }, [authLoading, user])

  /**
   * 加载数据库积分（已登录用户）
   */
  async function loadDatabaseCredits() {
    if (!user) return

    const supabase = createClient()

    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('credits')
      .eq('id', user.id)
      .single()

    if (error || !profile) {
      setState({
        credits: 0,
        source: 'database',
        loading: false,
        error: '无法获取积分信息',
      })
      return
    }

    setState({
      credits: profile.credits,
      source: 'database',
      loading: false,
      error: null,
    })
  }

  /**
   * 加载 Cookie 积分（未登录用户）
   */
  function loadCookieCredits() {
    const credits = CookieCreditsManager.getCreditsCount()

    setState({
      credits,
      source: 'cookie',
      loading: false,
      error: null,
    })
  }

  /**
   * 刷新积分
   */
  const refresh = async () => {
    if (user) {
      await loadDatabaseCredits()
    } else {
      loadCookieCredits()
    }
  }

  /**
   * 消费积分（仅客户端 Cookie，数据库积分由服务端扣除）
   */
  const consumeCredit = () => {
    if (state.source === 'cookie') {
      const result = CookieCreditsManager.consumeCredit()
      if (result.success) {
        setState((prev) => ({
          ...prev,
          credits: result.remainingCredits,
        }))
      }
      return result
    }

    // 数据库积分由服务端扣除，客户端只需刷新
    return {
      success: true,
      remainingCredits: state.credits,
    }
  }

  /**
   * 获取访客 ID（仅未登录用户）
   */
  const getVisitorId = () => {
    if (state.source === 'cookie') {
      return CookieCreditsManager.getVisitorId()
    }
    return null
  }

  const value: CreditsContextValue = {
    ...state,
    hasCredits: state.credits > 0,
    isLoggedIn: !!user,
    refresh,
    consumeCredit,
    getVisitorId,
  }

  return <CreditsContext.Provider value={value}>{children}</CreditsContext.Provider>
}

export function useCredits() {
  const context = useContext(CreditsContext)
  if (!context) {
    throw new Error('useCredits must be used within CreditsProvider')
  }
  return context
}
