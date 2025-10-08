import { UserProfile } from '@/components/auth'
import { VideoProcessor } from '@/components/video'
import { PaymentPackages } from '@/components/payment'
import { useTranslations } from 'next-intl'

export default function DashboardPage() {
  const t = useTranslations('dashboard')

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">{t('title')}</h1>

        <UserProfile />

        <VideoProcessor />

        <PaymentPackages />
      </div>
    </main>
  )
}
