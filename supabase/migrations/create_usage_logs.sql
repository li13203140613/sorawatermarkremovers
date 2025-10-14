-- 创建操作日志表
CREATE TABLE IF NOT EXISTS usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,
  original_url TEXT NOT NULL,
  processed_url TEXT,
  credits_used INTEGER DEFAULT 1,
  credits_remaining INTEGER,
  status TEXT CHECK (status IN ('success', 'failed')) NOT NULL,
  error_message TEXT,
  platform TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以提升查询性能
CREATE INDEX IF NOT EXISTS idx_usage_logs_user_id ON usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_created_at ON usage_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_usage_logs_status ON usage_logs(status);
CREATE INDEX IF NOT EXISTS idx_usage_logs_user_email ON usage_logs(user_email);

-- 启用 RLS（行级安全策略）
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;

-- 只有管理员可以查询所有日志（使用 service_role 绕过 RLS）
-- 普通用户无法访问此表
CREATE POLICY "Admin can view all logs" ON usage_logs
  FOR SELECT
  USING (auth.role() = 'service_role');

-- 允许服务端插入日志
CREATE POLICY "Service can insert logs" ON usage_logs
  FOR INSERT
  WITH CHECK (true);

-- 添加注释
COMMENT ON TABLE usage_logs IS '视频处理操作日志表';
COMMENT ON COLUMN usage_logs.user_id IS '用户 ID（如果已登录）';
COMMENT ON COLUMN usage_logs.user_email IS '用户邮箱（记录时刻的快照）';
COMMENT ON COLUMN usage_logs.original_url IS '原始视频链接';
COMMENT ON COLUMN usage_logs.processed_url IS '处理后的视频链接';
COMMENT ON COLUMN usage_logs.credits_used IS '消耗的积分数';
COMMENT ON COLUMN usage_logs.credits_remaining IS '操作后剩余积分';
COMMENT ON COLUMN usage_logs.status IS '处理状态: success/failed';
COMMENT ON COLUMN usage_logs.error_message IS '错误信息（如果失败）';
COMMENT ON COLUMN usage_logs.platform IS '视频平台（xhs/douyin等）';
COMMENT ON COLUMN usage_logs.ip_address IS '用户 IP 地址';
COMMENT ON COLUMN usage_logs.user_agent IS '用户代理字符串';