import Link from 'next/link'
import { useTranslations } from 'next-intl'

export default function Home() {
  const t = useTranslations('home')

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center space-y-6 p-8">
        <h1 className="text-5xl font-bold text-gray-900">{t('title')}</h1>
        <p className="text-xl text-gray-600">{t('subtitle')}</p>

        <div className="flex gap-4 justify-center mt-8">
          <Link
            href="/login"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            {t('getStarted')}
          </Link>
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg border border-gray-300 transition-colors"
          >
            {useTranslations('nav')('dashboard')}
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl">
          <div className="p-6 bg-white rounded-lg shadow">
            <div className="text-3xl mb-2">🚀</div>
            <h3 className="font-semibold mb-2">{t('features.fast.title')}</h3>
            <p className="text-sm text-gray-600">{t('features.fast.description')}</p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow">
            <div className="text-3xl mb-2">💎</div>
            <h3 className="font-semibold mb-2">{t('features.quality.title')}</h3>
            <p className="text-sm text-gray-600">{t('features.quality.description')}</p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow">
            <div className="text-3xl mb-2">📥</div>
            <h3 className="font-semibold mb-2">{t('features.easy.title')}</h3>
            <p className="text-sm text-gray-600">{t('features.easy.description')}</p>
          </div>
        </div>
      </div>
    </main>
  )
}
