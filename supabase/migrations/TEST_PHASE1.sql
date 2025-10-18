-- ============================================
-- 阶段1测试SQL - 数据库架构验证
-- 使用方法：在执行完 20250116000000_add_subscriptions.sql 后
-- 在 Supabase SQL Editor 中逐步运行以下SQL来验证
-- ============================================

-- ====================================
-- 测试1：验证 subscriptions 表结构
-- ====================================
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'subscriptions'
ORDER BY ordinal_position;

-- 预期结果：应该看到所有字段
-- id, user_id, plan_type, billing_cycle, status,
-- stripe_subscription_id, stripe_customer_id, stripe_price_id,
-- current_period_start, current_period_end, cancel_at_period_end,
-- cancelled_at, monthly_credits, credits_used_this_period,
-- credits_reset_at, created_at, updated_at

-- ====================================
-- 测试2：验证 user_profiles 新字段
-- ====================================
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'user_profiles'
  AND column_name IN ('subscription_id', 'plan_tier', 'subscription_credits', 'credits_reset_at')
ORDER BY ordinal_position;

-- 预期结果：应该看到4个新字段
-- subscription_id (uuid)
-- plan_tier (text, default 'free')
-- subscription_credits (integer, default 0)
-- credits_reset_at (timestamp with time zone)

-- ====================================
-- 测试3：验证 payment_records 新字段
-- ====================================
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'payment_records'
  AND column_name IN ('payment_type', 'plan_type', 'billing_cycle', 'subscription_id')
ORDER BY ordinal_position;

-- 预期结果：应该看到4个新字段
-- payment_type (text, default 'onetime')
-- plan_type (text)
-- billing_cycle (text)
-- subscription_id (uuid)

-- ====================================
-- 测试4：验证索引创建
-- ====================================
SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('subscriptions', 'user_profiles', 'payment_records')
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- 预期结果：应该看到以下索引
-- subscriptions表的5个索引
-- user_profiles表的2个新索引
-- payment_records表的2个新索引

-- ====================================
-- 测试5：验证 RLS 策略
-- ====================================
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'subscriptions'
ORDER BY policyname;

-- 预期结果：应该看到4个策略
-- Users can view own subscriptions
-- Users can insert own subscriptions
-- Users can update own subscriptions
-- Service role has full access to subscriptions

-- ====================================
-- 测试6：验证表约束
-- ====================================
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  tc.constraint_type,
  cc.check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.check_constraints cc
  ON tc.constraint_name = cc.constraint_name
WHERE tc.table_schema = 'public'
  AND tc.table_name IN ('subscriptions', 'user_profiles', 'payment_records')
  AND tc.constraint_type IN ('CHECK', 'FOREIGN KEY')
ORDER BY tc.table_name, tc.constraint_type, tc.constraint_name;

-- 预期结果：应该看到所有 CHECK 约束和外键约束

-- ====================================
-- 测试7：插入测试订阅数据（需要真实用户ID）
-- ====================================
-- 注意：先查询一个真实的用户ID
SELECT id, email FROM auth.users LIMIT 1;

-- 使用上面查到的用户ID替换下面的 'YOUR_USER_ID'
DO $$
DECLARE
  test_user_id UUID;
BEGIN
  -- 获取第一个用户ID（如果有）
  SELECT id INTO test_user_id FROM auth.users LIMIT 1;

  IF test_user_id IS NOT NULL THEN
    -- 插入测试订阅
    INSERT INTO public.subscriptions (
      user_id,
      plan_type,
      billing_cycle,
      status,
      stripe_subscription_id,
      stripe_customer_id,
      stripe_price_id,
      current_period_start,
      current_period_end,
      monthly_credits
    ) VALUES (
      test_user_id,
      'premium',
      'monthly',
      'active',
      'sub_test_phase1_' || gen_random_uuid()::text,
      'cus_test_phase1',
      'price_test',
      NOW(),
      NOW() + INTERVAL '1 month',
      2000
    )
    RETURNING id, user_id, plan_type, status, monthly_credits;

    RAISE NOTICE '测试订阅插入成功！';
  ELSE
    RAISE NOTICE '没有找到用户，请先创建用户';
  END IF;
END $$;

-- ====================================
-- 测试8：验证插入的数据
-- ====================================
SELECT
  id,
  user_id,
  plan_type,
  billing_cycle,
  status,
  monthly_credits,
  stripe_subscription_id,
  current_period_start,
  current_period_end
FROM public.subscriptions
WHERE stripe_subscription_id LIKE 'sub_test_phase1_%'
ORDER BY created_at DESC
LIMIT 1;

-- 预期结果：应该看到刚插入的测试数据

