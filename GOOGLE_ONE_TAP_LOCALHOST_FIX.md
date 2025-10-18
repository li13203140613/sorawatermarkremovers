# 修复 Google One Tap "无法使用 google.com 继续操作" 错误

## 🔍 错误分析

### 错误提示
```
使用 google.com 账号登录 localhost
无法使用 google.com 继续操作
出了点问题
```

### 出现时机

这个错误在以下情况出现：

1. **页面加载时** - Google One Tap 弹窗显示
2. **用户点击账号** - 尝试登录时触发
3. **CORS 验证失败** - Google 服务器拒绝请求

### 根本原因

**核心问题：Google Cloud Console 中的授权配置缺失或不正确**

Google One Tap 需要验证：
- ✅ 你的网站域名（localhost）是否在**授权 JavaScript 来源**中
- ✅ 回调 URL 是否在**授权重定向 URI** 中
- ✅ CORS 头是否正确配置

如果配置不正确，Google 会阻止跨域请求，显示此错误。

## 🔧 解决方案

### 方案 1: 配置 Google Cloud Console（推荐）

#### 步骤 1: 访问 Google Cloud Console

1. 访问 [Google Cloud Console](https://console.cloud.google.com)
2. 选择你的项目
3. 导航到 **APIs & Services** → **Credentials**

#### 步骤 2: 找到 OAuth 2.0 客户端 ID

找到你正在使用的 OAuth 客户端 ID：
```
290047844746-3au3f2b54j9qripfpjq6qbt33g8njljf.apps.googleusercontent.com
```

点击编辑（铅笔图标）

#### 步骤 3: 添加授权 JavaScript 来源

在 **Authorized JavaScript origins** 部分，添加以下 URI：

```
http://localhost
http://localhost:3000
```

**重要提示**：
- ✅ 必须包含 `http://localhost`（不带端口）
- ✅ 必须包含 `http://localhost:3000`（带端口）
- ❌ 不要添加 `https://localhost`（开发环境用 http）
- ❌ 不要添加尾部斜杠 `/`

#### 步骤 4: 添加授权重定向 URI

在 **Authorized redirect URIs** 部分，添加：

```
http://localhost:3000/auth/callback
http://localhost/auth/callback
```

#### 步骤 5: 保存配置

点击 **Save** 按钮

**⏰ 等待时间**：
- Google 需要 5-10 分钟来更新配置
- 某些情况可能需要最多 1 小时

### 方案 2: 从 Supabase 直接获取配置

如果你的 Google OAuth 是通过 Supabase 配置的：

1. 访问 [Supabase Dashboard](https://app.supabase.com)
2. 进入你的项目 → **Authentication** → **Providers** → **Google**
3. 找到 **Callback URL (for Google)**，应该类似：
   ```
   https://zjefhzapfbouslkgllah.supabase.co/auth/v1/callback
   ```
4. 点击 **Google Cloud Console** 链接，会直接打开你的 OAuth 配置
5. 按照方案 1 的步骤 3-5 添加 localhost URI

### 方案 3: 使用 127.0.0.1 替代 localhost

某些情况下，使用 IP 地址可以绕过 CORS 问题：

#### 修改访问方式

将浏览器地址从：
```
http://localhost:3000
```
改为：
```
http://127.0.0.1:3000
```

#### 更新 Google Cloud Console

添加授权来源：
```
http://127.0.0.1
http://127.0.0.1:3000
```

添加重定向 URI：
```
http://127.0.0.1:3000/auth/callback
```

## 📋 完整配置示例

### Google Cloud Console 配置

**OAuth 2.0 Client ID 配置**

```
Client ID:
290047844746-3au3f2b54j9qripfpjq6qbt33g8njljf.apps.googleusercontent.com

Authorized JavaScript origins:
├── http://localhost
├── http://localhost:3000
├── http://127.0.0.1
├── http://127.0.0.1:3000
├── https://www.sora-prompt.io        (生产环境)
└── https://sora2video.com            (生产环境)

Authorized redirect URIs:
├── http://localhost:3000/auth/callback
├── http://127.0.0.1:3000/auth/callback
└── https://www.sora-prompt.io/auth/callback (生产环境)
```

### Supabase 配置

**Authentication → URL Configuration**

```
Site URL:
https://www.sora-prompt.io

Redirect URLs:
├── http://localhost:3000/auth/callback
├── http://127.0.0.1:3000/auth/callback
└── https://www.sora-prompt.io/auth/callback
```

## 🧪 验证配置

### 1. 清除浏览器缓存

```bash
按 Ctrl + Shift + Delete
选择"Cookie 和其他网站数据"
点击"清除数据"
```

### 2. 重启开发服务器

```bash
# 停止服务器
Ctrl + C

# 重新启动
npm run dev
```

### 3. 等待 Google 更新

⏰ 等待 **5-10 分钟**，让 Google 服务器同步配置

### 4. 测试登录

访问：`http://localhost:3000`

**预期结果**：
- ✅ One Tap 弹窗显示
- ✅ 点击账号后无错误
- ✅ 成功跳转到 Google 授权页面
- ✅ 授权后成功登录

## 🔍 调试技巧

### 检查浏览器控制台

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

### 检查 Network 请求

DevTools → Network 选项卡 → 筛选 "google"

**查找失败的请求**：
- 红色的请求表示失败
- 点击查看 Headers 和 Response
- 查找 CORS 相关错误

### 使用 Google OAuth Playground

访问：https://developers.google.com/oauthplayground

测试你的 Client ID 是否配置正确

## ❌ 常见错误配置

### 错误 1: 缺少端口号

```diff
- http://localhost        ✓ 正确
- http://localhost:3000   ✗ 缺少（必须两个都添加）
```

### 错误 2: 使用 HTTPS

```diff
- http://localhost:3000   ✓ 开发环境用 http
+ https://localhost:3000  ✗ 开发环境不要用 https
```

### 错误 3: 添加尾部斜杠

```diff
- http://localhost:3000   ✓ 正确
+ http://localhost:3000/  ✗ 不要加斜杠
```

### 错误 4: 混淆 JavaScript 来源和重定向 URI

**JavaScript 来源**（不带路径）：
```
http://localhost:3000
```

**重定向 URI**（带路径）：
```
http://localhost:3000/auth/callback
```

## 🚀 配置后仍然失败？

### 检查清单

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
2. **提供备用登录按钮**：

已在登录页面 `app/login/page.tsx` 中实现：
- Google One Tap（自动弹出）
- 传统 Google 登录按钮（手动点击）

## 📞 仍需帮助？

### 收集诊断信息

运行以下命令并提供输出：

```bash
# 检查环境变量
cat .env.local | grep GOOGLE

# 检查 Node.js 版本
node --version

# 检查 Next.js 版本
npm list next
```

### 浏览器控制台截图

提供以下截图：
1. Console 选项卡的错误信息
2. Network 选项卡的失败请求
3. Google Cloud Console 的配置页面

## 📚 参考资源

- [Google One Tap 官方文档](https://developers.google.com/identity/gsi/web)
- [Google OAuth 故障排查](https://developers.google.com/identity/protocols/oauth2/web-server#errors)
- [Supabase Google Auth 指南](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Stack Overflow 相关讨论](https://stackoverflow.com/questions/79241333/google-one-tap-on-localhost)

---

**更新日期**: 2025-10-18
**适用版本**: Next.js 14+, Supabase Auth v2+
