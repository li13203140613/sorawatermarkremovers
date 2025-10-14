-- 验证 usage_logs 表是否创建成功

-- 1. 查看表结构
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'usage_logs'
ORDER BY ordinal_position;

-- 2. 查看索引
SELECT
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'usage_logs';

-- 3. 查看 RLS 策略
SELECT
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'usage_logs';

-- 4. 测试插入一条数据（可选）
-- INSERT INTO usage_logs (
--     user_email,
--     original_url,
--     status
-- ) VALUES (
--     'test@example.com',
--     'https://example.com/video',
--     'success'
-- );

-- 5. 查询数据（验证表可用）
SELECT COUNT(*) as total_logs FROM usage_logs;
