import Stripe from 'stripe'

// 初始化 Stripe（服务器端）
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

/**
 * 创建 Stripe Checkout Session
 */
export async function createCheckoutSession(
  amount: number,
  credits: number,
  userId: string
): Promise<{ id: string; url: string }> {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${credits} 积分`,
            description: `充值 ${credits} 个积分`,
          },
          unit_amount: Math.round(amount * 100), // 转换为分
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`,
    metadata: {
      userId,
      credits: credits.toString(),
      amount: amount.toString(),
    },
  })

  return {
    id: session.id,
    url: session.url!,
  }
}

/**
 * 获取 Checkout Session 详情
 */
export async function getCheckoutSession(sessionId: string) {
  return await stripe.checkout.sessions.retrieve(sessionId)
}

/**
 * 验证 Webhook 签名
 */
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  )
}
