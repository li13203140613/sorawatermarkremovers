'use client'

import { useTranslations } from 'next-intl'

export default function DashboardFooter() {
  const t = useTranslations('dashboard')

  return (
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
            <a href="#" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
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
  )
}
