import type { Metadata } from 'next';
import { getCanonicalUrl } from '@/lib/seo/canonical';

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const canonicalUrl = getCanonicalUrl('/blog', locale);

  return {
    title: 'Blog - Sora2 Video Processing Tips & AI Technology Updates',
    description: 'Learn about video watermark removal, AI video generation, Sora prompts, and the latest AI technology updates. Expert tutorials and guides for content creators.',
    keywords: 'Sora blog, video processing tips, AI video generation guide, watermark removal tutorial, Sora prompts',
    alternates: {
      canonical: canonicalUrl,
      languages: Object.fromEntries(
        ['en', 'zh', 'ja', 'de', 'zh-hant'].map(lang => [
          lang,
          getCanonicalUrl('/blog', lang)
        ])
      )
    },
    openGraph: {
      title: 'Blog - Sora2 Video Processing & AI Technology',
      description: 'Expert tutorials and guides for video processing and AI technology.',
      type: 'website',
      url: canonicalUrl,
    },
  };
}

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
