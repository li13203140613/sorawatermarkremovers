/**
 * 首页 - 混合渲染架构（SEO优化版本）
 *
 * SEO优化策略：
 * - 服务端渲染：H1、静态内容、结构化数据 → 搜索引擎友好
 * - 客户端渲染：表单、交互、动态内容 → 用户体验优化
 *
 * 渲染方式：
 * ✅ 服务端：Hero Section, Sora Introduction, Product Advantages, Feature Navigation, Structured Data
 * 🔄 客户端：Google One Tap, Prompt Generator, Results Display, Gallery, FAQ
 */

import { getTranslations } from 'next-intl/server';
import { generateHomePageSchema, generateFAQSchema, HOME_FAQ_DATA } from '@/lib/seo/structured-data';
import ClientInteractiveSectionWithProviders from '@/components/home/ClientInteractiveSectionWithProviders';
import SoraIntroductionSSR from '@/components/prompt-generator/SoraIntroductionSSR';
import ProductAdvantagesSSR from '@/components/prompt-generator/ProductAdvantagesSSR';
import FeatureNavigationSSR from '@/components/prompt-generator/FeatureNavigationSSR';

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'home' });

  // 生成结构化数据
  const homeSchemas = generateHomePageSchema();
  const faqSchema = generateFAQSchema(HOME_FAQ_DATA);

  return (
    <>
      {/* 结构化数据 - JSON-LD Schema（SEO关键） */}
      {homeSchemas.map((schema, index) => (
        <script
          key={`schema-${index}`}
          id={`structured-data-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: schema }}
        />
      ))}
      <script
        id="structured-data-faq"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', ...faqSchema }) }}
      />

      <div className="min-h-screen bg-white">
        {/* Hero Section - 服务端渲染（SEO关键：H1标题） */}
        <div className="bg-gray-50 py-16 px-4 text-center border-b border-gray-200">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
            {t('hero.title')}
          </h1>
        </div>

        {/* 客户端交互区域（表单、结果、画廊、FAQ） */}
        <ClientInteractiveSectionWithProviders />

        {/* Sora Introduction - 服务端渲染（SEO优化） */}
        <SoraIntroductionSSR />

        {/* Product Advantages - 服务端渲染（SEO优化） */}
        <ProductAdvantagesSSR />

        {/* Feature Navigation - 服务端渲染（内链优化） */}
        <FeatureNavigationSSR />
      </div>
    </>
  );
}
