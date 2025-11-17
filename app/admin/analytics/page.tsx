'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AnalyticsStats } from '@/lib/admin/types'
import AnalyticsStatsCards from '@/components/admin/AnalyticsStatsCards'
import AnalyticsChart from '@/components/admin/AnalyticsChart'

export default function AnalyticsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<AnalyticsStats | null>(null)
  const [error, setError] = useState<string | null>(null)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/admin/analytics')

      if (res.status === 403) {
        router.push('/admin/login')
        return
      }

      if (!res.ok) {
        throw new Error('获取统计数据失败')
      }

      const data = await res.json()
      setStats(data)
    } catch (error) {
      console.error('获取统计数据失败:', error)
      setError(error instanceof Error ? error.message : '未知错误')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' })
      router.push('/admin/login')
    } catch (error) {
      console.error('登出失败:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">加载中...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg text-red-600 mb-4">加载失败: {error}</p>
          <button
            onClick={fetchStats}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            重试
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="text-gray-600 hover:text-gray-900 transition"
            >
              ← 返回
            </Link>
            <h1 className="text-3xl font-bold">数据分析统计</h1>
          </div>
          <div className="flex gap-3">
            <button
              onClick={fetchStats}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              刷新数据
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
            >
              登出
            </button>
          </div>
        </div>

        {/* 统计卡片 */}
        {stats && (
          <div className="space-y-8">
            <AnalyticsStatsCards stats={stats} />
            <AnalyticsChart dailyStats={stats.dailyStats} />
          </div>
        )}

        {/* 说明文档 */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">📊 统计说明</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <div>
              <strong className="text-gray-900">登录访客：</strong>
              统计所有通过 Google OAuth 登录的用户数量（基于 user_sessions 表）
            </div>
            <div>
              <strong className="text-gray-900">新注册用户：</strong>
              统计新注册的用户总数（基于 user_profiles 表）
            </div>
            <div>
              <strong className="text-gray-900">提示词生成：</strong>
              统计所有成功的提示词生成次数（基于 usage_logs 表，action_type = &apos;prompt_generation&apos;）
            </div>
            <div>
              <strong className="text-gray-900">去水印：</strong>
              统计所有成功的去水印操作次数（基于 usage_logs 表，action_type = &apos;watermark_removal&apos;）
            </div>
            <div>
              <strong className="text-gray-900">视频生成：</strong>
              统计所有成功的视频生成次数（基于 usage_logs 表，action_type = &apos;video_generation&apos;）
            </div>
          </div>
        </div>

        {/* 数据库迁移提示 */}
        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="text-yellow-800 font-semibold mb-2">⚠️ 数据库迁移提示</h4>
          <p className="text-sm text-yellow-700">
            本页面依赖新的数据库表结构。请确保已执行以下迁移脚本：
          </p>
          <code className="block mt-2 bg-yellow-100 p-2 rounded text-xs">
            supabase/migrations/20250127000000_add_action_type.sql
          </code>
        </div>
      </div>
    </div>
  )
}
