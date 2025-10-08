import { createClient } from '@/lib/supabase/client'

/**
 * 消费一个积分
 * @returns 是否成功消费
 */
export async function consumeCredit(): Promise<boolean> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data, error } = await supabase.rpc('consume_credit', {
    user_id: user.id
  })

  if (error) {
    console.error('消费积分失败:', error)
    return false
  }

  return data as boolean
}

/**
 * 充值积分
 * @param amount 充值数量
 * @returns 是否成功充值
 */
export async function addCredits(amount: number): Promise<boolean> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data, error } = await supabase.rpc('add_credits', {
    user_id: user.id,
    amount
  })

  if (error) {
    console.error('充值积分失败:', error)
    return false
  }

  return data as boolean
}

/**
 * 获取当前用户的积分
 */
export async function getUserCredits(): Promise<number | null> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('user_profiles')
    .select('credits')
    .eq('id', user.id)
    .single()

  if (error) {
    console.error('获取积分失败:', error)
    return null
  }

  return data?.credits ?? null
}
