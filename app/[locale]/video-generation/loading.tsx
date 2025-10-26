import { Skeleton } from '@/components/ui/skeleton'

/**
 * 视频生成页面加载骨架屏
 */
export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* 标题骨架 */}
        <div className="text-center mb-12 space-y-4">
          <Skeleton className="h-12 w-3/4 mx-auto" />
          <Skeleton className="h-6 w-1/2 mx-auto" />
        </div>

        {/* 标签页骨架 */}
        <div className="mb-6">
          <Skeleton className="h-12 w-96" />
        </div>

        {/* 表单骨架 */}
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <div className="space-y-4">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-24 w-full" />
          </div>

          <div className="space-y-4">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-32 w-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>

          <Skeleton className="h-12 w-full" />
        </div>

        {/* 视频网格骨架（批量生成） */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    </div>
  )
}
