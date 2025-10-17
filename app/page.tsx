'use client'

import { VideoProcessor } from '@/components/video'
import { useTranslations } from 'next-intl'

export default function Home() {
  const t = useTranslations('dashboard')

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-gray-100 flex flex-col">
      <div className="flex-1 flex flex-col">
        {/* 主标题区域 */}
        <div className="text-center pt-16 pb-12 px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            {t('title')}
          </h1>
          <p className="text-base md:text-lg text-gray-600">
            {t('subtitle')}
          </p>
        </div>

        {/* 视频处理区域 */}
        <div className="flex-1 px-4 pb-12 pt-8">
          <VideoProcessor />
        </div>
      </div>

      {/* 底部免责声明 */}
      <footer className="bg-white border-t border-gray-200 py-10 px-4 mt-auto">
        <div className="max-w-4xl mx-auto">
          <div className="text-center space-y-3">
            <p className="text-sm text-gray-600">
              ⚠️ {t('disclaimer.title')}
            </p>
            <p className="text-xs text-gray-500 max-w-2xl mx-auto leading-relaxed">
              {t('disclaimer.content')}
            </p>
            <p className="text-xs text-gray-400 pt-2">
              {t('disclaimer.limit')}
            </p>
            <div className="flex justify-center gap-8 pt-6">
              <a href="/privacy" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                {t('footer.privacy')}
              </a>
              <a href="#" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                {t('footer.terms')}
              </a>
              <a href="#" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                {t('footer.contact')}
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
