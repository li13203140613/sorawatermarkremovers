# 🚀 部署指南

代码已成功推送到 GitHub！现在需要完成以下步骤来部署管理后台到生产环境。

---

## ✅ 已完成

- ✅ 代码已提交到 Git
- ✅ 代码已推送到 GitHub (commit: ff4b290)
- ✅ 构建测试通过

---

## 📋 待完成步骤

### 1. 在 Supabase 生产环境执行 SQL

1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的生产项目
3. 进入 **SQL Editor**
4. 执行以下 SQL（复制自 `supabase/migrations/create_usage_logs.sql`）:

```sql
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
CREATE POLICY "Admin can view all logs" ON usage_logs
  FOR SELECT
  USING (auth.role() = 'service_role');

-- 允许服务端插入日志
CREATE POLICY "Service can insert logs" ON usage_logs
  FOR INSERT
  WITH CHECK (true);
```

5. 点击 **Run** 执行
6. 确认显示 "Success" 消息

---

### 2. 配置 Vercel 环境变量

访问你的 Vercel 项目设置页面，添加以下环境变量：

#### 管理员凭证
```
ADMIN_USERNAME=lixiaofei
ADMIN_PASSWORD=lifei.123
```

**⚠️ 重要提示**：
- 这两个变量必须添加到 Vercel 的 **Production** 环境
- 路径：Vercel Dashboard → Your Project → Settings → Environment Variables
- 选择 **Production** 环境
- 点击 **Save** 保存

#### 已有的环境变量（确认存在）
确保以下环境变量已配置：
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SORA_API_URL`
- `SORA_API_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
- `TURNSTILE_SECRET_KEY`

---

### 3. 重新部署 Vercel

添加环境变量后需要触发重新部署：

**方式 1: 通过 Vercel Dashboard**
1. 访问 Vercel Dashboard
2. 进入你的项目
3. 进入 **Deployments** 标签
4. 点击最新部署右侧的 **···** 菜单
5. 选择 **Redeploy**
6. 确认重新部署

**方式 2: 推送代码（已完成）**
- GitHub 推送会自动触发部署
- Vercel 会自动检测新提交并部署

---

### 4. 验证部署

部署完成后（约 2-3 分钟），验证以下内容：

#### 4.1 检查生产环境
1. 访问生产网站：`https://www.sora-prompt.io`
2. 确认网站正常运行

#### 4.2 测试管理后台
1. 访问：`https://www.sora-prompt.io/admin/login`
2. 输入凭证：
   - 用户名：`lixiaofei`
   - 密码：`lifei.123`
3. 登录成功后应该看到管理后台

#### 4.3 测试功能
- ✅ 查看统计数据
- ✅ 查看用户列表
- ✅ 查看操作日志
- ✅ 测试筛选功能
- ✅ 测试登出功能

---

## 🔒 安全提醒

1. **不要将管理员凭证提交到 Git**
   - `.env.local` 已在 `.gitignore` 中
   - 只在 Vercel 环境变量中配置

2. **定期更换密码**
   - 建议每 3 个月更换一次管理员密码
   - 在 Vercel 环境变量中修改后重新部署

3. **监控访问日志**
   - 定期检查管理后台的访问记录
   - 注意异常登录尝试

---

## 📊 管理后台功能

### 统计数据
- 总用户数
- 今日处理次数
- 成功率
- 7天活跃用户

### 用户管理
- 查看所有用户
- 查看剩余积分
- 查看使用次数
- 查看最后使用时间

### 操作日志
- 详细记录每次操作
- 筛选功能（用户、状态、时间）
- 分页显示
- 导出功能（未来版本）

---

## 🐛 常见问题

### Q: 登录后台返回 403？
**A**: 检查 Vercel 环境变量中是否正确配置了 `ADMIN_USERNAME` 和 `ADMIN_PASSWORD`

### Q: 看不到统计数据？
**A**: 确保已在 Supabase 生产环境执行了 SQL 创建表

### Q: 数据库查询报错？
**A**: 检查 `SUPABASE_SERVICE_ROLE_KEY` 是否正确配置

### Q: Vercel 部署失败？
**A**: 查看 Vercel 部署日志，通常是环境变量缺失或构建错误

---

## 📞 支持

如有问题，请检查：
1. Vercel 部署日志
2. Supabase 数据库日志
3. 浏览器控制台错误

---

## 🎉 完成后

部署完成后，你将拥有：
- ✅ 完整的管理后台系统
- ✅ 用户使用数据统计
- ✅ 操作日志记录
- ✅ 安全的管理员认证

祝你使用愉快！🚀
