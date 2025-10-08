import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center space-y-6 p-8">
        <h1 className="text-5xl font-bold text-gray-900">RemoveWM</h1>
        <p className="text-xl text-gray-600">Sora2 视频水印去除工具</p>

        <div className="flex gap-4 justify-center mt-8">
          <Link
            href="/login"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            开始使用
          </Link>
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg border border-gray-300 transition-colors"
          >
            进入控制台
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl">
          <div className="p-6 bg-white rounded-lg shadow">
            <div className="text-3xl mb-2">🚀</div>
            <h3 className="font-semibold mb-2">快速处理</h3>
            <p className="text-sm text-gray-600">只需粘贴链接，一键去除水印</p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow">
            <div className="text-3xl mb-2">💎</div>
            <h3 className="font-semibold mb-2">积分系统</h3>
            <p className="text-sm text-gray-600">新用户赠送 2 积分，按需充值</p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow">
            <div className="text-3xl mb-2">📥</div>
            <h3 className="font-semibold mb-2">便捷下载</h3>
            <p className="text-sm text-gray-600">在线预览，一键下载或复制链接</p>
          </div>
        </div>
      </div>
    </main>
  )
}
