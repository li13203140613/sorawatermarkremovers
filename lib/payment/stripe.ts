import Stripe from 'stripe'

// 初始化 Stripe（服务器端）
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
})

/**
 * 创建 Stripe Checkout Session
 */
export async function createCheckoutSession(
  amount: number,
  credits: number,
  userId: string,
  currency: 'usd' | 'cny' = 'usd',
  locale: string = 'en'
): Promise<{ id: string; url: string }> {
  // 根据货币类型选择支付方式
  const paymentMethodTypes = currency === 'cny'
    ? ['alipay', 'wechat_pay', 'card']
    : ['card']

  // 构建会话配置
  const sessionConfig: any = {
    payment_method_types: paymentMethodTypes,
    line_items: [
      {
        price_data: {
          currency: currency,
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
    locale: locale === 'zh' ? 'zh' : 'auto', // 设置 Stripe Checkout 页面语言
    success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`,
    metadata: {
      userId,
      credits: credits.toString(),
      amount: amount.toString(),
      currency,
    },
  }

  // 如果是人民币支付，添加微信支付配置
  if (currency === 'cny') {
    sessionConfig.payment_method_options = {
      wechat_pay: {
        client: 'web',
      },
    }
  }

  const session = await stripe.checkout.sessions.create(sessionConfig)

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
