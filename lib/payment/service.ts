import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createCheckoutSession } from './stripe'
import { CREDITS_PER_DOLLAR, MIN_AMOUNT } from './types'

/**
 * 验证充值金额
 */
export function validateAmount(amount: number): boolean {
  return amount >= MIN_AMOUNT && Number.isInteger(amount)
}

/**
 * 计算积分数量
 */
export function calculateCredits(amount: number): number {
  return amount * CREDITS_PER_DOLLAR
}

/**
 * 创建支付会话
 */
export async function createPaymentSession(
  amount: number,
  userId: string
): Promise<{ success: boolean; sessionId?: string; url?: string; error?: string }> {
  // 验证金额
  if (!validateAmount(amount)) {
    return {
      success: false,
      error: `充值金额必须为整数，最低 ${MIN_AMOUNT} 美元`,
    }
  }

  const credits = calculateCredits(amount)

  try {
    // 创建 Stripe Checkout Session
    const { id: sessionId, url } = await createCheckoutSession(amount, credits, userId)

    // 使用管理员客户端创建支付记录，确保能写入
    const adminClient = createAdminClient()
    const { data: payment, error: dbError } = await adminClient
      .from('payment_records')
      .insert({
        user_id: userId,
        amount,
        credits,
        status: 'pending',
        stripe_session_id: sessionId,
      })
      .select()
      .single()

    if (dbError || !payment) {
      console.error('创建支付记录失败:', dbError)
      return {
        success: false,
        error: '创建支付记录失败',
      }
    }

    return {
      success: true,
      sessionId,
      url,
    }
  } catch (error) {
    console.error('创建支付会话失败:', error)
    return {
      success: false,
      error: '创建支付会话失败',
    }
  }
}

/**
 * 完成支付并充值积分
 */
export async function completePayment(
  sessionId: string
): Promise<{ success: boolean; error?: string }> {
  // 使用管理员客户端，因为 webhook 调用时没有用户 session
  const supabase = createAdminClient()

  try {
    // 查找支付记录
    const { data: payment, error: findError } = await supabase
      .from('payment_records')
      .select('*')
      .eq('stripe_session_id', sessionId)
      .single()

    if (findError || !payment) {
      console.error('支付记录不存在:', findError)
      return {
        success: false,
        error: '支付记录不存在',
      }
    }

    // 如果已经完成，直接返回
    if (payment.status === 'completed') {
      return { success: true }
    }

    // 充值积分
    const { error: creditError } = await supabase.rpc('add_credits', {
      user_id: payment.user_id,
      amount: payment.credits,
    })

    if (creditError) {
      console.error('充值积分失败:', creditError)
      return {
        success: false,
        error: '充值积分失败',
      }
    }

    // 更新支付记录状态
    await supabase
      .from('payment_records')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', payment.id)

    return { success: true }
  } catch (error) {
    console.error('完成支付失败:', error)
    return {
      success: false,
      error: '完成支付失败',
    }
  }
}
