'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { NextIntlClientProvider } from 'next-intl'
import { AuthProvider } from '@/lib/auth'
import { CreditsProvider } from '@/contexts/CreditsContext'
import { PaymentPackages } from '@/components/payment'
import { useTranslations } from 'next-intl'

function PricingContent() {
  const t = useTranslations('payment')
  const tDashboard = useTranslations('dashboard')

  const pricingSchema = useMemo(() => {
    const data = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: 'Sora Watermark Remover Credits',
      description: 'Credits for Sora/Sora2 video watermark removal with HD downloads and AI edge cleanup.',
      offers: [
        {
          '@type': 'Offer',
          priceCurrency: 'USD',
          price: '10',
          url: 'https://www.sorawatermarkremovers.com/en/pricing',
          availability: 'https://schema.org/InStock',
        },
      ],
    }
    return JSON.stringify(data)
  }, [])

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-gray-100 flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: pricingSchema }} />
      <div className="flex-1 flex flex-col">
        {/* Pricing Packages */}
        <div className="flex-1 px-4 pt-16 pb-12">
          <PaymentPackages />
        </div>
      </div>

      {/* Footer Disclaimer */}
      <footer className="bg-white border-t border-gray-200 py-10 px-4 mt-auto">
        <div className="max-w-4xl mx-auto">
          <div className="text-center space-y-3">
            <p className="text-sm text-gray-600">
              ⚠️ {tDashboard('disclaimer.title')}
            </p>
            <p className="text-xs text-gray-500 max-w-2xl mx-auto leading-relaxed">
              {tDashboard('disclaimer.content')}
            </p>
            <p className="text-xs text-gray-400 pt-2">
              {tDashboard('disclaimer.limit')}
            </p>
            <div className="flex justify-center gap-8 pt-6">
              <a href="#" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                {tDashboard('footer.privacy')}
              </a>
              <a href="#" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                {tDashboard('footer.terms')}
              </a>
              <a href="#" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                {tDashboard('footer.contact')}
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}

export default function PricingPage() {
  const params = useParams()
  const locale = params.locale as string
  const [messages, setMessages] = useState({})

  useEffect(() => {
    import(`@/messages/${locale}.json`)
      .then((m) => setMessages(m.default))
      .catch((err) => console.error('Failed to load messages:', err))
  }, [locale])

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <AuthProvider>
        <CreditsProvider>
          <PricingContent />
        </CreditsProvider>
      </AuthProvider>
    </NextIntlClientProvider>
  )
}
