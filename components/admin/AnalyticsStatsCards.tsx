'use client'

import { AnalyticsStats } from '@/lib/admin/types'

interface AnalyticsStatsCardsProps {
  stats: AnalyticsStats
}

export default function AnalyticsStatsCards({ stats }: AnalyticsStatsCardsProps) {
  const cards = [
    {
      title: '登录访客',
      total: stats.totalVisitors,
      today: stats.todayVisitors,
      icon: '👥',
      color: 'blue',
    },
    {
      title: '新注册用户',
      total: stats.newRegistrations,
      today: stats.todayRegistrations,
      icon: '🆕',
      color: 'green',
    },
    {
      title: '提示词生成',
      total: stats.promptGenerations,
      today: stats.todayPromptGenerations,
      icon: '✨',
      color: 'purple',
    },
    {
      title: '去水印',
      total: stats.watermarkRemovals,
      today: stats.todayWatermarkRemovals,
      icon: '🎬',
      color: 'orange',
    },
    {
      title: '视频生成',
      total: stats.videoGenerations,
      today: stats.todayVideoGenerations,
      icon: '🎥',
      color: 'pink',
    },
  ]

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      blue: { bg: 'bg-blue-50', text: 'text-blue-600' },
      green: { bg: 'bg-green-50', text: 'text-green-600' },
      purple: { bg: 'bg-purple-50', text: 'text-purple-600' },
      orange: { bg: 'bg-orange-50', text: 'text-orange-600' },
      pink: { bg: 'bg-pink-50', text: 'text-pink-600' },
    }
    return colors[color] || colors.blue
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      {cards.map((card) => {
        const colorClasses = getColorClasses(card.color)
        return (
          <div
            key={card.title}
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${colorClasses.bg} p-3 rounded-lg`}>
                <span className="text-2xl">{card.icon}</span>
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-2">
              {card.title}
            </h3>
            <div className="flex items-baseline gap-2">
              <p className={`text-3xl font-bold ${colorClasses.text}`}>
                {card.total.toLocaleString()}
              </p>
              <span className="text-xs text-gray-500">总计</span>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">今日:</span>
                <span className={`text-lg font-semibold ${colorClasses.text}`}>
                  {card.today.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
