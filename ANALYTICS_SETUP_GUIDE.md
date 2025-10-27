# 数据分析统计系统 - 设置指南

> 新增的数据分析统计页面，用于跟踪登录访客、新注册人数、提示词生成、去水印和视频生成等核心指标。

---

## 📊 功能概览

新增的统计页面提供以下核心指标：

1. **登录访客数量**（总计 + 今日）
2. **新注册人数**（总计 + 今日）
3. **提示词生成次数**（总计 + 今日）
4. **去水印次数**（总计 + 今日）
5. **视频生成次数**（总计 + 今日）
6. **最近7天趋势图**（柱状图 + 数据表格）

---

## 🚀 快速开始

### 1. 执行数据库迁移

**第一步**：在 Supabase Dashboard 中执行迁移脚本

导航到 Supabase Dashboard → SQL Editor，执行以下文件：

```
supabase/migrations/20250127000000_add_action_type.sql
```

**迁移内容**：
- 为 `usage_logs` 表添加 `action_type` 字段
- 创建 `user_sessions` 表用于记录用户登录会话
- 添加相应的索引和 RLS 策略

**验证迁移成功**：

```sql
-- 检查 usage_logs 表是否有 action_type 字段
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'usage_logs' AND column_name = 'action_type';

-- 检查 user_sessions 表是否存在
SELECT table_name
FROM information_schema.tables
WHERE table_name = 'user_sessions';
```

### 2. 更新代码以记录操作日志

**重要**：为了让统计数据准确，需要在以下 API 端点中调用日志记录函数：

#### A. 提示词生成 API

在 `app/api/prompt-generator/generate/route.ts` 中添加：

```typescript
import { createAdminClient } from '@/lib/supabase/admin'

// 在成功生成提示词后
await createAdminClient()
  .from('usage_logs')
  .insert({
    user_id: userId || null,
    user_email: userEmail || null,
    action_type: 'prompt_generation',
    status: 'success',
    original_url: '', // 提示词生成不需要 URL
    credits_used: 0,  // 提示词生成不消耗积分
  })
```

#### B. 去水印 API

在 `app/api/video/process/route.ts` 中更新：

```typescript
// 确保日志记录包含 action_type
await createAdminClient()
  .from('usage_logs')
  .insert({
    user_id: userId,
    user_email: userEmail,
    action_type: 'watermark_removal',  // 新增字段
    status: 'success',
    original_url: videoUrl,
    processed_url: result.videoUrl,
    credits_used: 1,
    // ...其他字段
  })
```

#### C. 视频生成 API

在 `app/api/video-generation/create/route.ts` 中添加：

```typescript
// 在视频生成成功后记录日志
await createAdminClient()
  .from('usage_logs')
  .insert({
    user_id: userId,
    user_email: userEmail,
    action_type: 'video_generation',
    status: 'success',
    original_url: taskId,  // 可以存储任务 ID
    credits_used: model === 'sora2-unwm' ? 2 : 1,
    // ...其他字段
  })
```

### 3. 记录用户会话

在用户登录时记录会话，建议在 `lib/auth/context.tsx` 的登录成功回调中添加：

```typescript
import { createUserSession } from '@/lib/admin/queries'

// 在用户登录成功后
await createUserSession({
  userId: user.id,
  userEmail: user.email,
  ipAddress: getClientIp(), // 需要自行实现
  userAgent: navigator.userAgent,
})
```

### 4. 访问统计页面

完成上述步骤后，访问：

```
http://localhost:3000/admin/analytics
```

或者从管理后台首页点击「📊 数据分析」按钮。

---

## 📁 新增文件清单

### 数据库迁移
- `supabase/migrations/20250127000000_add_action_type.sql`

### 类型定义
- `lib/admin/types.ts` (更新)
  - 新增 `ActionType`
  - 新增 `UserSession`
  - 新增 `AnalyticsStats`
  - 新增 `DailyStats`
  - 新增 `CreateSessionParams`

### 查询函数
- `lib/admin/queries.ts` (更新)
  - 新增 `getAnalyticsStats()`
  - 新增 `createUserSession()`

### API 端点
- `app/api/admin/analytics/route.ts`

### 页面组件
- `app/[locale]/admin/analytics/page.tsx`

### UI 组件
- `components/admin/AnalyticsStatsCards.tsx`
- `components/admin/AnalyticsChart.tsx`

### 管理后台更新
- `app/admin/page.tsx` (添加「数据分析」按钮)

---

## 🎨 界面预览

### 统计卡片

显示5个核心指标卡片，每个卡片包含：
- 图标 + 颜色主题
- 指标名称
- 总计数值
- 今日数值

### 趋势图表

- **柱状图**：最近7天的各项指标趋势
- **数据表格**：详细的每日数据
- **图例**：清晰的颜色标识

---

## 🔍 数据统计逻辑

### 登录访客
- 统计来源：`user_sessions` 表
- 统计方式：去重 `user_id`
- 今日统计：`session_started_at >= 今日00:00:00`

### 新注册用户
- 统计来源：`user_profiles` 表
- 统计方式：计数所有记录
- 今日统计：`created_at >= 今日00:00:00`

### 提示词生成
- 统计来源：`usage_logs` 表
- 筛选条件：`action_type = 'prompt_generation' AND status = 'success'`
- 今日统计：`created_at >= 今日00:00:00`

### 去水印
- 统计来源：`usage_logs` 表
- 筛选条件：`action_type = 'watermark_removal' AND status = 'success'`
- 今日统计：`created_at >= 今日00:00:00`

### 视频生成
- 统计来源：`usage_logs` 表
- 筛选条件：`action_type = 'video_generation' AND status = 'success'`
- 今日统计：`created_at >= 今日00:00:00`

---

## 🔐 权限控制

统计页面使用现有的管理员验证机制：

```typescript
import { isAdmin } from '@/lib/admin/auth'

// 在 API 端点中
const adminCheck = await isAdmin()
if (!adminCheck) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
}
```

管理员邮箱配置：
```
ADMIN_EMAILS=admin@example.com,admin2@example.com
```

---

## 🐛 故障排查

### 问题1：统计数据全部为 0

**原因**：
- 数据库迁移未执行
- API 日志记录未添加

**解决方案**：
1. 检查数据库表是否存在：`user_sessions`, `usage_logs.action_type`
2. 检查 API 端点是否已添加日志记录代码
3. 查看浏览器 Console 是否有错误

### 问题2：访问页面返回 403

**原因**：当前用户不是管理员

**解决方案**：
1. 检查 `.env.local` 中的 `ADMIN_EMAILS`
2. 确认已使用管理员邮箱登录

### 问题3：趋势图显示异常

**原因**：最近7天数据不足

**解决方案**：
- 等待数据积累
- 手动插入测试数据

---

## 📝 后续优化建议

1. **实时刷新**：添加 WebSocket 或定时自动刷新
2. **导出功能**：支持导出 CSV/Excel 报表
3. **自定义日期范围**：允许用户选择统计时间段
4. **更多图表类型**：饼图、折线图等
5. **对比分析**：同比、环比数据对比
6. **告警功能**：异常数据自动告警

---

## 🤝 支持

如有问题，请查阅：
- [CLAUDE.md](./CLAUDE.md) - 完整项目文档
- [lib/admin/queries.ts](./lib/admin/queries.ts) - 查询函数实现
- [supabase/migrations/20250127000000_add_action_type.sql](./supabase/migrations/20250127000000_add_action_type.sql) - 数据库迁移脚本

---

**创建时间**: 2025-01-27
**维护者**: Claude AI
**版本**: 1.0.0
