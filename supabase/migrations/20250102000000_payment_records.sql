-- 创建支付记录表
CREATE TABLE IF NOT EXISTS public.payment_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  credits INTEGER NOT NULL,
  stripe_session_id TEXT,
  status TEXT DEFAULT 'pending' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMPTZ
);

-- 启用行级安全策略
ALTER TABLE public.payment_records ENABLE ROW LEVEL SECURITY;

-- 用户只能查看自己的支付记录
CREATE POLICY "Users can view own payment records"
  ON public.payment_records
  FOR SELECT
  USING (auth.uid() = user_id);

-- 用户可以插入自己的支付记录（由 API 控制）
CREATE POLICY "Users can insert own payment records"
  ON public.payment_records
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 用户可以更新自己的支付记录（由 API 控制）
CREATE POLICY "Users can update own payment records"
  ON public.payment_records
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_payment_records_user_id ON public.payment_records(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_stripe_session_id ON public.payment_records(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_status ON public.payment_records(status);
