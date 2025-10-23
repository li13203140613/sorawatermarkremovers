import { LogsFilter as LogsFilterType } from '@/lib/admin/types'
import { useState } from 'react'

interface Props {
  filter: LogsFilterType
  onChange: (filter: Partial<LogsFilterType>) => void
}

export default function LogsFilter({ filter, onChange }: Props) {
  const [userEmail, setUserEmail] = useState(filter.userEmail || '')

  const handleSearch = () => {
    onChange({ userEmail: userEmail || undefined })
  }

  const handleStatusChange = (status: 'all' | 'success' | 'failed') => {
    onChange({ status })
  }

  const handleQuickDate = (days: number) => {
    const dateTo = new Date().toISOString()
    const dateFrom = new Date(
      Date.now() - days * 24 * 60 * 60 * 1000
    ).toISOString()
    onChange({ dateFrom, dateTo })
  }

  const handleClearFilter = () => {
    setUserEmail('')
    onChange({
      userEmail: undefined,
      status: 'all',
      dateFrom: undefined,
      dateTo: undefined,
    })
  }

  return (
    <div className="mb-6 space-y-4">
      {/* 搜索用户 */}
      <div className="flex gap-2">
        <input
          type="text"
          value={userEmail}
          onChange={(e) => setUserEmail(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="搜索用户邮箱..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSearch}
          className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
        >
          搜索
        </button>
        <button
          onClick={handleClearFilter}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          清空
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        {/* 状态筛选 */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">状态:</span>
          <button
            onClick={() => handleStatusChange('all')}
            className={`px-3 py-1 text-sm rounded ${
              filter.status === 'all'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            全部
          </button>
          <button
            onClick={() => handleStatusChange('success')}
            className={`px-3 py-1 text-sm rounded ${
              filter.status === 'success'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            成功
          </button>
          <button
            onClick={() => handleStatusChange('failed')}
            className={`px-3 py-1 text-sm rounded ${
              filter.status === 'failed'
                ? 'bg-red-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            失败
          </button>
        </div>

        {/* 时间快捷选择 */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">时间:</span>
          <button
            onClick={() => handleQuickDate(1)}
            className="px-3 py-1 text-sm rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
          >
            今日
          </button>
          <button
            onClick={() => handleQuickDate(7)}
            className="px-3 py-1 text-sm rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
          >
            7天
          </button>
          <button
            onClick={() => handleQuickDate(30)}
            className="px-3 py-1 text-sm rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
          >
            30天
          </button>
        </div>
      </div>
    </div>
  )
}
