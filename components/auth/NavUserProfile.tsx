'use client'

import { useAuth } from '@/lib/auth'
import { useUserCredits } from '@/lib/auth/hooks'
import { useTranslations } from 'next-intl'

export function NavUserProfile() {
  const t = useTranslations('auth')
  const tCommon = useTranslations('common')
  const { user, signOut } = useAuth()
  const { credits, loading } = useUserCredits()

  if (!user) return null

  return (
    <div className="flex items-center gap-4">
      {/* 用户信息 */}
      <div className="flex items-center gap-3">
        {/* 用户头像 */}
        {user.user_metadata?.avatar_url ? (
          <img
            src={user.user_metadata.avatar_url}
            alt="User avatar"
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-semibold">
            {user.email?.[0]?.toUpperCase()}
          </div>
        )}

        {/* 用户邮箱和积分 */}
        <div className="hidden md:flex flex-col">
          <span className="text-sm font-medium text-gray-700">
            {user.email?.split('@')[0]}
          </span>
          <span className="text-xs text-gray-500">
            {tCommon('credits')}: {loading ? '...' : credits ?? 0}
          </span>
        </div>
      </div>

      {/* 退出登录按钮 */}
      <button
        onClick={() => signOut()}
        className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
      >
        {t('signOut')}
      </button>
    </div>
  )
}
