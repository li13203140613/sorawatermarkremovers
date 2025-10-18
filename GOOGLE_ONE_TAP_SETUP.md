# Google One Tap 登录配置指南

本文档说明如何配置 Google One Tap 登录功能，实现右上角自动弹出的账号选择器。

## 📋 前置要求

- Google Cloud 项目
- Supabase 项目已配置 Google OAuth

## 🔧 配置步骤

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

打开 `.env.local` 文件，将以下内容：

```bash
NEXT_PUBLIC_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE
```

替换为你的实际 Client ID：

```bash
NEXT_PUBLIC_GOOGLE_CLIENT_ID=123456789-xxxxx.apps.googleusercontent.com
```

### 3. 配置授权重定向 URI

在 Google Cloud Console 的 OAuth 客户端设置中，确保添加以下 URI：

**开发环境：**
```
http://localhost:3000
http://localhost:3000/auth/callback
```

**生产环境：**
```
https://www.sora-prompt.io
https://www.sora-prompt.io/auth/callback
```

### 4. Supabase 配置确认

确保 Supabase Auth 已正确配置：

1. 在 Supabase Dashboard → **Authentication** → **URL Configuration**
2. 设置 **Site URL**: `https://www.sora-prompt.io`
3. 添加 **Redirect URLs**:
   - `http://localhost:3000/auth/callback`
   - `https://www.sora-prompt.io/auth/callback`

## 🚀 使用方式

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

#### 3. 视频生成页面 (`app/video-generation/page.tsx`)
视频生成页面通过 `VideoGenerator` 组件集成了 Google One Tap：
```tsx
import { GoogleOneTap } from '@/components/auth'

export default function VideoGenerator() {
  return (
    <div>
      <GoogleOneTap />
      {/* 视频生成表单 */}
    </div>
  )
}
```

## ⚙️ 配置选项

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

### 常用配置说明

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `auto_select` | boolean | false | 如果只有一个账号且之前授权过，是否自动选择 |
| `cancel_on_tap_outside` | boolean | false | 点击提示框外部是否关闭 |
| `use_fedcm_for_prompt` | boolean | true | 兼容 Chrome 第三方 Cookie 限制 |

## 🧪 测试步骤

1. **启动开发服务器**:
   ```bash
   npm run dev
   ```

2. **访问登录页面**:
   ```
   http://localhost:3000/login
   ```

3. **预期效果**:
   - 页面加载后，右上角会自动弹出 Google One Tap 提示框
   - 显示你登录的 Google 账号列表
   - 点击账号即可完成登录
   - 如果弹窗被关闭，仍可使用下方的传统登录按钮

## 🔍 故障排查

### One Tap 不显示

**可能原因和解决方案：**

1. **Client ID 未配置**
   - 检查 `.env.local` 中的 `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
   - 确保重启了开发服务器

2. **浏览器控制台错误**
   - 打开浏览器开发者工具 (F12)
   - 查看 Console 选项卡是否有错误信息

3. **已经登录**
   - One Tap 只在未登录时显示
   - 退出登录后再测试

4. **Cookie 限制**
   - 确保 `use_fedcm_for_prompt: true` 已设置
   - 尝试在无痕模式测试

5. **域名不匹配**
   - 确保 Google OAuth 配置中包含当前域名
   - 检查 Supabase Redirect URLs 配置

### 登录失败

1. **检查 Nonce**
   - 查看浏览器控制台是否有 nonce 相关错误
   - 确保 `sessionStorage` 可用

2. **Supabase 配置**
   - 确认 Supabase 中 Google Provider 已启用
   - 检查 Client ID 和 Secret 是否正确

3. **网络问题**
   - 检查是否能访问 `accounts.google.com`
   - 查看网络请求是否被拦截

## 📚 技术细节

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

## 🌐 参考资源

- [Google One Tap 官方文档](https://developers.google.com/identity/gsi/web/guides/display-google-one-tap)
- [Supabase Google Auth 文档](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Next.js Script 组件](https://nextjs.org/docs/pages/api-reference/components/script)

## 📝 更新日志

| 日期 | 变更 |
|------|------|
| 2025-10-18 | 初始版本，实现 Google One Tap 登录功能 |
