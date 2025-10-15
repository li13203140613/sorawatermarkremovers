import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createPaymentSession } from '@/lib/payment/service'

export async function POST(request: NextRequest) {
  try {
    // 验证用户身份
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    // 获取请求参数
    const { amount, currency = 'usd', locale = 'en' } = await request.json()

    if (!amount || typeof amount !== 'number') {
      return NextResponse.json({ error: '无效的金额' }, { status: 400 })
    }

    if (!['usd', 'cny'].includes(currency)) {
      return NextResponse.json({ error: '无效的货币类型' }, { status: 400 })
    }

    // 创建支付会话
    const result = await createPaymentSession(amount, user.id, currency, locale)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({
      sessionId: result.sessionId,
      url: result.url
    })
  } catch (error) {
    console.error('创建支付会话失败:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}
