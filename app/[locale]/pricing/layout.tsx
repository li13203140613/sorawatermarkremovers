import type { Metadata } from 'next';
import { getCanonicalUrl } from '@/lib/seo/canonical';

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const canonicalUrl = getCanonicalUrl('/pricing', locale);

  return {
    title: 'Pricing - Sora2 Remove Watermark Credits Package',
    description: 'Affordable credit packages for Sora2 video watermark removal and AI video generation. Starting from $10 for 30 credits. No subscription required, pay as you go.',
    keywords: 'Sora pricing, video watermark removal pricing, AI video generation cost, Sora credits',
    alternates: {
      canonical: canonicalUrl,
      languages: Object.fromEntries(
        ['en', 'zh', 'ja', 'de', 'zh-hant'].map(lang => [
          lang,
          getCanonicalUrl('/pricing', lang)
        ])
      )
    },
    openGraph: {
      title: 'Pricing - Sora2 Remove Watermark',
      description: 'Affordable credit packages for video processing. No subscription, pay as you go.',
      type: 'website',
      url: canonicalUrl,
    },
  };
}

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
