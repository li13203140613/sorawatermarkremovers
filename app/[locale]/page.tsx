/**
 * Home page - RemoveWM Sora/Sora2 watermark remover
 */

import { getTranslations, getMessages } from 'next-intl/server'
import { generateHomePageSchema, generateFAQSchema, HOME_FAQ_DATA } from '@/lib/seo/structured-data'
import ClientInteractiveSectionWithProviders from '@/components/home/ClientInteractiveSectionWithProviders'

const SEO_FAQ = [
  {
    question: 'How to remove Sora watermark or Sora 2 watermark online?',
    answer:
      'Paste the Sora or Sora 2 share link, click "Remove Watermark", wait for AI to clean the logo, and download the video without watermark in HD.',
  },
  {
    question: 'Is there a free Sora watermark remover?',
    answer:
      'Yes. RemoveWM offers free credits for new users and daily login rewards so you can remove Sora watermarks for free before upgrading.',
  },
  {
    question: 'Will the Sora watermark removal keep audio and resolution?',
    answer:
      'Yes. We preserve audio, resolution, and bitrate while removing the watermark so your Sora video download stays crisp and ready to share.',
  },
  {
    question: 'Is the Sora watermark remover safe to use?',
    answer:
      'We process links securely, use temporary URLs, and never share your files. Your Sora watermark removal tasks remain private.',
  },
]

const SEO_TECH_NOTES = [
  'AI-based logo detection for Sora and Sora 2 videos with frame-level cleanup.',
  'Edge-aware inpainting to avoid blur around the Sora watermark area.',
  'Handles "sora watermark", "sora2 watermark", and custom logo placements.',
  'Server-side processing keeps your Sora video secure; downloads use HTTPS.',
]

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'home' })
  const messages = await getMessages({ locale })

  const homeSchemas = generateHomePageSchema()
  const faqSchemaJson = generateFAQSchema(HOME_FAQ_DATA)

  return (
    <>
      {/* Structured data - JSON-LD for SEO */}
      {homeSchemas.map((schema, index) => {
        try {
          JSON.parse(schema)
        } catch {
          console.error('Invalid schema JSON:', schema)
          return null
        }
        return (
          <script
            key={`schema-${index}`}
            id={`structured-data-${index}`}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: schema }}
          />
        )
      })}
      <script
        id="structured-data-faq"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            {
              '@context': 'https://schema.org',
              ...faqSchemaJson,
            },
            null,
            0
          ),
        }}
      />

      <div className="min-h-screen bg-white">
        {/* Hero Section - server rendered for SEO (H1) */}
        <div className="bg-gray-50 py-16 px-4 text-center border-b border-gray-200">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-4">
            {t('hero.title')}
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            {t('hero.subtitle')}
          </p>
        </div>

        {/* Client interactive section (watermark removal) */}
        <ClientInteractiveSectionWithProviders locale={locale} messages={messages} />

        {/* Features Section */}
        <div className="bg-white py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              {t('features.title')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('features.fast.title')}</h3>
                <p className="text-gray-600">{t('features.fast.description')}</p>
              </div>

              {/* Feature 2 */}
              <div className="text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('features.quality.title')}</h3>
                <p className="text-gray-600">{t('features.quality.description')}</p>
              </div>

              {/* Feature 3 */}
              <div className="text-center">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('features.secure.title')}</h3>
                <p className="text-gray-600">{t('features.secure.description')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* SEO Content: FAQ + Technical notes for Sora watermark removal */}
        <div className="bg-gray-50 border-t border-gray-200 py-16 px-4">
          <div className="container mx-auto max-w-5xl space-y-12">
            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Sora Watermark Remover FAQ</h2>
              <div className="space-y-6">
                {SEO_FAQ.map((item, idx) => (
                  <div key={idx} className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.question}</h3>
                    <p className="text-gray-700 leading-relaxed">{item.answer}</p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Technical notes for Sora &amp; Sora 2 watermark removal</h2>
              <p className="text-gray-700 mb-4">
                Optimized for searches like &quot;remove Sora watermark&quot;, &quot;Sora 2 watermark remover&quot;,
                &quot;download Sora video without watermark&quot;, and other Sora watermark removal keywords.
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                {SEO_TECH_NOTES.map((note, idx) => (
                  <li key={idx}>{note}</li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </div>
    </>
  )
}
