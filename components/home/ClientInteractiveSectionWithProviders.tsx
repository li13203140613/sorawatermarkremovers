/**
 * 客户端交互区域（包含 Providers）
 *
 * 这是一个独立的客户端岛屿，包含：
 * - NextIntlClientProvider (next-intl 需要)
 * - AuthProvider (GoogleOneTap 需要)
 * - CreditsProvider (CreditsDisplay 需要)
 * - 所有交互式组件
 */
'use client';

import { NextIntlClientProvider } from 'next-intl';
import { AuthProvider } from '@/lib/auth';
import { CreditsProvider } from '@/contexts/CreditsContext';
import ClientInteractiveSection from './ClientInteractiveSection';

interface ClientInteractiveSectionWithProvidersProps {
  locale: string;
  messages: any;
}

export default function ClientInteractiveSectionWithProviders({
  locale,
  messages
}: ClientInteractiveSectionWithProvidersProps) {
  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
      timeZone="Asia/Shanghai"
    >
      <AuthProvider>
        <CreditsProvider>
          <ClientInteractiveSection />
        </CreditsProvider>
      </AuthProvider>
    </NextIntlClientProvider>
  );
}
