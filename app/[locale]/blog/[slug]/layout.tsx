import type { Metadata } from 'next';
import { getCanonicalUrl } from '@/lib/seo/canonical';

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const canonicalUrl = getCanonicalUrl(`/blog/${slug}`, locale);

  // 从API获取文章信息（用于更精确的metadata）
  let title = 'Blog Post - Sora2 Remove Watermark';
  let description = 'Read our latest article about video processing and AI technology.';

  try {
    // 尝试从API获取文章详情
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/blog/post?slug=${slug}&lang=${locale}`, {
      cache: 'force-cache', // 缓存metadata
    });

    if (response.ok) {
      const data = await response.json();
      if (data.post) {
        title = `${data.post.title} - Sora2 Blog`;
        description = data.post.description || description;
      }
    }
  } catch (error) {
    // 使用默认值
    console.error('Failed to fetch blog post metadata:', error);
  }

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: Object.fromEntries(
        ['en', 'zh', 'ja', 'de', 'zh-hant'].map(lang => [
          lang,
          getCanonicalUrl(`/blog/${slug}`, lang)
        ])
      )
    },
    openGraph: {
      title,
      description,
      type: 'article',
      url: canonicalUrl,
    },
  };
}

export default function BlogPostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
