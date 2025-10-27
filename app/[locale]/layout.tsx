import type { Metadata } from "next";
import { notFound } from 'next/navigation';
import { locales } from '@/i18n';
import "../globals.css";
import "@/styles/blog.css";
import "@/styles/nprogress.css";
import { NavBarIsland } from '@/components/layout/NavBarIsland';
import { NProgressBar } from '@/components/layout/NProgressBar';
import { getCanonicalUrl } from '@/lib/seo/canonical';

// 动态生成 metadata（包含 canonical 链接）
export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  // 生成 canonical URL（首页）
  const canonicalUrl = getCanonicalUrl('/', locale);

  // 生成多语言 alternate links
  const alternates = {
    canonical: canonicalUrl,
    languages: Object.fromEntries(
      ['en', 'zh', 'ja', 'de', 'zh-hant'].map(lang => [
        lang,
        getCanonicalUrl('/', lang)
      ])
    )
  };

  return {
    title: "Create Amazing Sora AI Video Prompts with Our Free Generator",
    description: "Free Sora Prompt Generator - Create Viral AI Video Prompts Instantly. Generate perfect prompts for Sora AI video creation. Best prompt generator for stunning videos!",
    keywords: "Sora prompt generator, AI video prompts, Sora AI, free prompt generator, video prompt creator, Sora 2 prompts, AI video creation, viral video prompts",
    icons: {
      icon: [
        { url: '/sora2-icon.svg', type: 'image/svg+xml' },
      ],
    },
    alternates,
    openGraph: {
      title: "Create Amazing Sora AI Video Prompts with Our Free Generator",
      description: "Free Sora Prompt Generator - Create Viral AI Video Prompts Instantly. Generate perfect prompts for Sora AI video creation. Best prompt generator for stunning videos!",
      type: "website",
      url: canonicalUrl,
    },
    twitter: {
      card: "summary_large_image",
      title: "Create Amazing Sora AI Video Prompts with Our Free Generator",
      description: "Free Sora Prompt Generator - Create Viral AI Video Prompts Instantly. Generate perfect prompts for Sora AI video creation.",
    },
  };
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  // Next.js 15: 需要先 await params
  const { locale } = await params;

  // 验证 locale 是否有效
  if (!locales.includes(locale as any)) {
    notFound();
  }

  // 直接导入翻译文件，避免使用 getMessages() 导致客户端组件问题
  const messages = (await import(`@/messages/${locale}.json`)).default;

  return (
    <html lang={locale}>
      <head>
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-VFC640NVZG"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-VFC640NVZG');
            `,
          }}
        />
        <script
          type="text/javascript"
          dangerouslySetInnerHTML={{
            __html: `
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "tnbhvojfqa");
            `,
          }}
        />
      </head>
      <body>
        {/* Progress Bar - 客户端组件 */}
        <NProgressBar />

        <div className="min-h-screen flex flex-col">
          {/* NavBar Island - 独立的客户端岛屿，不影响 children */}
          <NavBarIsland locale={locale} initialMessages={messages} />

          {/* 主内容区域 - 保持服务端渲染 */}
          <main className="flex-1">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
