import type { Metadata } from "next";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales } from '@/i18n';
import "../globals.css";
import "@/styles/blog.css";
import { ClientProviders, ClientNavBar } from '@/components/layout/ClientLayout';

export const metadata: Metadata = {
  title: "Sora2 Video HD Free Watermark Removal Tool",
  description: "Sora2 Remove Watermark Tool - Free online Sora video watermark removal service. Support all Sora and Sora2 video formats with AI-powered watermark removal technology while maintaining HD quality. No registration required, just paste Sora share link to remove watermark with one click and download watermark-free HD videos instantly. Sora2 去水印工具 - 免费在线 Sora 视频水印去除服务。支持 Sora 和 Sora2 所有视频格式，AI 智能去水印技术，保持高清画质不变。无需注册登录，粘贴 Sora 分享链接即可一键去除水印，快速下载无水印高清视频。",
  keywords: "Sora 2 Remove Watermark, Sora2 去水印, Sora watermark removal, AI watermark remover, video watermark removal, free watermark remover, HD video processing",
  openGraph: {
    title: "Sora2 Video HD Free Watermark Removal Tool",
    description: "Free online Sora video watermark removal service. Support all Sora and Sora2 video formats with AI-powered technology. No registration required, remove watermark with one click.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sora2 Video HD Free Watermark Removal Tool",
    description: "Free Sora & Sora2 video watermark removal. AI-powered, HD quality, one-click processing. No registration needed.",
  },
};

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

  // 获取翻译消息
  const messages = await getMessages({ locale });

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
        <NextIntlClientProvider messages={messages}>
          <ClientProviders>
            <div className="min-h-screen flex flex-col">
              <ClientNavBar />
              <main className="flex-1">
                {children}
              </main>
            </div>
          </ClientProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
