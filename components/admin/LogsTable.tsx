import { UsageLog } from '@/lib/admin/types'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface Props {
  logs: UsageLog[]
  total: number
  currentPage: number
  pageSize: number
  onPageChange: (page: number) => void
}

export default function LogsTable({
  logs,
  total,
  currentPage,
  pageSize,
  onPageChange,
}: Props) {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'yyyy-MM-dd HH:mm:ss', {
        locale: zhCN,
      })
    } catch {
      return dateString
    }
  }

  const truncateUrl = (url: string, maxLength = 50) => {
    if (url.length <= maxLength) return url
    return url.substring(0, maxLength) + '...'
  }

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                时间
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                用户
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                原始链接
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                生成链接
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                积分
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                状态
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  暂无数据
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-900">
                    {formatDate(log.created_at)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    {log.user_email ? (
                      <div>
                        <div className="font-medium text-gray-900">
                          {log.user_email}
                        </div>
                        <div className="text-xs text-gray-500">
                          剩余: {log.credits_remaining ?? 'N/A'}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400">访客</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <a
                      href={log.original_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:underline"
                      title={log.original_url}
                    >
                      {truncateUrl(log.original_url)}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {log.processed_url ? (
                      <a
                        href={log.processed_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:underline"
                        title={log.processed_url}
                      >
                        {truncateUrl(log.processed_url)}
                      </a>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {log.credits_used > 0 ? `-${log.credits_used}` : '0'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {log.status === 'success' ? (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        成功
                      </span>
                    ) : (
                      <span
                        className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 cursor-help"
                        title={log.error_message || ''}
                      >
                        失败
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            共 {total} 条记录，第 {currentPage} / {totalPages} 页
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              上一页
            </button>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              下一页
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
