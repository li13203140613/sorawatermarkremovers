export interface PaymentPackage {
  amountUSD: number // 美元金额
  amountCNY: number // 人民币金额
  credits: number // 美元对应积分
  creditsCNY: number // 人民币对应积分
  label: string // 显示标签
  popular?: boolean // 是否热门
  // 美元套餐使用次数
  usageUSD: {
    watermark: number // 去水印次数
    generate: number // 生成视频次数
    premium: number // 无水印生成次数
  }
  // 人民币套餐使用次数
  usageCNY: {
    watermark: number // 去水印次数
    generate: number // 生成视频次数
    premium: number // 无水印生成次数
  }
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
    usageUSD: {
      watermark: 30, // 30积分 = 去水印30次
      generate: 30, // 30积分 = 生成30次
      premium: 15, // 30积分 = 无水印生成15次
    },
    usageCNY: {
      watermark: 10, // 10积分 = 去水印10次
      generate: 10, // 10积分 = 生成10次
      premium: 5, // 10积分 = 无水印生成5次
    },
  },
  {
    amountUSD: 50,
    amountCNY: 50,
    credits: 400,
    creditsCNY: 70,
    label: 'standard',
    popular: true,
    usageUSD: {
      watermark: 400, // 400积分 = 去水印400次
      generate: 400, // 400积分 = 生成400次
      premium: 200, // 400积分 = 无水印生成200次
    },
    usageCNY: {
      watermark: 70, // 70积分 = 去水印70次
      generate: 70, // 70积分 = 生成70次
      premium: 35, // 70积分 = 无水印生成35次
    },
  },
  {
    amountUSD: 100,
    amountCNY: 100,
    credits: 1000,
    creditsCNY: 200,
    label: 'premium',
    usageUSD: {
      watermark: 1000, // 1000积分 = 去水印1000次
      generate: 1000, // 1000积分 = 生成1000次
      premium: 500, // 1000积分 = 无水印生成500次
    },
    usageCNY: {
      watermark: 200, // 200积分 = 去水印200次
      generate: 200, // 200积分 = 生成200次
      premium: 100, // 200积分 = 无水印生成100次
    },
  },
]

// 汇率配置（已废弃，保留用于向后兼容）
/** @deprecated 直接使用套餐配置中的 credits 字段 */
export const CREDITS_PER_DOLLAR = 3 // 美元：10美元 = 30积分
/** @deprecated 直接使用套餐配置中的 creditsCNY 字段 */
export const CREDITS_PER_YUAN = 1 // 人民币：1元 = 1积分
export const MIN_AMOUNT_USD = 10 // 最低充值金额（美元）
export const MIN_AMOUNT_CNY = 10 // 最低充值金额（人民币）
