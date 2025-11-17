'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AdminStats, LogsResponse, UsersResponse, LogsFilter } from '@/lib/admin/types'
import StatsCards from '@/components/admin/StatsCards'
import UsersTable from '@/components/admin/UsersTable'
import LogsTable from '@/components/admin/LogsTable'
import LogsFilterComponent from '@/components/admin/LogsFilter'

export default function AdminPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [logs, setLogs] = useState<LogsResponse>({ logs: [], total: 0 })
  const [users, setUsers] = useState<UsersResponse>({ users: [], total: 0 })
  const [filter, setFilter] = useState<LogsFilter>({
    page: 1,
    limit: 50,
    status: 'all',
  })
  const [activeTab, setActiveTab] = useState<'logs' | 'users'>('logs')

  // 加载统计数据
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchStats()
  }, [])

  // 加载日志
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (activeTab === 'logs') {
      fetchLogs()
    }
  }, [filter, activeTab])

  // 加载用户列表
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers()
    }
  }, [activeTab])

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats')
      if (res.status === 403) {
        router.push('/admin/login')
        return
      }
      const data = await res.json()
      setStats(data)
    } catch (error) {
      console.error('获取统计数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchLogs = async () => {
    try {
      const params = new URLSearchParams()
      if (filter.page) params.append('page', filter.page.toString())
      if (filter.limit) params.append('limit', filter.limit.toString())
      if (filter.userId) params.append('userId', filter.userId)
      if (filter.userEmail) params.append('userEmail', filter.userEmail)
      if (filter.status) params.append('status', filter.status)
      if (filter.dateFrom) params.append('dateFrom', filter.dateFrom)
      if (filter.dateTo) params.append('dateTo', filter.dateTo)

      const res = await fetch(`/api/admin/logs?${params}`)
      if (res.status === 403) {
        router.push('/admin/login')
        return
      }
      const data = await res.json()
      setLogs(data)
    } catch (error) {
      console.error('获取日志失败:', error)
    }
  }

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users?page=1&limit=20')
      if (res.status === 403) {
        router.push('/admin/login')
        return
      }
      const data = await res.json()
      setUsers(data)
    } catch (error) {
      console.error('获取用户列表失败:', error)
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

  const handleFilterChange = (newFilter: Partial<LogsFilter>) => {
    setFilter({ ...filter, ...newFilter, page: 1 })
  }

  const handlePageChange = (page: number) => {
    setFilter({ ...filter, page })
  }

  const handleRefresh = () => {
    fetchStats()
    if (activeTab === 'logs') {
      fetchLogs()
    } else {
      fetchUsers()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">加载中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">管理后台</h1>
          <div className="flex gap-3">
            <Link
              href="/admin/analytics"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition inline-block"
            >
              📊 数据分析
            </Link>
            <button
              onClick={handleRefresh}
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
        {stats && <StatsCards stats={stats} />}

        {/* Tab 切换 */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('logs')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'logs'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                操作日志 ({logs.total})
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'users'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                用户列表 ({users.total})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'logs' ? (
              <>
                <LogsFilterComponent filter={filter} onChange={handleFilterChange} />
                <LogsTable
                  logs={logs.logs}
                  total={logs.total}
                  currentPage={filter.page || 1}
                  pageSize={filter.limit || 50}
                  onPageChange={handlePageChange}
                />
              </>
            ) : (
              <UsersTable users={users.users} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
