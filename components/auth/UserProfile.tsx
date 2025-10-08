'use client'

import { useAuth } from '@/lib/auth'
import { useUserCredits } from '@/lib/auth/hooks'

export function UserProfile() {
  const { user, signOut } = useAuth()
  const { credits, loading } = useUserCredits()

  if (!user) return null

  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow">
      <div className="flex-1">
        <p className="text-sm text-gray-600">用户</p>
        <p className="font-medium">{user.email}</p>
      </div>

      <div className="text-center px-4 border-l">
        <p className="text-sm text-gray-600">积分</p>
        <p className="text-xl font-bold text-blue-600">
          {loading ? '...' : credits ?? 0}
        </p>
      </div>

      <button
        onClick={() => signOut()}
        className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
      >
        退出
      </button>
    </div>
  )
}
