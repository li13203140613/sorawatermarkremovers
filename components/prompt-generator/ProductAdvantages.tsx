'use client';

import { useTranslations } from 'next-intl';

interface ProductAdvantagesProps {
  locale?: string;
}

export default function ProductAdvantages({ locale = 'zh' }: ProductAdvantagesProps) {
  const t = useTranslations('promptGenerator.advantages');
  const iconColors = ['bg-primary', 'bg-green-600', 'bg-purple-600', 'bg-amber-600'];

  const advantageKeys = ['speed', 'customization', 'viral', 'free'];

  return (
    <div className="bg-white py-16 px-4 border-t border-gray-200">
      <div className="max-w-6xl mx-auto">
        {/* Section Title */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-3">
            <i className="fas fa-star text-amber-500 mr-2"></i>
            {t('title')}
          </h2>
          <p className="text-xl text-gray-600">{t('subtitle')}</p>
        </div>

        {/* Advantages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {advantageKeys.map((key, index) => (
            <div
              key={key}
              className="group text-center p-6 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-lg transition-all"
            >
              <div className={`w-16 h-16 mx-auto mb-4 ${iconColors[index % iconColors.length]} rounded-full flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <span className="text-white text-2xl">{['⚡', '🎯', '🔥', '💰'][index]}</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">
                {t(`${key}.title`)}
              </h3>
              <p className="text-sm text-gray-600">
                {t(`${key}.description`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
