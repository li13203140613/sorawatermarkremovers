# 📋 执行数据库迁移 - 快速指南

## 🚀 方法一：Supabase Dashboard（推荐 ✅）

### 步骤 1：打开 SQL Editor

浏览器应该已自动打开。如果没有，请访问：

```
https://supabase.com/dashboard/project/zjefhzapfbouslkgllah/sql/new
```

### 步骤 2：复制下面的 SQL 并粘贴到 SQL Editor

```sql
-- 添加 action_type 字段到 usage_logs 表
-- 用于区分不同类型的操作

-- 添加操作类型字段
ALTER TABLE usage_logs
ADD COLUMN IF NOT EXISTS action_type TEXT
CHECK (action_type IN ('watermark_removal', 'video_generation', 'prompt_generation'))
DEFAULT 'watermark_removal';

-- 更新现有数据（将所有现有记录标记为去水印操作）
UPDATE usage_logs
SET action_type = 'watermark_removal'
WHERE action_type IS NULL;

-- 设置为非空
ALTER TABLE usage_logs
ALTER COLUMN action_type SET NOT NULL;

-- 创建索引以提升查询性能
CREATE INDEX IF NOT EXISTS idx_usage_logs_action_type ON usage_logs(action_type);

-- 添加注释
COMMENT ON COLUMN usage_logs.action_type IS '操作类型: watermark_removal(去水印), video_generation(视频生成), prompt_generation(提示词生成)';

-- 创建会话记录表（用于统计登录访客）
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,
  session_started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_ended_at TIMESTAMP WITH TIME ZONE,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_started_at ON user_sessions(session_started_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_email ON user_sessions(user_email);

-- 启用 RLS
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- 只有管理员可以查询所有会话
CREATE POLICY "Admin can view all sessions" ON user_sessions
  FOR SELECT
  USING (auth.role() = 'service_role');

-- 允许服务端插入会话记录
CREATE POLICY "Service can insert sessions" ON user_sessions
  FOR INSERT
  WITH CHECK (true);

-- 添加注释
COMMENT ON TABLE user_sessions IS '用户会话记录表，用于统计登录访客';
COMMENT ON COLUMN user_sessions.user_id IS '用户 ID';
COMMENT ON COLUMN user_sessions.user_email IS '用户邮箱';
COMMENT ON COLUMN user_sessions.session_started_at IS '会话开始时间';
COMMENT ON COLUMN user_sessions.session_ended_at IS '会话结束时间';
COMMENT ON COLUMN user_sessions.ip_address IS 'IP 地址';
COMMENT ON COLUMN user_sessions.user_agent IS '用户代理';
```

### 步骤 3：点击 "Run" 按钮

点击右下角的绿色 "Run" 按钮执行 SQL。

### 步骤 4：验证执行成功

执行成功后，你应该看到类似的消息：
```
Success. No rows returned
```

---

## 🔍 验证迁移是否成功

在 SQL Editor 中执行以下查询：

```sql
-- 检查 usage_logs 表是否有 action_type 字段
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'usage_logs' AND column_name = 'action_type';

-- 检查 user_sessions 表是否存在
SELECT table_name, table_type
FROM information_schema.tables
WHERE table_name = 'user_sessions';

-- 查看 user_sessions 表结构
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'user_sessions'
ORDER BY ordinal_position;
```

如果返回了数据，说明迁移成功！

---

## ✅ 完成后的下一步

1. **访问统计页面**
   ```
   http://localhost:3000/admin/analytics
   ```

2. **开始记录数据**
   - 需要在相应的 API 端点添加日志记录代码
   - 详见 [ANALYTICS_SETUP_GUIDE.md](./ANALYTICS_SETUP_GUIDE.md)

---

## 🆘 遇到问题？

### 问题 1：找不到 usage_logs 表

**解决方案**: 先执行之前的迁移脚本创建 `usage_logs` 表：
```sql
-- 在 SQL Editor 中查找并执行
supabase/migrations/create_usage_logs.sql
```

### 问题 2：权限不足

**解决方案**: 确保你已用管理员账号登录 Supabase Dashboard

### 问题 3：SQL 执行失败

**解决方案**:
1. 检查是否有语法错误
2. 尝试逐条执行 SQL 语句
3. 查看错误消息并根据提示修正

---

## 📚 相关文档

- [完整设置指南](./ANALYTICS_SETUP_GUIDE.md)
- [实现总结](./ANALYTICS_IMPLEMENTATION_SUMMARY.md)
- [项目文档](./CLAUDE.md)

---

**准备好了吗？** 现在就打开 SQL Editor 并粘贴 SQL 吧！ 🚀
