import type { Metadata } from "next";
import "./globals.css";
import "@/styles/blog.css";
import { NextIntlClientProvider } from 'next-intl';
import { cookies } from 'next/headers';
import { defaultLocale, type Locale, locales } from '@/i18n';
import { ClientProviders, ClientNavBar } from '@/components/layout/ClientLayout';

export const metadata: Metadata = {
  title: "RemoveWM - HD Sora Video Watermark Removal",
  description: "Remove Sora video watermarks in HD quality without compromising resolution. Simply paste your link and our AI removes the Sora logo watermark in seconds.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get('NEXT_LOCALE')?.value as Locale;

  // 如果没有 cookie，使用默认语言（将在客户端检测浏览器语言）
  const locale = localeCookie && locales.includes(localeCookie) ? localeCookie : defaultLocale;

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
