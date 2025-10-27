/**
 * 导航栏岛屿组件
 *
 * 这是一个完全独立的客户端"岛屿"，包含：
 * - AuthProvider (用户认证状态)
 * - CreditsProvider (积分状态)
 * - NextIntlClientProvider (国际化)
 * - NavBar (导航栏UI)
 *
 * 设计目的：
 * - 不影响主内容区域的服务端渲染
 * - 所有客户端逻辑封装在这个岛屿内
 */
'use client';

import { useState, useEffect } from 'react';
import { AuthProvider } from '@/lib/auth';
import { CreditsProvider } from '@/contexts/CreditsContext';
import { NextIntlClientProvider } from 'next-intl';
import { NavBar } from './NavBar';

interface NavBarIslandProps {
  locale: string;
  initialMessages?: any;
}

export function NavBarIsland({ locale, initialMessages }: NavBarIslandProps) {
  const [messages, setMessages] = useState(initialMessages || {});

  useEffect(() => {
    // 如果没有初始messages，动态加载
    if (!initialMessages) {
      import(`@/messages/${locale}.json`)
        .then(m => setMessages(m.default))
        .catch(err => console.error('Failed to load messages:', err));
    }
  }, [locale, initialMessages]);

  return (
    <AuthProvider>
      <CreditsProvider>
        <NextIntlClientProvider
          messages={messages}
          locale={locale}
          timeZone="Asia/Shanghai"
        >
          <NavBar />
        </NextIntlClientProvider>
      </CreditsProvider>
    </AuthProvider>
  );
}
