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
