-- 为 payment_records 表启用 RLS 并创建安全策略
-- 此迁移文件用于生产环境部署

-- 确保 RLS 已启用
ALTER TABLE public.payment_records ENABLE ROW LEVEL SECURITY;

-- 删除旧策略（如果存在）
DROP POLICY IF EXISTS "Users can view own payment records" ON public.payment_records;
DROP POLICY IF EXISTS "Users can insert own payment records" ON public.payment_records;
DROP POLICY IF EXISTS "Users can update own payment records" ON public.payment_records;

-- 用户只能查看自己的支付记录
CREATE POLICY "Users can view own payment records"
  ON public.payment_records
  FOR SELECT
  USING (auth.uid() = user_id);

-- 允许已认证用户插入支付记录（API 会验证 user_id）
CREATE POLICY "Authenticated users can insert payment records"
  ON public.payment_records
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 服务角色可以更新任何支付记录（用于 webhook）
-- 注意：服务角色会自动绕过 RLS，这里的策略主要用于文档说明
CREATE POLICY "Service role can update payment records"
  ON public.payment_records
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 用户不能直接更新支付记录（只能由 webhook 更新）
-- 如果需要用户查看更新状态，只需 SELECT 权限即可
