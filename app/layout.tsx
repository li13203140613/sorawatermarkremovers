import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import LanguageSwitcher from '@/components/language/LanguageSwitcher';

export const metadata: Metadata = {
  title: "RemoveWM - Video Watermark Removal",
  description: "Remove watermarks from videos using credits",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            <div className="min-h-screen flex flex-col">
              <nav className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex justify-between items-center h-16">
                    <div className="flex items-center">
                      <a href="/" className="text-xl font-bold text-gray-900">
                        RemoveWM
                      </a>
                    </div>
                    <div className="flex items-center gap-4">
                      <LanguageSwitcher />
                    </div>
                  </div>
                </div>
              </nav>
              <main className="flex-1">
                {children}
              </main>
            </div>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
