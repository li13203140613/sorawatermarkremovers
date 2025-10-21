'use client'

import { AuthProvider } from '@/lib/auth'
import { CreditsProvider } from '@/contexts/CreditsContext'
import { NavBar } from './NavBar'

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CreditsProvider>
        {children}
      </CreditsProvider>
    </AuthProvider>
  )
}

export function ClientNavBar() {
  return <NavBar />
}

// 完整的客户端布局包装器
export function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ClientProviders>
      <div className="min-h-screen flex flex-col">
        <ClientNavBar />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </ClientProviders>
  )
}
