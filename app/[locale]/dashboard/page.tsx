import { getMessages } from 'next-intl/server'
import { NextIntlClientProvider } from 'next-intl'
import { AuthProvider } from '@/lib/auth'
import { CreditsProvider } from '@/contexts/CreditsContext'
import { VideoProcessor } from '@/components/video'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import DashboardFooter from '@/components/dashboard/DashboardFooter'

export default async function DashboardPage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  // 服务端加载翻译文件
  const messages = await getMessages({ locale })

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <AuthProvider>
        <CreditsProvider>
          <main className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-gray-100 flex flex-col">
            <div className="flex-1 flex flex-col">
              {/* 主标题区域 */}
              <DashboardHeader />

              {/* 视频处理区域 */}
              <div className="flex-1 px-4 pb-12">
                <VideoProcessor />
              </div>
            </div>

            {/* 底部免责声明 */}
            <DashboardFooter />
          </main>
        </CreditsProvider>
      </AuthProvider>
    </NextIntlClientProvider>
  )
}
