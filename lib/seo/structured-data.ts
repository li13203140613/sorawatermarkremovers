/**
 * SEO 结构化数据（JSON-LD）生成工具
 * 帮助搜索引擎更好地理解网站内容
 *
 * 参考资料：
 * - https://schema.org/
 * - https://developers.google.com/search/docs/appearance/structured-data
 */

import { Organization, WebSite, SoftwareApplication, FAQPage, BreadcrumbList, VideoObject } from 'schema-dts';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.sora-prompt.io';

/**
 * 生成 Organization 结构化数据（组织信息）
 * 用于首页，告诉搜索引擎网站是什么组织
 */
export function generateOrganizationSchema(): Organization {
  return {
    '@type': 'Organization',
    '@id': `${BASE_URL}/#organization`,
    name: 'Sora2 Remove Watermark',
    url: BASE_URL,
    logo: `${BASE_URL}/logo.png`,
    description: 'Professional Sora2 video watermark removal and AI video generation platform. Free online service with AI-powered technology.',
    sameAs: [
      // 添加社交媒体链接（如果有）
      // 'https://twitter.com/yourhandle',
      // 'https://github.com/yourorg',
    ],
  };
}

/**
 * 生成 WebSite 结构化数据（网站信息）
 * 包含搜索功能，显示在搜索结果中
 */
export function generateWebSiteSchema() {
  return {
    '@type': 'WebSite',
    '@id': `${BASE_URL}/#website`,
    url: BASE_URL,
    name: 'Sora2 Video Watermark Removal & AI Video Generation',
    description: 'Free online Sora2 video watermark removal service and AI video generation platform. Support all Sora formats with HD quality.',
    publisher: {
      '@id': `${BASE_URL}/#organization`,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE_URL}/blog?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * 生成 SoftwareApplication 结构化数据（软件应用）
 * 用于首页，描述我们的工具
 */
export function generateSoftwareApplicationSchema(): SoftwareApplication {
  return {
    '@type': 'SoftwareApplication',
    '@id': `${BASE_URL}/#application`,
    name: 'Sora2 Prompt Generator',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    description: 'AI-powered Sora2 prompt generator for creating professional video generation prompts. Supports 7 categories with 184+ preset options.',
    featureList: [
      'AI Prompt Generation',
      'Video Watermark Removal',
      'Batch Video Generation',
      'Multi-language Support',
      '7 Video Categories',
      '184+ Preset Options',
    ],
    screenshot: `${BASE_URL}/screenshot.png`,
  };
}

/**
 * 生成 FAQ 结构化数据
 * 显示在搜索结果的富文本片段中
 */
export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>): FAQPage {
  return {
    '@type': 'FAQPage',
    '@id': `${BASE_URL}/#faq`,
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * 生成 BreadcrumbList 结构化数据（面包屑导航）
 * 帮助搜索引擎理解网站结构
 */
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>): BreadcrumbList {
  return {
    '@type': 'BreadcrumbList',
    '@id': `${BASE_URL}/#breadcrumb`,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * 生成 VideoObject 结构化数据
 * 用于视频内容页面
 */
export function generateVideoSchema(video: {
  name: string;
  description: string;
  thumbnailUrl: string;
  uploadDate: string;
  contentUrl?: string;
  duration?: string;
}): VideoObject {
  return {
    '@type': 'VideoObject',
    name: video.name,
    description: video.description,
    thumbnailUrl: video.thumbnailUrl,
    uploadDate: video.uploadDate,
    contentUrl: video.contentUrl,
    duration: video.duration,
  };
}

/**
 * 将结构化数据转换为 JSON-LD 字符串
 * 用于嵌入到 <script type="application/ld+json"> 中
 */
export function toJsonLd(schema: any): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    ...schema,
  });
}

/**
 * 生成首页的完整结构化数据（包含多个 Schema）
 */
export function generateHomePageSchema() {
  const schemas = [
    generateOrganizationSchema(),
    generateWebSiteSchema(),
    generateSoftwareApplicationSchema(),
  ];

  return schemas.map(schema => toJsonLd(schema));
}

/**
 * FAQ 数据（首页）
 */
export const HOME_FAQ_DATA = [
  {
    question: '如何使用提示词生成器创建 AI 视频？',
    answer: '只需三步：1) 选择您想要的视频类别；2) 在快速模式输入创意，或在专业模式填写详细参数；3) 点击"生成提示词"按钮。我们的 AI 会立即生成专业级 Sora 2 提示词供您使用。',
  },
  {
    question: '生成的提示词可以直接在 Sora 2 中使用吗？',
    answer: '是的！所有生成的提示词都完全兼容 Sora 2 平台。您可以直接复制提示词到 Sora 2 官方平台，立即开始生成高质量视频。',
  },
  {
    question: '有生成次数限制吗？',
    answer: '完全没有限制！Sora-Prompt 100% 免费使用，无需注册账号，无需绑定信用卡。您可以生成无限数量的提示词。',
  },
  {
    question: 'Sora 2 去水印服务需要付费吗？',
    answer: '新用户注册即可获得 3 个免费积分。每次去水印消耗 1 积分，每次生成视频消耗 1-2 积分。积分用完后可以购买更多积分。',
  },
];
