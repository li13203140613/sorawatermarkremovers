export interface PaymentPackage {
  amountUSD: number // 美元金额
  amountCNY: number // 人民币金额
  credits: number // 美元对应积分
  creditsCNY: number // 人民币对应积分
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
    amountUSD: 10,
    amountCNY: 10,
    credits: 30,
    creditsCNY: 10,
    label: 'starter',
  },
  {
    amountUSD: 50,
    amountCNY: 50,
    credits: 400,
    creditsCNY: 70,
    label: 'standard',
    popular: true,
  },
  {
    amountUSD: 100,
    amountCNY: 100,
    credits: 1000,
    creditsCNY: 200,
    label: 'premium',
  },
]

// 汇率配置（已废弃，保留用于向后兼容）
/** @deprecated 直接使用套餐配置中的 credits 字段 */
export const CREDITS_PER_DOLLAR = 3 // 美元：10美元 = 30积分
/** @deprecated 直接使用套餐配置中的 creditsCNY 字段 */
export const CREDITS_PER_YUAN = 1 // 人民币：1元 = 1积分
export const MIN_AMOUNT_USD = 10 // 最低充值金额（美元）
export const MIN_AMOUNT_CNY = 10 // 最低充值金额（人民币）
