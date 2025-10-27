/**
 * 客户端国际化 Provider
 * 只用于需要翻译的客户端组件
 */
'use client';

import { NextIntlClientProvider } from 'next-intl';
import { ReactNode } from 'react';

interface ClientIntlProviderProps {
  messages: any;
  locale: string;
  children: ReactNode;
}

export function ClientIntlProvider({ messages, locale, children }: ClientIntlProviderProps) {
  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      {children}
    </NextIntlClientProvider>
  );
}
