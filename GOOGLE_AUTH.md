# Google One Tap 登录完整指南

本文档提供 Google One Tap 登录功能的完整配置、测试和故障排查指南。

---

## 📋 目录

1. [前置要求](#前置要求)
2. [配置步骤](#配置步骤)
3. [使用方式](#使用方式)
4. [测试指南](#测试指南)
5. [故障排查](#故障排查)
6. [技术细节](#技术细节)

---

## 前置要求

- Google Cloud 项目
- Supabase 项目已配置 Google OAuth

---

## 配置步骤

### 1. 获取 Google Client ID

#### 方法一：从现有 Supabase 配置获取

1. 登录 [Supabase Dashboard](https://app.supabase.com)
2. 进入你的项目 → **Authentication** → **Providers**
3. 找到 **Google** 提供商
4. 复制 **Client ID** (格式类似: `123456789-xxxxx.apps.googleusercontent.com`)

#### 方法二：从 Google Cloud Console 获取

1. 访问 [Google Cloud Console](https://console.cloud.google.com)
2. 选择你的项目 (或创建新项目)
3. 导航到 **APIs & Services** → **Credentials**
4. 找到 OAuth 2.0 客户端 ID
5. 复制 **Client ID**

### 2. 配置环境变量

打开 `.env.local` 文件，添加：

```bash
NEXT_PUBLIC_GOOGLE_CLIENT_ID=123456789-xxxxx.apps.googleusercontent.com
```

### 3. 配置 Google Cloud Console 授权

#### 步骤 1: 访问 Google Cloud Console

1. 访问 [Google Cloud Console](https://console.cloud.google.com)
2. 选择你的项目
3. 导航到 **APIs & Services** → **Credentials**
4. 找到并点击编辑你的 OAuth 2.0 客户端 ID

#### 步骤 2: 添加授权 JavaScript 来源

在 **Authorized JavaScript origins** 部分，添加以下 URI：

**开发环境：**
```
http://localhost
http://localhost:3000
http://127.0.0.1
http://127.0.0.1:3000
```

**生产环境：**
```
https://www.sora-prompt.io
https://sora2video.com
```

**重要提示**：
- ✅ 必须包含 `http://localhost`（不带端口）
- ✅ 必须包含 `http://localhost:3000`（带端口）
- ❌ 不要添加 `https://localhost`（开发环境用 http）
- ❌ 不要添加尾部斜杠 `/`

#### 步骤 3: 添加授权重定向 URI

在 **Authorized redirect URIs** 部分，添加：

**开发环境：**
```
http://localhost:3000/auth/callback
http://localhost/auth/callback
http://127.0.0.1:3000/auth/callback
```

**生产环境：**
```
https://www.sora-prompt.io/auth/callback
```

#### 步骤 4: 保存配置

点击 **Save** 按钮

**⏰ 等待时间**：
- Google 需要 5-10 分钟来更新配置
- 某些情况可能需要最多 1 小时

### 4. Supabase 配置确认

确保 Supabase Auth 已正确配置：

1. 在 Supabase Dashboard → **Authentication** → **URL Configuration**
2. 设置 **Site URL**: `https://www.sora-prompt.io`
3. 添加 **Redirect URLs**:
   - `http://localhost:3000/auth/callback`
   - `http://127.0.0.1:3000/auth/callback`
   - `https://www.sora-prompt.io/auth/callback`

---

## 使用方式

### 基础使用

在任何页面中导入并使用 `GoogleOneTap` 组件：

```tsx
import { GoogleOneTap } from '@/components/auth'

export default function Page() {
  return (
    <>
      <GoogleOneTap />
      {/* 你的页面内容 */}
    </>
  )
}
```

### 已集成页面

以下页面已经集成了 Google One Tap：

#### 1. 首页 (`app/page.tsx`)
```tsx
import { GoogleOneTap } from '@/components/auth'

export default function Home() {
  return (
    <main>
      <GoogleOneTap />
      {/* 页面内容 */}
    </main>
  )
}
```

#### 2. 登录页面 (`app/login/page.tsx`)
```tsx
import { AuthForm, GoogleOneTap } from '@/components/auth'

export default function LoginPage() {
  return (
    <main>
      <GoogleOneTap />
      <AuthForm />
    </main>
  )
}
```

### 配置选项

在 `GoogleOneTap.tsx` 中可以调整以下参数：

```typescript
window.google.accounts.id.initialize({
  client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  callback: handleCredentialResponse,
  auto_select: false,           // 改为 true 可自动选择唯一账号
  cancel_on_tap_outside: false, // 改为 true 点击外部会关闭
  nonce: hashedNonce,
  use_fedcm_for_prompt: true,   // Chrome 隐私沙盒兼容
})
```

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `auto_select` | boolean | false | 如果只有一个账号且之前授权过，是否自动选择 |
| `cancel_on_tap_outside` | boolean | false | 点击提示框外部是否关闭 |
| `use_fedcm_for_prompt` | boolean | true | 兼容 Chrome 第三方 Cookie 限制 |

---

## 测试指南

### ✅ 配置检查清单

在测试前，请确认以下配置已完成：

- [ ] Google Client ID 已配置在 `.env.local`
- [ ] Supabase Google OAuth 已启用
- [ ] Google Cloud Console 授权配置已完成
- [ ] 开发服务器已重启
- [ ] 组件已集成到页面中

### 1. 启动开发服务器

```bash
npm run dev
```

等待输出：
```
  ▲ Next.js 14.x.x
  - Local:        http://localhost:3000
```

### 2. 测试首页弹窗

#### 步骤：

1. **清除浏览器缓存**（可选但推荐）
   - 按 `Ctrl + Shift + Delete`
   - 选择"Cookie 和其他网站数据"
   - 点击"清除数据"

2. **访问首页**
   ```
   http://localhost:3000
   ```

3. **预期效果**：
   - ✅ 页面加载后 1-2 秒内，右上角弹出 Google 账号选择器
   - ✅ 显示格式：白色卡片，包含 Google 账号列表
   - ✅ 显示文字："使用 google.com 账号登录"

#### 视觉参考：

```
┌─────────────────────────────────┐
│  使用 google.com 账号登录        │
│                                 │
│  👤 用户名                       │
│     user@gmail.com              │
│                                 │
│  👤 另一个账号                   │
│     another@gmail.com           │
└─────────────────────────────────┘
```

### 3. 测试登录流程

#### 完整登录测试：

1. **点击 One Tap 中的账号**
2. **Google 处理授权**（可能需要确认权限）
3. **重定向回网站**
4. **检查登录状态**：
   - 右上角显示用户头像
   - One Tap 弹窗消失（因为已登录）

#### 验证登录成功：

打开浏览器控制台 (F12)，运行：

```javascript
// 检查 localStorage
console.log('Supabase session:', localStorage.getItem('supabase.auth.token'))

// 或在页面刷新后查看
// One Tap 应该不再显示（因为已登录）
```

### 4. 测试已登录状态

**登录后刷新页面**：

**预期效果**：
- ❌ One Tap **不应该**弹出（因为已登录）
- ✅ 右上角显示用户信息

### 5. 浏览器控制台检查

打开浏览器开发者工具 (F12)，查看 Console 选项卡：

#### 正常情况应该看到：

```
Google One Tap script loaded
One Tap initialized with client ID: 290047844746-...
```

### 6. 不同浏览器测试

#### Chrome / Edge (推荐)

✅ 完全支持
✅ FedCM 支持
✅ 最佳用户体验

#### Firefox

✅ 支持
⚠️ 可能需要启用第三方 Cookie

#### Safari

⚠️ 部分支持
⚠️ 可能需要额外配置隐私设置

### 📊 成功标准

测试通过的标准：

- ✅ 首页自动弹出 One Tap
- ✅ 点击账号后成功登录
- ✅ 登录后刷新页面不再弹出 One Tap
- ✅ 右上角显示用户头像
- ✅ 控制台无错误信息
- ✅ 可以正常使用网站功能（去水印、视频生成等）

---

## 故障排查

### 问题 1: One Tap 完全不显示

#### 可能原因和解决方案：

**1. Client ID 未配置**
- 检查 `.env.local` 中的 `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
- 确保重启了开发服务器

验证环境变量：
```bash
cat .env.local | grep GOOGLE
```

**2. 浏览器控制台错误**
- 打开浏览器开发者工具 (F12)
- 查看 Console 选项卡是否有错误信息

**3. 已经登录**
- One Tap 只在未登录时显示
- 退出登录后再测试

**4. Cookie 限制**
- 确保 `use_fedcm_for_prompt: true` 已设置
- 尝试在无痕模式测试

**5. 域名不匹配**
- 确保 Google OAuth 配置中包含当前域名
- 检查 Supabase Redirect URLs 配置

**6. 网络请求失败**
- 打开 DevTools → Network 选项卡
- 刷新页面，搜索 "gsi/client"
- 应该看到成功加载的 Google 脚本

### 问题 2: "无法使用 google.com 继续操作" 错误

#### 错误提示
```
使用 google.com 账号登录 localhost
无法使用 google.com 继续操作
出了点问题
```

#### 根本原因

**核心问题：Google Cloud Console 中的授权配置缺失或不正确**

Google One Tap 需要验证：
- ✅ 你的网站域名（localhost）是否在**授权 JavaScript 来源**中
- ✅ 回调 URL 是否在**授权重定向 URI** 中
- ✅ CORS 头是否正确配置

#### 解决步骤

1. **访问 Google Cloud Console**
   - 导航到 **APIs & Services** → **Credentials**
   - 找到并编辑你的 OAuth 2.0 客户端 ID

2. **添加授权 JavaScript 来源**
   ```
   http://localhost
   http://localhost:3000
   ```

3. **添加授权重定向 URI**
   ```
   http://localhost:3000/auth/callback
   http://localhost/auth/callback
   ```

4. **保存并等待**
   - 点击 Save
   - 等待 5-10 分钟让 Google 服务器同步配置

5. **清除缓存并重新测试**
   - 清除浏览器缓存和 Cookie
   - 重启开发服务器
   - 访问 `http://localhost:3000`

#### 常见错误配置

**错误 1: 缺少端口号**
```diff
- http://localhost        ✓ 正确
- http://localhost:3000   ✗ 缺少（必须两个都添加）
```

**错误 2: 使用 HTTPS**
```diff
- http://localhost:3000   ✓ 开发环境用 http
+ https://localhost:3000  ✗ 开发环境不要用 https
```

**错误 3: 添加尾部斜杠**
```diff
- http://localhost:3000   ✓ 正确
+ http://localhost:3000/  ✗ 不要加斜杠
```

**错误 4: 混淆 JavaScript 来源和重定向 URI**

JavaScript 来源（不带路径）：
```
http://localhost:3000
```

重定向 URI（带路径）：
```
http://localhost:3000/auth/callback
```

### 问题 3: One Tap 显示但点击后无反应

#### 检查步骤：

**1. 查看控制台错误**
```javascript
// 应该看到类似输出
"Google One Tap login success: { user: {...} }"
```

**2. 检查 Supabase 配置**
- 访问 [Supabase Dashboard](https://app.supabase.com)
- 确认 Google Provider 已启用
- 检查 Redirect URLs 包含 `http://localhost:3000/auth/callback`

**3. 验证 Nonce**
```javascript
// 在控制台运行
console.log('Nonce:', sessionStorage.getItem('google_nonce'))
// 应该返回一个长字符串
```

### 问题 4: 登录成功但立即退出

**可能原因**：

1. **Session 未正确保存**
   - 检查 Supabase 配置
   - 确认没有 CORS 错误

2. **Cookie 被阻止**
   - 检查浏览器隐私设置
   - 允许第三方 Cookie（开发环境）

### 问题 5: 多次弹出 One Tap

**解决方案**：

这不应该发生，因为 `GoogleOneTap` 组件有防重复逻辑。如果遇到：

1. 检查是否在多个地方导入了组件
2. 确认没有在 `layout.tsx` 和 `page.tsx` 中重复添加

### 控制台错误代码说明

#### 错误 1: "NEXT_PUBLIC_GOOGLE_CLIENT_ID is not configured"

**解决方案**：
1. 检查 `.env.local` 文件
2. 确保 `NEXT_PUBLIC_GOOGLE_CLIENT_ID` 已设置
3. 重启开发服务器 (`Ctrl + C` 然后 `npm run dev`)

#### 错误 2: "Failed to load Google One Tap script"

**解决方案**：
1. 检查网络连接
2. 确认可以访问 `https://accounts.google.com`
3. 关闭 VPN 或代理（可能阻止 Google 脚本）

#### 错误 3: "Nonce not found"

**解决方案**：
1. 清除浏览器 SessionStorage
2. 刷新页面重试

#### 错误 4: "One Tap not displayed: ..."

查看具体原因：

| 原因代码 | 说明 | 解决方案 |
|---------|------|---------|
| `suppressed_by_user` | 用户之前关闭过 One Tap | 清除 Cookie 或等待冷却期 |
| `credential_returned` | 用户已登录 | 正常情况，无需处理 |
| `opt_out_or_no_session` | 用户退出或无会话 | 检查 Google 账号登录状态 |
| `browser_not_supported` | 浏览器不支持 | 使用 Chrome/Edge/Firefox 最新版 |

### 调试技巧

#### 检查浏览器控制台

打开 DevTools (F12) → Console 选项卡

**正常日志**：
```
Google One Tap script loaded
One Tap initialized with client ID: 290047844746-...
```

**错误日志**：
```javascript
// CORS 错误
Access to XMLHttpRequest at 'https://accounts.google.com/...'
from origin 'http://localhost:3000' has been blocked by CORS policy

// 配置错误
Origin mismatch: http://localhost:3000 is not an authorized JavaScript origin
```

#### 检查 Network 请求

DevTools → Network 选项卡 → 筛选 "google"

**查找失败的请求**：
- 红色的请求表示失败
- 点击查看 Headers 和 Response
- 查找 CORS 相关错误

#### 使用 Google OAuth Playground

访问：https://developers.google.com/oauthplayground

测试你的 Client ID 是否配置正确

### 完整配置检查清单

- [ ] Google Cloud Console 配置已保存
- [ ] 等待了至少 10 分钟
- [ ] 清除了浏览器缓存和 Cookie
- [ ] 重启了开发服务器
- [ ] 使用的是正确的 Client ID
- [ ] Supabase Redirect URLs 已更新
- [ ] 浏览器支持 One Tap（Chrome/Edge 最佳）

### 替代方案

如果 One Tap 仍然失败，可以使用传统 OAuth 登录：

1. **保留 One Tap 组件**（用于支持的用户）
2. **提供备用登录按钮**

已在登录页面 `app/login/page.tsx` 中实现：
- Google One Tap（自动弹出）
- 传统 Google 登录按钮（手动点击）

---

## 技术细节

### 工作原理

1. **加载 Google SDK**: 使用 Next.js Script 组件异步加载 Google GSI 库
2. **生成 Nonce**: 创建安全随机令牌并计算 SHA-256 哈希
3. **初始化 One Tap**: 配置 Google One Tap 并传入哈希后的 nonce
4. **显示提示框**: 自动在页面右上角显示账号选择器
5. **处理回调**: 接收 Google ID Token 和原始 nonce
6. **Supabase 验证**: 调用 `signInWithIdToken` 验证并创建会话
7. **重定向**: 登录成功后跳转到首页

### 安全性

- **Nonce 防重放**: 每次登录生成唯一 nonce，防止令牌重放攻击
- **HTTPS 要求**: 生产环境必须使用 HTTPS
- **Token 验证**: Supabase 后端验证 Google ID Token 真实性
- **会话管理**: 使用 Supabase Auth 安全管理用户会话

### 安全性验证

#### 验证 Nonce 机制：

1. 打开控制台
2. 登录过程中观察：
   ```javascript
   // 应该看到
   "Nonce generated: abc123..."
   "Nonce hashed: def456..."
   "Nonce sent to Google"
   "Nonce verified by Supabase"
   ```

#### 验证 HTTPS 重定向（生产环境）：

```javascript
// 生产环境应该强制 HTTPS
console.log(window.location.protocol) // 应该是 "https:"
```

---

## 参考资源

- [Google One Tap 官方文档](https://developers.google.com/identity/gsi/web/guides/display-google-one-tap)
- [Google OAuth 故障排查](https://developers.google.com/identity/protocols/oauth2/web-server#errors)
- [Supabase Google Auth 文档](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Next.js Script 组件](https://nextjs.org/docs/pages/api-reference/components/script)
- [Stack Overflow 相关讨论](https://stackoverflow.com/questions/79241333/google-one-tap-on-localhost)

---

## 更新日志

| 日期 | 变更 |
|------|------|
| 2025-10-21 | 合并三个文档为完整指南 |
| 2025-10-18 | 初始版本，实现 Google One Tap 登录功能 |