import { Skeleton } from '@/components/ui/skeleton'

/**
 * 定价页面加载骨架屏
 */
export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* 标题骨架 */}
        <div className="text-center mb-12 space-y-4">
          <Skeleton className="h-12 w-2/3 mx-auto" />
          <Skeleton className="h-6 w-1/2 mx-auto" />
        </div>

        {/* 币种切换骨架 */}
        <div className="flex justify-center mb-8">
          <Skeleton className="h-12 w-48" />
        </div>

        {/* 定价卡片网格骨架 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
              <Skeleton className="h-8 w-32 mx-auto" />
              <Skeleton className="h-16 w-48 mx-auto" />
              <Skeleton className="h-4 w-full" />

              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, j) => (
                  <div key={j} className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ))}
              </div>

              <Skeleton className="h-12 w-full" />
            </div>
          ))}
        </div>

        {/* FAQ 骨架 */}
        <div className="mt-16 max-w-3xl mx-auto space-y-4">
          <Skeleton className="h-10 w-48 mb-8" />
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    </div>
  )
}
