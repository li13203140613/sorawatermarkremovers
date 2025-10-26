import type { Metadata } from 'next';
import { getCanonicalUrl } from '@/lib/seo/canonical';

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const canonicalUrl = getCanonicalUrl('/video-generation', locale);

  return {
    title: 'AI Video Generation - Create Sora Videos from Text & Images',
    description: 'Generate stunning AI videos with Sora2. Create videos from text prompts and reference images. Support for both standard and watermark-free versions.',
    keywords: 'AI video generation, Sora video creator, text to video, image to video, AI video maker',
    alternates: {
      canonical: canonicalUrl,
      languages: Object.fromEntries(
        ['en', 'zh', 'ja', 'de', 'zh-hant'].map(lang => [
          lang,
          getCanonicalUrl('/video-generation', lang)
        ])
      )
    },
    openGraph: {
      title: 'AI Video Generation - Sora2',
      description: 'Create stunning AI videos from text prompts and images.',
      type: 'website',
      url: canonicalUrl,
    },
  };
}

export default function VideoGenerationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
