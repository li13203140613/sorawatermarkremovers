'use client';

import Link from 'next/link';
import { Video, Sparkles, Image, DollarSign } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface Feature {
  icon: any;
  href: string;
  color: string;
  bgColor: string;
  titleKey: string;
  descriptionKey: string;
}

const FEATURE_CONFIG: Feature[] = [
  {
    icon: Video,
    href: '/dashboard',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 hover:bg-blue-100',
    titleKey: 'watermark.title',
    descriptionKey: 'watermark.description',
  },
  {
    icon: Sparkles,
    href: '/video-generation',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 hover:bg-purple-100',
    titleKey: 'videoGeneration.title',
    descriptionKey: 'videoGeneration.description',
  },
  {
    icon: Image,
    href: '/soraprompting',
    color: 'text-green-600',
    bgColor: 'bg-green-50 hover:bg-green-100',
    titleKey: 'promptShowcase.title',
    descriptionKey: 'promptShowcase.description',
  },
  {
    icon: DollarSign,
    href: '/pricing',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50 hover:bg-amber-100',
    titleKey: 'pricing.title',
    descriptionKey: 'pricing.description',
  },
];

export default function FeatureNavigation() {
  const t = useTranslations('promptGenerator.features');

  return (
    <div className="bg-white py-16 px-4 border-t border-gray-200">
      <div className="max-w-6xl mx-auto">
        {/* Section Title */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-3">
            {t('title')}
          </h2>
          <p className="text-xl text-gray-600">{t('subtitle')}</p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURE_CONFIG.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Link
                key={index}
                href={feature.href}
                className={`group block p-6 rounded-xl ${feature.bgColor} transition-all duration-200 hover:shadow-lg`}
              >
                <div className="flex flex-col items-center text-center">
                  {/* Icon */}
                  <div className={`w-16 h-16 ${feature.color} mb-4 flex items-center justify-center rounded-full bg-white shadow-sm group-hover:scale-110 transition-transform`}>
                    <Icon className="w-8 h-8" />
                  </div>

                  {/* Title */}
                  <h3 className={`text-lg font-bold mb-2 ${feature.color}`}>
                    {t(feature.titleKey)}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {t(feature.descriptionKey)}
                  </p>

                  {/* Arrow */}
                  <div className="mt-4 text-sm font-medium text-gray-500 group-hover:text-gray-700 flex items-center gap-1">
                    {t('useNow')}
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="mt-12 text-center">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-lg hover:shadow-lg transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            {t('viewBlog')}
          </Link>
        </div>
      </div>
    </div>
  );
}
