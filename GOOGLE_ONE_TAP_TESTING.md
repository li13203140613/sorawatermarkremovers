# Google One Tap 测试指南

本文档提供 Google One Tap 登录功能的完整测试步骤和故障排查方法。

## ✅ 配置检查清单

在测试前，请确认以下配置已完成：

- [x] Google Client ID 已配置在 `.env.local`
- [x] Supabase Google OAuth 已启用
- [x] 开发服务器已重启
- [x] 组件已集成到页面中

## 🧪 测试步骤

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
   - ✅ 显示文字："使用 google.com 账号登录 sora2video.com"

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

### 3. 测试登录页面弹窗

访问：`http://localhost:3000/login`

**预期效果**：
- ✅ 右上角弹出 Google One Tap
- ✅ 页面中间显示传统登录按钮（作为备选）

### 4. 测试视频生成页面

访问：`http://localhost:3000/video-generation`

**预期效果**：
- ✅ 右上角弹出 Google One Tap
- ✅ 页面显示视频生成表单

### 5. 测试登录流程

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

### 6. 测试已登录状态

**登录后刷新页面**：

**预期效果**：
- ❌ One Tap **不应该**弹出（因为已登录）
- ✅ 右上角显示用户信息

## 🔍 浏览器控制台检查

打开浏览器开发者工具 (F12)，查看 Console 选项卡：

### 正常情况应该看到：

```
Google One Tap script loaded
One Tap initialized with client ID: 290047844746-...
```

### 如果看到错误信息：

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

## 🛠️ 故障排查

### 问题 1: One Tap 完全不显示

**检查步骤**：

1. **验证环境变量**：
   ```bash
   # 在项目根目录运行
   cat .env.local | grep GOOGLE
   ```
   应该看到：
   ```
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=290047844746-3au3f2b54j9qripfpjq6qbt33g8njljf.apps.googleusercontent.com
   ```

2. **检查网络请求**：
   - 打开 DevTools → Network 选项卡
   - 刷新页面
   - 搜索 "gsi/client"
   - 应该看到成功加载的 Google 脚本

3. **检查组件加载**：
   - 打开 React DevTools
   - 搜索 "GoogleOneTap"
   - 确认组件已挂载

### 问题 2: One Tap 显示但点击后无反应

**检查步骤**：

1. **查看控制台错误**：
   ```javascript
   // 应该看到类似输出
   "Google One Tap login success: { user: {...} }"
   ```

2. **检查 Supabase 配置**：
   - 访问 [Supabase Dashboard](https://app.supabase.com)
   - 确认 Google Provider 已启用
   - 检查 Redirect URLs 包含 `http://localhost:3000/auth/callback`

3. **验证 Nonce**：
   ```javascript
   // 在控制台运行
   console.log('Nonce:', sessionStorage.getItem('google_nonce'))
   // 应该返回一个长字符串
   ```

### 问题 3: 登录成功但立即退出

**可能原因**：

1. **Session 未正确保存**
   - 检查 Supabase 配置
   - 确认没有 CORS 错误

2. **Cookie 被阻止**
   - 检查浏览器隐私设置
   - 允许第三方 Cookie（开发环境）

### 问题 4: 多次弹出 One Tap

**解决方案**：

这不应该发生，因为 `GoogleOneTap` 组件有防重复逻辑。如果遇到：

1. 检查是否在多个地方导入了组件
2. 确认没有在 `layout.tsx` 和 `page.tsx` 中重复添加

## 🌐 不同浏览器测试

### Chrome / Edge (推荐)

✅ 完全支持
✅ FedCM 支持
✅ 最佳用户体验

### Firefox

✅ 支持
⚠️ 可能需要启用第三方 Cookie

### Safari

⚠️ 部分支持
⚠️ 可能需要额外配置隐私设置

## 📱 移动端测试

Google One Tap 也支持移动浏览器：

1. **在同一网络下**，访问：
   ```
   http://YOUR_LOCAL_IP:3000
   ```

2. **预期效果**：
   - 移动端也会显示 One Tap（位置可能不同）
   - 点击后使用 Google 账号登录

## 🔐 安全性验证

### 验证 Nonce 机制：

1. 打开控制台
2. 登录过程中观察：
   ```javascript
   // 应该看到
   "Nonce generated: abc123..."
   "Nonce hashed: def456..."
   "Nonce sent to Google"
   "Nonce verified by Supabase"
   ```

### 验证 HTTPS 重定向（生产环境）：

```javascript
// 生产环境应该强制 HTTPS
console.log(window.location.protocol) // 应该是 "https:"
```

## 📊 成功标准

测试通过的标准：

- ✅ 首页自动弹出 One Tap
- ✅ 点击账号后成功登录
- ✅ 登录后刷新页面不再弹出 One Tap
- ✅ 右上角显示用户头像
- ✅ 控制台无错误信息
- ✅ 可以正常使用网站功能（去水印、视频生成等）

## 🎯 下一步

测试通过后，可以：

1. **部署到生产环境**
   - 更新生产环境的 Google Client ID
   - 添加生产域名到 Google OAuth 配置

2. **优化用户体验**
   - 调整 `auto_select` 参数
   - 自定义提示文本

3. **监控和分析**
   - 添加 Google Analytics 跟踪
   - 监控登录成功率

## 📞 需要帮助？

如果遇到问题：

1. 检查浏览器控制台错误
2. 查看本文档的故障排查部分
3. 参考 [Google One Tap 官方文档](https://developers.google.com/identity/gsi/web)
4. 检查 [Supabase Auth 文档](https://supabase.com/docs/guides/auth)

---

**祝测试顺利！** 🎉
