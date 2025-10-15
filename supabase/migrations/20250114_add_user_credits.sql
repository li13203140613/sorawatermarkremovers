-- 添加用户积分记录
-- 注意：需要先找到用户的 ID

-- 方法1：如果知道用户 ID（从 OAuth 登录的日志中获取）
-- INSERT INTO public.user_profiles (id, email, credits, full_name)
-- VALUES (
--   'f9b40718-e4f9-439f-a656-f5af9b669907',  -- 替换为实际的用户 ID
--   'lixiaofei160@gmail.com',
--   10,
--   '李李李'
-- )
-- ON CONFLICT (id)
-- DO UPDATE SET credits = 10;

-- 方法2：查询并插入（如果 auth.users 表中有记录）
DO $$
DECLARE
  user_id UUID;
BEGIN
  -- 查找用户 ID
  SELECT id INTO user_id
  FROM auth.users
  WHERE email = 'lixiaofei160@gmail.com'
  LIMIT 1;

  -- 如果找到用户，插入或更新记录
  IF user_id IS NOT NULL THEN
    INSERT INTO public.user_profiles (id, email, credits, full_name)
    VALUES (user_id, 'lixiaofei160@gmail.com', 10, '李李李')
    ON CONFLICT (id)
    DO UPDATE SET
      credits = 10,
      updated_at = NOW();

    RAISE NOTICE '✅ 用户积分记录已创建/更新: %', user_id;
  ELSE
    RAISE NOTICE '⚠️ 未找到用户: lixiaofei160@gmail.com';
  END IF;
END $$;