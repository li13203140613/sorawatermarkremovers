import { createClient } from '@supabase/supabase-js'

// 管理员客户端，绕过 RLS 策略
// 仅用于服务器端操作，如 webhook 处理
export function createAdminClient() {
  // 注意：服务角色密钥具有完全权限，绕过所有 RLS 策略
  // 只能在服务器端使用，永远不要暴露到客户端
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}
