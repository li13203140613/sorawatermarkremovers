import type { Metadata } from 'next';
import { getCanonicalUrl } from '@/lib/seo/canonical';

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const canonicalUrl = getCanonicalUrl('/soraprompting', locale);

  return {
    title: 'Sora Prompts Gallery - Best AI Video Prompts Collection',
    description: 'Explore curated collection of high-quality Sora AI video prompts. Get inspired by professional video examples and their prompts. Perfect for content creators and AI enthusiasts.',
    keywords: 'Sora prompts, AI video prompts, Sora examples, video prompt library, AI video inspiration',
    alternates: {
      canonical: canonicalUrl,
      languages: Object.fromEntries(
        ['en', 'zh', 'ja', 'de', 'zh-hant'].map(lang => [
          lang,
          getCanonicalUrl('/soraprompting', lang)
        ])
      )
    },
    openGraph: {
      title: 'Sora Prompts Gallery - Professional AI Video Examples',
      description: 'Curated collection of high-quality Sora AI video prompts and examples.',
      type: 'website',
      url: canonicalUrl,
    },
  };
}

export default function SoraPromptingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
