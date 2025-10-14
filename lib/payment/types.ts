export interface PaymentPackage {
  amountUSD: number // 美元金额
  amountCNY: number // 人民币金额
  credits: number // 对应积分
  label: string // 显示标签
  popular?: boolean // 是否热门
}

export interface CreateCheckoutSessionRequest {
  amount: number // 金额
  credits: number // 对应积分
  currency: 'usd' | 'cny' // 货币类型
  locale: string // 语言环境
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
    amountUSD: 1,
    amountCNY: 10,
    credits: 10,
    label: 'starter',
  },
  {
    amountUSD: 5,
    amountCNY: 50,
    credits: 50,
    label: 'standard',
    popular: true,
  },
  {
    amountUSD: 10,
    amountCNY: 100,
    credits: 100,
    label: 'premium',
  },
]

// 汇率配置
export const CREDITS_PER_DOLLAR = 10 // 美元：1美元 = 10积分
export const CREDITS_PER_YUAN = 1 // 人民币：1元 = 1积分
export const MIN_AMOUNT_USD = 1 // 最低充值金额（美元）
export const MIN_AMOUNT_CNY = 10 // 最低充值金额（人民币）
