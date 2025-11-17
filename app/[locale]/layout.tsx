/* eslint-disable @next/next/next-script-for-ga */
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { locales } from '@/i18n'
import '../globals.css'
import '@/styles/blog.css'
import '@/styles/nprogress.css'
import { NavBarIsland } from '@/components/layout/NavBarIsland'
import { NProgressBar } from '@/components/layout/NProgressBar'
import { getCanonicalUrl } from '@/lib/seo/canonical'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params

  const canonicalUrl = getCanonicalUrl('/', locale)
  const alternates = {
    canonical: canonicalUrl,
    languages: Object.fromEntries(
      ['en', 'zh', 'ja', 'de', 'zh-hant'].map(lang => [lang, getCanonicalUrl('/', lang)])
    ),
  }

  return {
    title: 'Free online Sora & Sora 2 watermark remover for logo-free video downloads',
    description:
      'Free Sora/Sora 2 watermark remover to download videos without logos. Fast AI watermark removal, HD output, supports Sora video links. Remove Sora watermarks online with one click.',
    icons: {
      icon: [{ url: '/sora2-icon.svg', type: 'image/svg+xml' }],
    },
    alternates,
    openGraph: {
      title: 'Sora Watermark Remover | Remove Sora & Sora 2 Watermarks Free Online',
      description:
        'Remove Sora and Sora 2 watermarks instantly, download Sora videos without logos, and get HD files with our free online AI watermark remover.',
      type: 'website',
      url: canonicalUrl,
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Sora Watermark Remover | Download Sora Videos Without Watermark',
      description: 'Free Sora watermark remover for Sora & Sora 2 videos. One-click online removal, HD output, no logo.',
    },
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!locales.includes(locale as any)) {
    notFound()
  }

  const messages = (await import(`@/messages/${locale}.json`)).default

  return (
    <html lang={locale}>
      <head>
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-TY9YZJ8C6Z"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-TY9YZJ8C6Z');
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
        <NProgressBar />

        <div className="min-h-screen flex flex-col">
          <NavBarIsland locale={locale} initialMessages={messages} />
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  )
}