-- ====================================
-- 测试9：验证外键关联
-- ====================================
-- 更新 user_profiles，关联测试订阅
DO $$
DECLARE
  test_subscription_id UUID;
  test_user_id UUID;
BEGIN
  -- 获取测试订阅
  SELECT id, user_id INTO test_subscription_id, test_user_id
  FROM public.subscriptions
  WHERE stripe_subscription_id LIKE 'sub_test_phase1_%'
  ORDER BY created_at DESC
  LIMIT 1;

  IF test_subscription_id IS NOT NULL THEN
    -- 更新用户资料
    UPDATE public.user_profiles
    SET
      subscription_id = test_subscription_id,
      plan_tier = 'premium',
      subscription_credits = 2000,
      credits_reset_at = NOW() + INTERVAL '1 month'
    WHERE id = test_user_id;

    RAISE NOTICE '用户资料更新成功！';
  END IF;
END $$;

-- 验证关联
SELECT
  up.id AS user_id,
  up.email,
  up.plan_tier,
  up.subscription_credits,
  up.credits AS regular_credits,
  s.plan_type,
  s.billing_cycle,
  s.status,
  s.monthly_credits
FROM public.user_profiles up
LEFT JOIN public.subscriptions s ON up.subscription_id = s.id
WHERE s.stripe_subscription_id LIKE 'sub_test_phase1_%';

-- 预期结果：应该看到用户和订阅的关联数据

-- ====================================
-- 测试10：测试 updated_at 触发器
-- ====================================
-- 更新订阅状态
DO $$
DECLARE
  test_subscription_id UUID;
  old_updated_at TIMESTAMPTZ;
  new_updated_at TIMESTAMPTZ;
BEGIN
  -- 获取当前 updated_at
  SELECT id, updated_at INTO test_subscription_id, old_updated_at
  FROM public.subscriptions
  WHERE stripe_subscription_id LIKE 'sub_test_phase1_%'
  ORDER BY created_at DESC
  LIMIT 1;

  IF test_subscription_id IS NOT NULL THEN
    -- 等待1秒
    PERFORM pg_sleep(1);

    -- 更新订阅
    UPDATE public.subscriptions
    SET cancel_at_period_end = TRUE
    WHERE id = test_subscription_id;

    -- 获取新的 updated_at
    SELECT updated_at INTO new_updated_at
    FROM public.subscriptions
    WHERE id = test_subscription_id;

    -- 检查是否更新
    IF new_updated_at > old_updated_at THEN
      RAISE NOTICE '✓ updated_at 触发器工作正常！';
      RAISE NOTICE '旧时间: %', old_updated_at;
      RAISE NOTICE '新时间: %', new_updated_at;
    ELSE
      RAISE NOTICE '✗ updated_at 触发器未生效！';
    END IF;
  END IF;
END $$;

-- ====================================
-- 清理测试数据
-- ====================================
-- 执行完所有测试后，运行以下SQL清理测试数据

-- 先清除 user_profiles 的关联
UPDATE public.user_profiles
SET
  subscription_id = NULL,
  plan_tier = 'free',
  subscription_credits = 0,
  credits_reset_at = NULL
WHERE subscription_id IN (
  SELECT id FROM public.subscriptions
  WHERE stripe_subscription_id LIKE 'sub_test_phase1_%'
);

-- 删除测试订阅
DELETE FROM public.subscriptions
WHERE stripe_subscription_id LIKE 'sub_test_phase1_%';

-- 验证清理
SELECT COUNT(*) AS remaining_test_subscriptions
FROM public.subscriptions
WHERE stripe_subscription_id LIKE 'sub_test_phase1_%';

-- 预期结果：应该返回 0

-- ====================================
-- 测试总结
-- ====================================
-- 运行以下查询查看所有表的行数
SELECT
  'subscriptions' AS table_name,
  COUNT(*) AS row_count
FROM public.subscriptions
UNION ALL
SELECT
  'user_profiles',
  COUNT(*)
FROM public.user_profiles
WHERE subscription_id IS NOT NULL
UNION ALL
SELECT
  'payment_records (subscription type)',
  COUNT(*)
FROM public.payment_records
WHERE payment_type = 'subscription';

-- ====================================
-- 阶段1完成检查清单
-- ====================================
/*
请检查以下项目：

□ 测试1：subscriptions 表所有字段存在
□ 测试2：user_profiles 新增4个字段
□ 测试3：payment_records 新增4个字段
□ 测试4：所有索引创建成功
□ 测试5：RLS 策略正确配置
□ 测试6：CHECK 约束和外键正常
□ 测试7：可以插入测试订阅
□ 测试8：可以查询订阅数据
□ 测试9：外键关联正常工作
□ 测试10：updated_at 触发器生效

如果以上全部通过，阶段1完成！✓
可以继续进入阶段2：数据库函数
*/
