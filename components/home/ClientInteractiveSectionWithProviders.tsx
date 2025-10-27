/**
 * 客户端交互区域（包含 Providers）
 *
 * 这是一个独立的客户端岛屿，包含：
 * - AuthProvider (GoogleOneTap 需要)
 * - CreditsProvider (CreditsDisplay 需要)
 * - 所有交互式组件
 */
'use client';

import { AuthProvider } from '@/lib/auth';
import { CreditsProvider } from '@/contexts/CreditsContext';
import ClientInteractiveSection from './ClientInteractiveSection';

export default function ClientInteractiveSectionWithProviders() {
  return (
    <AuthProvider>
      <CreditsProvider>
        <ClientInteractiveSection />
      </CreditsProvider>
    </AuthProvider>
  );
}
