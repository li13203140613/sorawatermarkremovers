'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import { NavUserProfile } from '@/components/auth'
import { CreditsDisplay } from '@/components/credits/CreditsDisplay'
import LanguageSwitcher from '@/components/language/LanguageSwitcher'
import { useTranslations } from 'next-intl'
import { NavLink } from './NavLink'

export function NavBar() {
  const { user } = useAuth()
  const t = useTranslations('nav')

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl font-bold">S</span>
            </div>
            <Link href="/" className="text-xl font-semibold text-gray-900">
              Sora Tools
            </Link>
          </div>

          {/* 中间：导航链接 */}
          <div className="hidden md:flex items-center gap-6">
            <NavLink
              href="/"
              className="text-gray-700 hover:text-green-600"
              activeClassName="text-green-600 font-semibold"
            >
              {t('promptGenerator', { default: 'Prompt Generator' })}
            </NavLink>
            <NavLink
              href="/soraprompting"
              className="text-gray-700 hover:text-purple-600"
              activeClassName="text-purple-600 font-semibold"
            >
              {t('promptGallery', { default: 'Prompt Gallery' })}
            </NavLink>
            <NavLink
              href="/dashboard"
              className="text-gray-700 hover:text-indigo-600"
              activeClassName="text-indigo-600 font-semibold"
            >
              {t('removeWatermark', { default: 'Remove Watermark' })}
            </NavLink>
            <NavLink
              href="/video-generation"
              className="text-gray-700 hover:text-indigo-600"
              activeClassName="text-indigo-600 font-semibold"
            >
              {t('videoGeneration', { default: 'Video Generation' })}
            </NavLink>
            <NavLink
              href="/blog"
              className="text-gray-700 hover:text-indigo-600"
              activeClassName="text-indigo-600 font-semibold"
            >
              {t('blog', { default: 'Blog' })}
            </NavLink>
            <NavLink
              href="/pricing"
              className="text-gray-700 hover:text-indigo-600"
              activeClassName="text-indigo-600 font-semibold"
            >
              {t('pricing', { default: 'Pricing' })}
            </NavLink>
          </div>

          {/* 右侧：积分 + 语言切换 + 用户信息 */}
          <div className="flex items-center gap-4">
            {/* 积分显示（所有用户都显示，包括未登录的访客） */}
            <CreditsDisplay />

            {/* 语言切换 */}
            <LanguageSwitcher />

            {/* 用户信息（仅已登录时显示） */}
            {user && <NavUserProfile />}
          </div>
        </div>
      </div>
    </nav>
  )
}
