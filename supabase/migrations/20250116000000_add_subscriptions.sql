-- ============================================
-- 订阅系统数据库迁移
-- 版本: 2.0
-- 日期: 2025-01-16
-- ============================================

-- 第一步：创建订阅表
-- ============================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,

  -- 订阅计划信息
  plan_type TEXT NOT NULL CHECK (plan_type IN ('starter', 'premium', 'advanced')),
  billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'annual')),

  -- 订阅状态
  status TEXT NOT NULL CHECK (status IN ('active', 'cancelled', 'past_due', 'paused', 'trialing')),

  -- Stripe 关联信息
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  stripe_price_id TEXT,

  -- 计费周期
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  cancelled_at TIMESTAMPTZ,

  -- 积分配置
  monthly_credits INTEGER NOT NULL,
  credits_used_this_period INTEGER DEFAULT 0,
  credits_reset_at TIMESTAMPTZ,

  -- 时间戳
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 订阅表注释
COMMENT ON TABLE public.subscriptions IS '用户订阅记录表';
COMMENT ON COLUMN public.subscriptions.plan_type IS '订阅套餐类型：starter/premium/advanced';
COMMENT ON COLUMN public.subscriptions.billing_cycle IS '计费周期：monthly/annual';
COMMENT ON COLUMN public.subscriptions.status IS '订阅状态：active/cancelled/past_due/paused/trialing';
COMMENT ON COLUMN public.subscriptions.cancel_at_period_end IS '是否在周期结束时取消';
COMMENT ON COLUMN public.subscriptions.credits_used_this_period IS '当前周期已使用积分数';

-- 第二步：为 user_profiles 添加订阅字段
-- ============================================
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL;

ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS plan_tier TEXT DEFAULT 'free' CHECK (plan_tier IN ('free', 'starter', 'premium', 'advanced'));

ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS subscription_credits INTEGER DEFAULT 0 NOT NULL;

ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS credits_reset_at TIMESTAMPTZ;

-- user_profiles 字段注释
COMMENT ON COLUMN public.user_profiles.subscription_id IS '关联的订阅ID';
COMMENT ON COLUMN public.user_profiles.plan_tier IS '用户套餐等级：free/starter/premium/advanced';
COMMENT ON COLUMN public.user_profiles.subscription_credits IS '订阅积分余额（每月重置）';
COMMENT ON COLUMN public.user_profiles.credits_reset_at IS '积分下次重置时间';

-- 第三步：更新 payment_records 表
-- ============================================
ALTER TABLE public.payment_records
  ADD COLUMN IF NOT EXISTS payment_type TEXT DEFAULT 'onetime' CHECK (payment_type IN ('onetime', 'subscription'));

ALTER TABLE public.payment_records
  ADD COLUMN IF NOT EXISTS plan_type TEXT;

ALTER TABLE public.payment_records
  ADD COLUMN IF NOT EXISTS billing_cycle TEXT CHECK (billing_cycle IN ('monthly', 'annual'));

ALTER TABLE public.payment_records
  ADD COLUMN IF NOT EXISTS subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL;

-- payment_records 字段注释
COMMENT ON COLUMN public.payment_records.payment_type IS '支付类型：onetime一次性/subscription订阅';
COMMENT ON COLUMN public.payment_records.plan_type IS '套餐类型（订阅支付时填写）';
COMMENT ON COLUMN public.payment_records.billing_cycle IS '计费周期（订阅支付时填写）';
COMMENT ON COLUMN public.payment_records.subscription_id IS '关联的订阅ID（订阅支付时填写）';

-- 第四步：创建索引
-- ============================================
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON public.subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON public.subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_current_period_end ON public.subscriptions(current_period_end);

CREATE INDEX IF NOT EXISTS idx_user_profiles_subscription_id ON public.user_profiles(subscription_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_plan_tier ON public.user_profiles(plan_tier);

CREATE INDEX IF NOT EXISTS idx_payment_records_payment_type ON public.payment_records(payment_type);
CREATE INDEX IF NOT EXISTS idx_payment_records_subscription_id ON public.payment_records(subscription_id);

-- 第五步：启用 RLS（行级安全）
-- ============================================
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- 用户只能查看自己的订阅
CREATE POLICY "Users can view own subscriptions"
  ON public.subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- 用户可以插入自己的订阅（由 API 控制）
CREATE POLICY "Users can insert own subscriptions"
  ON public.subscriptions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 用户可以更新自己的订阅（由 API 控制）
CREATE POLICY "Users can update own subscriptions"
  ON public.subscriptions
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Service role 可以完全访问（用于 webhook）
CREATE POLICY "Service role has full access to subscriptions"
  ON public.subscriptions
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- 第六步：添加 updated_at 触发器
-- ============================================
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 第七步：更新现有 payment_records RLS 策略以支持 service role
-- ============================================
DROP POLICY IF EXISTS "Service role has full access to payments" ON public.payment_records;

CREATE POLICY "Service role has full access to payments"
  ON public.payment_records
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');
