'use client';

import { useTranslations } from 'next-intl';

interface SoraIntroductionProps {
  locale?: string;
}

export default function SoraIntroduction({ locale = 'zh' }: SoraIntroductionProps) {
  const t = useTranslations('promptGenerator.introduction');

  return (
    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 py-16 px-4 border-t border-gray-200">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              <i className="fas fa-video text-primary mr-3"></i>
              {t('title')}
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p className="text-lg">
                <strong className="text-primary">Sora 2</strong> {t('description1')}
              </p>
              <p>
                {t('description2')}
              </p>
              <div className="flex gap-4 mt-6">
                <div className="flex-1 bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-3xl font-bold text-primary mb-1">10M+</div>
                  <div className="text-sm text-gray-600">{t('stats.generations')}</div>
                </div>
                <div className="flex-1 bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-3xl font-bold text-green-600 mb-1">98%</div>
                  <div className="text-sm text-gray-600">{t('stats.satisfaction')}</div>
                </div>
                <div className="flex-1 bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-3xl font-bold text-amber-600 mb-1">24/7</div>
                  <div className="text-sm text-gray-600">{t('stats.service')}</div>
                </div>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl p-8 text-white">
              <i className="fas fa-quote-left text-4xl opacity-50 mb-4"></i>
              <p className="text-lg mb-6">
                &ldquo;{t('testimonial.quote')}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                  <i className="fas fa-user text-primary text-xl"></i>
                </div>
                <div>
                  <div className="font-bold">{t('testimonial.author')}</div>
                  <div className="text-sm opacity-90">{t('testimonial.role')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
