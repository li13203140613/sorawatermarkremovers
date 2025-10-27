/**
 * Hero Section - 服务端渲染版本
 * 用于 SEO 优化：H1 标题在服务端渲染，确保搜索引擎可见
 */

import { getTranslations } from 'next-intl/server';

interface HeroSectionSSRProps {
  locale: string;
}

export default async function HeroSectionSSR({ locale }: HeroSectionSSRProps) {
  const t = await getTranslations({ locale, namespace: 'home' });

  return (
    <div className="bg-gray-50 py-16 px-4 text-center border-b border-gray-200">
      <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
        {t('hero.title')}
      </h1>
    </div>
  );
}
