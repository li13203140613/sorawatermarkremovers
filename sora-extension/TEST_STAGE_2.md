# 🧪 阶段 2.1 测试文档：OAuth Background Script

## ✅ 已完成

创建了新的 `background-oauth.js`，包含完整的 OAuth 登录功能。

---

## 📋 测试前准备

### 步骤 1：配置 Supabase Redirect URI

**⚠️ 这是测试的前提条件！**

1. **获取扩展 ID**：
   - 打开 `chrome://extensions/`
   - 开启"开发者模式"
   - 找到 "Sora Video Downloader" 扩展
   - 复制扩展 ID（例如：`abcdefghijklmnopqrstuvwxyz123456`）

2. **配置 Supabase**：
   - 访问：https://supabase.com/dashboard/project/zjefhzapfbouslkgllah/auth/url-configuration
   - 在 `Redirect URLs` 部分，添加：
     ```
     https://[你的扩展ID].chromiumapp.org/
     ```
     例如：
     ```
     https://abcdefghijklmnopqrstuvwxyz123456.chromiumapp.org/
     ```
   - 点击 **Save**

3. **验证配置**：
   - 刷新页面，确认新的 Redirect URL 已保存

---

### 步骤 2：更新 manifest.json 使用新的 background script

临时修改 `manifest.json`：

```json
{
  "background": {
    "service_worker": "background-oauth.js"
  }
}
```

---

### 步骤 3：重新加载扩展

1. 打开 `chrome://extensions/`
2. 找到 "Sora Video Downloader"
3. 点击 **重新加载** 按钮（🔄）

---

## 🧪 测试步骤

### 测试 1：验证 Background Service Worker 启动

1. 在 `chrome://extensions/` 页面
2. 找到 "Sora Video Downloader"
3. 点击 **"service worker"** 链接（或 "检查视图"）
4. 会打开一个新的开发者工具窗口

**预期结果**：
```
🎬 Sora Video Downloader Background Service 已启动 (OAuth 版本)
✅ Background Service Worker 初始化完成 (OAuth 版本)
```

**✅ 通过 / ❌ 失败**：__________

---

### 测试 2：测试消息监听器

在 background service worker 控制台执行：

```javascript
// 测试 getUserInfo 消息
chrome.runtime.sendMessage({ action: 'getUserInfo' }, (response) => {
  console.log('getUserInfo 响应:', response);
});
```

**预期结果**：
```
📨 收到消息: {action: 'getUserInfo'}
ℹ️ 未登录（无 OAuth Token）
📤 发送用户信息: {success: true, isLoggedIn: false, credits: 1}
getUserInfo 响应: {success: true, isLoggedIn: false, credits: 1}
```

**✅ 通过 / ❌ 失败**：__________

---

### 测试 3：测试 OAuth 登录流程（核心测试）

在 background service worker 控制台执行：

```javascript
// 测试登录
chrome.runtime.sendMessage({ action: 'login', provider: 'google' }, (response) => {
  console.log('登录响应:', response);
});
```

**操作步骤**：
1. 执行上述代码
2. 会弹出 Google 授权窗口
3. 选择你的 Google 账号
4. 授权后，窗口自动关闭

**预期控制台输出**：
```
📨 收到消息: {action: 'login', provider: 'google'}
🔐 开始 google OAuth 登录流程...
📍 Redirect URI: https://xxx.chromiumapp.org/
🌐 打开授权窗口...
✅ 授权成功，解析 Token...
💾 Token 已存储
⏰ Token 过期时间: 2025-10-14 23:xx:xx
📡 获取用户信息...
✅ 用户信息获取成功
✅ 登录成功: your-email@gmail.com
📤 发送登录响应: {success: true, user: {...}}
登录响应: {success: true, user: {id: '...', email: '...', name: '...', ...}}
```

**✅ 通过 / ❌ 失败**：__________

---

### 测试 4：验证 Token 存储

在 background service worker 控制台执行：

```javascript
// 检查存储的 Token
chrome.storage.local.get([
  'oauth_access_token',
  'oauth_refresh_token',
  'oauth_expires_at',
  'oauth_user_info'
], (result) => {
  console.log('存储的数据:');
  console.log('- Access Token:', result.oauth_access_token ? '✅ 存在' : '❌ 不存在');
  console.log('- Refresh Token:', result.oauth_refresh_token ? '✅ 存在' : '❌ 不存在');
  console.log('- 过期时间:', result.oauth_expires_at ? new Date(result.oauth_expires_at).toLocaleString() : '❌ 不存在');
  console.log('- 用户信息:', result.oauth_user_info);
});
```

