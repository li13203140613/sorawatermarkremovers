import type { Metadata } from 'next'
import '@/app/globals.css'

export const metadata: Metadata = {
  title: '管理后台 - RemoveWM Admin',
  description: 'RemoveWM 管理后台',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
