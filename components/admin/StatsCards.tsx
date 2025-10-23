import { AdminStats } from '@/lib/admin/types'

interface Props {
  stats: AdminStats
}

export default function StatsCards({ stats }: Props) {
  const cards = [
    {
      title: '总用户数',
      value: stats.totalUsers,
      subtext: `今日新增 ${stats.todayNewUsers} 人`,
      color: 'blue',
    },
    {
      title: '今日处理次数',
      value: stats.todayProcessed,
      subtext: '过去 24 小时',
      color: 'green',
    },
    {
      title: '成功率',
      value: `${stats.successRate}%`,
      subtext: '所有时间',
      color: 'purple',
    },
    {
      title: '7天活跃用户',
      value: stats.activeUsers7d,
      subtext: '过去 7 天',
      color: 'orange',
    },
  ]

  const colorClasses = {
    blue: 'bg-purple-50 text-purple-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => (
        <div
          key={card.title}
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{card.title}</p>
              <p className="text-3xl font-bold mt-2">{card.value}</p>
              <p className="text-xs text-gray-500 mt-1">{card.subtext}</p>
            </div>
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center ${
                colorClasses[card.color as keyof typeof colorClasses]
              }`}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
