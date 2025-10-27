'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { NextIntlClientProvider } from 'next-intl'
import { AuthProvider } from '@/lib/auth'
import { AuthForm, GoogleOneTap } from '@/components/auth'

export default function LoginPage() {
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
        <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100">
          {/* Google One Tap - 右上角自动弹出 */}
          <GoogleOneTap />

          {/* 传统登录表单 - 作为备选方案 */}
          <AuthForm />
        </main>
      </AuthProvider>
    </NextIntlClientProvider>
  )
}
