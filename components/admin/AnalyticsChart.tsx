'use client'

import { DailyStats } from '@/lib/admin/types'

interface AnalyticsChartProps {
  dailyStats: DailyStats[]
}

export default function AnalyticsChart({ dailyStats }: AnalyticsChartProps) {
  // 计算最大值用于缩放
  const maxValue = Math.max(
    ...dailyStats.map((stat) =>
      Math.max(
        stat.visitors,
        stat.registrations,
        stat.promptGenerations,
        stat.watermarkRemovals,
        stat.videoGenerations
      )
    ),
    1 // 防止除以0
  )

  const metrics = [
    { key: 'visitors', label: '访客数', color: 'bg-blue-500' },
    { key: 'registrations', label: '新注册', color: 'bg-green-500' },
    { key: 'promptGenerations', label: '提示词', color: 'bg-purple-500' },
    { key: 'watermarkRemovals', label: '去水印', color: 'bg-orange-500' },
    { key: 'videoGenerations', label: '视频生成', color: 'bg-pink-500' },
  ]

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-6">最近7天趋势</h3>

      {/* 图例 */}
      <div className="flex flex-wrap gap-4 mb-6">
        {metrics.map((metric) => (
          <div key={metric.key} className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded ${metric.color}`}></div>
            <span className="text-sm text-gray-600">{metric.label}</span>
          </div>
        ))}
      </div>

      {/* 柱状图 */}
      <div className="space-y-6">
        {dailyStats.map((stat) => (
          <div key={stat.date} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                {new Date(stat.date).toLocaleDateString('zh-CN', {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>访客: {stat.visitors}</span>
                <span>注册: {stat.registrations}</span>
                <span>提示词: {stat.promptGenerations}</span>
                <span>去水印: {stat.watermarkRemovals}</span>
                <span>视频: {stat.videoGenerations}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 h-8">
              {/* 访客 */}
              {stat.visitors > 0 && (
                <div
                  className="bg-blue-500 h-full rounded transition-all hover:opacity-80"
                  style={{ width: `${(stat.visitors / maxValue) * 100}%` }}
                  title={`访客: ${stat.visitors}`}
                ></div>
              )}
              {/* 新注册 */}
              {stat.registrations > 0 && (
                <div
                  className="bg-green-500 h-full rounded transition-all hover:opacity-80"
                  style={{
                    width: `${(stat.registrations / maxValue) * 100}%`,
                  }}
                  title={`新注册: ${stat.registrations}`}
                ></div>
              )}
              {/* 提示词 */}
              {stat.promptGenerations > 0 && (
                <div
                  className="bg-purple-500 h-full rounded transition-all hover:opacity-80"
                  style={{
                    width: `${(stat.promptGenerations / maxValue) * 100}%`,
                  }}
                  title={`提示词: ${stat.promptGenerations}`}
                ></div>
              )}
              {/* 去水印 */}
              {stat.watermarkRemovals > 0 && (
                <div
                  className="bg-orange-500 h-full rounded transition-all hover:opacity-80"
                  style={{
                    width: `${(stat.watermarkRemovals / maxValue) * 100}%`,
                  }}
                  title={`去水印: ${stat.watermarkRemovals}`}
                ></div>
              )}
              {/* 视频生成 */}
              {stat.videoGenerations > 0 && (
                <div
                  className="bg-pink-500 h-full rounded transition-all hover:opacity-80"
                  style={{
                    width: `${(stat.videoGenerations / maxValue) * 100}%`,
                  }}
                  title={`视频生成: ${stat.videoGenerations}`}
                ></div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 统计表格 */}
      <div className="mt-8 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                日期
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                访客
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                新注册
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                提示词
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                去水印
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                视频生成
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {dailyStats.map((stat) => (
              <tr key={stat.date} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(stat.date).toLocaleDateString('zh-CN')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-blue-600 font-medium">
                  {stat.visitors}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600 font-medium">
                  {stat.registrations}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-purple-600 font-medium">
                  {stat.promptGenerations}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-orange-600 font-medium">
                  {stat.watermarkRemovals}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-pink-600 font-medium">
                  {stat.videoGenerations}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
