import { NextRequest, NextResponse } from 'next/server'
import { constructWebhookEvent } from '@/lib/payment/stripe'
import { completePayment } from '@/lib/payment/service'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: '缺少签名' }, { status: 400 })
  }

  try {
    // 验证 webhook 签名
    const event = constructWebhookEvent(body, signature)

    // 处理支付成功事件
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any

      // 完成支付并充值积分
      const result = await completePayment(session.id)

      if (!result.success) {
        console.error('完成支付失败:', result.error)
        return NextResponse.json({ error: result.error }, { status: 500 })
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook 处理失败:', error)
    return NextResponse.json(
      { error: 'Webhook 处理失败' },
      { status: 400 }
    )
  }
}
