import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // 在 Server Components 中调用时可能会失败
          }
        },
      },
    }
  )
}

/**
 * 解析 Cookie 字符串为对象
 */
function parseCookieHeader(header: string): Record<string, string> {
  const cookies: Record<string, string> = {}
  header.split(';').forEach(cookie => {
    const [name, value] = cookie.trim().split('=')
    if (name && value) {
      cookies[name] = value
    }
  })
  return cookies
}

/**
 * 为 Chrome 扩展请求创建带 Cookie 的 Supabase 客户端
 * @param cookieHeader 从请求头 'Cookie' 字段读取的字符串
 */
export function createClientWithCookie(cookieHeader: string) {
  const parsedCookies = parseCookieHeader(cookieHeader)

  // 创建自定义 cookie store
  const cookieStore = {
    getAll: () => {
      return Object.entries(parsedCookies).map(([name, value]) => ({
        name,
        value,
      }))
    },
    setAll: () => {
      // 扩展请求不需要设置 Cookie
    },
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: cookieStore,
    }
  )
}
