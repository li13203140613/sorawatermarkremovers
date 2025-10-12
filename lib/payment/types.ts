export interface PaymentPackage {
  amount: number // 美元金额
  credits: number // 对应积分
  label: string // 显示标签
  popular?: boolean // 是否热门
  cnyAmount: number // 人民币金额（用于微信支付）
}

export interface CreateCheckoutSessionRequest {
  amount: number // 美元金额
  credits: number // 对应积分
}

export interface PaymentRecord {
  id: string
  user_id: string
  amount: number
  credits: number
  stripe_session_id: string
  status: 'pending' | 'completed' | 'failed'
  created_at: string
  completed_at: string | null
}

export const PAYMENT_PACKAGES: PaymentPackage[] = [
  {
    amount: 1,
    credits: 10,
    label: 'starter',
    cnyAmount: 7,
  },
  {
    amount: 5,
    credits: 50,
    label: 'standard',
    popular: true,
    cnyAmount: 35,
  },
  {
    amount: 10,
    credits: 100,
    label: 'premium',
    cnyAmount: 70,
  },
]

// 汇率：1美元 = 10积分
export const CREDITS_PER_DOLLAR = 10
export const MIN_AMOUNT = 1 // 最低充值金额（美元）
