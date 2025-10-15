import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createCheckoutSession } from './stripe'
import {
  CREDITS_PER_DOLLAR,
  CREDITS_PER_YUAN,
  MIN_AMOUNT_USD,
  MIN_AMOUNT_CNY
} from './types'

/**
 * 验证充值金额
 */
export function validateAmount(amount: number, currency: 'usd' | 'cny' = 'usd'): boolean {
  const minAmount = currency === 'cny' ? MIN_AMOUNT_CNY : MIN_AMOUNT_USD
  return amount >= minAmount && Number.isInteger(amount)
}

/**
 * 计算积分数量
 */
export function calculateCredits(amount: number, currency: 'usd' | 'cny' = 'usd'): number {
  return currency === 'cny'
    ? amount * CREDITS_PER_YUAN
    : amount * CREDITS_PER_DOLLAR
}

/**
 * 创建支付会话
 */
export async function createPaymentSession(
  amount: number,
  userId: string,
  currency: 'usd' | 'cny' = 'usd',
  locale: string = 'en'
): Promise<{ success: boolean; sessionId?: string; url?: string; error?: string }> {
  // 验证金额
  if (!validateAmount(amount, currency)) {
    const minAmount = currency === 'cny' ? MIN_AMOUNT_CNY : MIN_AMOUNT_USD
    const currencyText = currency === 'cny' ? '元' : '美元'
    return {
      success: false,
      error: `充值金额必须为整数，最低 ${minAmount} ${currencyText}`,
    }
  }

  const credits = calculateCredits(amount, currency)

  try {
    // 创建 Stripe Checkout Session
    let sessionId: string
    let url: string

    try {
      const session = await createCheckoutSession(amount, credits, userId, currency, locale)
      sessionId = session.id
      url = session.url
      console.log('[Payment] Stripe session created:', sessionId)
    } catch (stripeError) {
      console.error('[Payment] Stripe session creation failed:', stripeError)
      return {
        success: false,
        error: 'Stripe 会话创建失败',
      }
    }

    // 使用管理员客户端创建支付记录，确保能写入
    const adminClient = createAdminClient()
    console.log('[Payment] Using admin client to create payment record')

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

    if (dbError) {
      console.error('[Payment] Database insert error:', {
        error: dbError,
        code: dbError.code,
        message: dbError.message,
        details: dbError.details,
      })
      return {
        success: false,
        error: `创建支付记录失败: ${dbError.message}`,
      }
    }

    if (!payment) {
      console.error('[Payment] No payment data returned')
      return {
        success: false,
        error: '创建支付记录失败: 未返回数据',
      }
    }

    console.log('[Payment] Payment record created successfully:', payment.id)

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
