/**
 * SEO structured data helpers (JSON-LD)
 * Reference:
 * - https://schema.org/
 * - https://developers.google.com/search/docs/appearance/structured-data
 */

import { Organization, WebSite, SoftwareApplication, FAQPage, BreadcrumbList, VideoObject } from 'schema-dts'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.sorawatermarkremovers.com'

export function generateOrganizationSchema(): Organization {
  return {
    '@type': 'Organization',
    '@id': `${BASE_URL}/#organization`,
    name: 'RemoveWM - Sora Watermark Remover',
    url: BASE_URL,
    logo: `${BASE_URL}/logo.png`,
    description:
      'Professional Sora and Sora 2 video watermark remover. Free online download without logos, AI-powered cleaning with HD output.',
    sameAs: [
      // Social links (optional)
      // 'https://twitter.com/yourhandle',
      // 'https://github.com/yourorg',
    ],
  }
}

export function generateWebSiteSchema(): WebSite {
  return {
    '@type': 'WebSite',
    '@id': `${BASE_URL}/#website`,
    url: BASE_URL,
    name: 'Sora & Sora 2 Video Watermark Remover',
    description:
      'Free online Sora watermark remover to download Sora and Sora 2 videos without watermarks. AI-powered, HD export, one-click removal.',
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
  }
}

export function generateSoftwareApplicationSchema(): SoftwareApplication {
  return {
    '@type': 'SoftwareApplication',
    '@id': `${BASE_URL}/#application`,
    name: 'Sora Watermark Remover',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    description:
      'AI-powered Sora and Sora 2 watermark remover. Paste Sora share links, remove watermark online, and download clean HD videos for free.',
    featureList: [
      'Sora & Sora 2 watermark removal',
      'AI video logo eraser',
      'HD download without watermark',
      'Free online watermark remover',
      'Secure processing & privacy-safe',
      'Multi-language interface',
    ],
    screenshot: `${BASE_URL}/screenshot.png`,
  }
}

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
  }
}

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
  }
}

export function generateVideoSchema(video: {
  name: string
  description: string
  thumbnailUrl: string
  uploadDate: string
  contentUrl?: string
  duration?: string
}): VideoObject {
  return {
    '@type': 'VideoObject',
    name: video.name,
    description: video.description,
    thumbnailUrl: video.thumbnailUrl,
    uploadDate: video.uploadDate,
    contentUrl: video.contentUrl,
    duration: video.duration,
  }
}

export function toJsonLd(schema: any): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    ...schema,
  })
}

export function generateHomePageSchema() {
  const schemas = [
    generateOrganizationSchema(),
    generateWebSiteSchema(),
    generateSoftwareApplicationSchema(),
  ]

  return schemas.map(schema => toJsonLd(schema))
}

export const HOME_FAQ_DATA = [
  {
    question: 'How do I remove a Sora or Sora 2 watermark?',
    answer:
      'Paste the Sora or Sora 2 share link, click "Remove Watermark", wait for AI processing, then download the Sora video without watermark. No editing skills required.',
  },
  {
    question: 'Is the Sora watermark remover free?',
    answer:
      'Yes. New users get free credits and daily login rewards. You can remove Sora watermarks online for free and upgrade anytime for more HD exports.',
  },
  {
    question: 'Can I download Sora videos without watermark and keep HD quality?',
    answer:
      'The remover keeps the original resolution and bitrate. You can download Sora or Sora 2 videos without logos in HD after the watermark is cleaned.',
  },
  {
    question: 'Is the process safe?',
    answer:
      'We process links securely on the server side, do not share videos, and use temporary URLs. Your Sora watermark removal tasks stay private.',
  },
]