**预期结果**：
```
存储的数据:
- Access Token: ✅ 存在
- Refresh Token: ✅ 存在
- 过期时间: 2025-10-14 23:xx:xx
- 用户信息: {id: '...', email: '...', name: '...', avatarUrl: '...', credits: 0}
```

**✅ 通过 / ❌ 失败**：__________

---

### 测试 5：再次测试 getUserInfo（登录后）

在 background service worker 控制台执行：

```javascript
chrome.runtime.sendMessage({ action: 'getUserInfo' }, (response) => {
  console.log('getUserInfo 响应:', response);
});
```

**预期结果**：
```
📨 收到消息: {action: 'getUserInfo'}
✅ OAuth Token 有效
📤 发送用户信息: {success: true, isLoggedIn: true, ...}
getUserInfo 响应: {
  success: true,
  isLoggedIn: true,
  id: '...',
  email: 'your-email@gmail.com',
  name: '你的名字',
  avatarUrl: '...',
  credits: 0
}
```

**✅ 通过 / ❌ 失败**：__________

---

### 测试 6：测试登出功能

在 background service worker 控制台执行：

```javascript
chrome.runtime.sendMessage({ action: 'logout' }, (response) => {
  console.log('登出响应:', response);

  // 验证存储已清除
  chrome.storage.local.get([
    'oauth_access_token',
    'oauth_refresh_token',
    'oauth_expires_at',
    'oauth_user_info'
  ], (result) => {
    console.log('登出后的存储:');
    console.log('- Access Token:', result.oauth_access_token ? '❌ 还在' : '✅ 已清除');
    console.log('- Refresh Token:', result.oauth_refresh_token ? '❌ 还在' : '✅ 已清除');
    console.log('- 过期时间:', result.oauth_expires_at ? '❌ 还在' : '✅ 已清除');
    console.log('- 用户信息:', result.oauth_user_info ? '❌ 还在' : '✅ 已清除');
  });
});
```

**预期结果**：
```
📨 收到消息: {action: 'logout'}
👋 登出中...
✅ 已登出
📤 登出成功
登出响应: {success: true}

登出后的存储:
- Access Token: ✅ 已清除
- Refresh Token: ✅ 已清除
- 过期时间: ✅ 已清除
- 用户信息: ✅ 已清除
```

**✅ 通过 / ❌ 失败**：__________

---

## 📊 测试结果汇总

| 测试项 | 状态 | 备注 |
|--------|------|------|
| 1. Service Worker 启动 | ⬜ | |
| 2. 消息监听器 | ⬜ | |
| 3. OAuth 登录流程 | ⬜ | **核心测试** |
| 4. Token 存储验证 | ⬜ | |
| 5. 登录后获取用户信息 | ⬜ | |
| 6. 登出功能 | ⬜ | |

---

## 🐛 常见问题排查

### 问题 1：OAuth 窗口打开后报错 "redirect_uri_mismatch"

**原因**：Supabase 的 Redirect URL 配置不正确

**解决**：
1. 确认扩展 ID 正确
2. 确认 Redirect URL 格式：`https://[扩展ID].chromiumapp.org/`
3. 确认在 Supabase Dashboard 中已保存

---

### 问题 2：登录成功但 "获取用户信息失败"

**原因**：后端 API 可能不支持 Bearer Token

**解决**：
1. 检查 `/api/user/profile` 是否支持 Bearer Token 认证
2. 查看 Network 标签中的 API 响应
3. 如果返回 401，需要修改后端 API（下一阶段处理）

**临时验证**：登录成功，Token 存储正确，就算通过

---

### 问题 3：Service Worker 不活跃（inactive）

**原因**：Service Worker 闲置后会自动休眠

**解决**：
1. 点击 "service worker" 链接重新激活
2. 或者在扩展中触发任何操作

---

## ✅ 阶段完成标准

只要以下测试通过，就可以进入下一阶段：

- [x] 测试 3：OAuth 登录流程成功
- [x] 测试 4：Token 正确存储
- [x] 测试 6：登出功能正常

**如果所有测试通过，标记为：✅ 阶段 2.1 完成**

---

## 📝 测试记录

**测试人**：__________
**测试时间**：__________
**扩展 ID**：__________
**测试结果**：⬜ 全部通过 / ⬜ 部分失败 / ⬜ 全部失败

**失败的测试项**（如有）：
- [ ]

**问题描述**：


**下一步行动**：


---

**准备好测试了吗？** 🧪
