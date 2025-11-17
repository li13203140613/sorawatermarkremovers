'use client';

/**
 * 全局错误边界组件
 * 捕获应用中的运行时错误并显示友好的错误页�?
 *
 * Next.js 15 约定�?
 * - error.tsx 必须�?Client Component
 * - 自动接收 error �?reset 参数
 * - 不会捕获 layout.tsx 中的错误（需要在父级添加 error.tsx�?
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  const router = useRouter();

  useEffect(() => {
    // 记录错误到控制台（生产环境可以发送到错误追踪服务�?
    console.error('Global Error Boundary caught:', error);

    // 可选：发送错误到日志服务（如 Sentry�?
    // logErrorToService(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8 md:p-12">
            {/* 错误图标 */}
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
            </div>

            {/* 错误标题 */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-4">
              哎呀，出错了�?
            </h1>

            {/* 错误描述 */}
            <p className="text-lg text-gray-600 text-center mb-8">
              应用遇到了一个意外错误。我们已经记录了这个问题，会尽快修复�?
            </p>

            {/* 开发环境：显示错误详情 */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mb-8 p-4 bg-gray-100 rounded-lg border border-gray-300">
                <p className="text-sm font-mono text-gray-800 mb-2">
                  <strong>错误信息�?/strong>
                </p>
                <p className="text-sm font-mono text-red-600 break-all">
                  {error.message}
                </p>
                {error.digest && (
                  <p className="text-sm font-mono text-gray-600 mt-2">
                    <strong>Error Digest�?/strong> {error.digest}
                  </p>
                )}
              </div>
            )}

            {/* 操作按钮 */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={reset}
                className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
              >
                🔄 重试
              </button>

              <button
                onClick={() => router.push('/')}
                className="px-8 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors shadow-lg hover:shadow-xl"
              >
                🏠 返回首页
              </button>

              <button
                onClick={() => router.back()}
                className="px-8 py-3 bg-white text-gray-700 font-medium rounded-lg border-2 border-gray-300 hover:bg-gray-50 transition-colors"
              >
                �?返回上一�?
              </button>
            </div>

            {/* 帮助信息 */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-500 text-center">
                如果问题持续存在，请联系{' '}
                <a
                  href="mailto:support@sorawatermarkremovers.com"
                  className="text-blue-600 hover:text-blue-700 underline"
                >
                  技术支�?
                </a>
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
