# Chrome 扩展登录状态检测流程分析

## 当前问题

扩展显示"访客用户"而不是已登录的用户信息（李李李）

## 完整流程（带注释）

### 1️⃣ Popup 页面加载 (popup.js)

```javascript
// popup.js 第 15-18 行
document.addEventListener('DOMContentLoaded', async () => {
  console.log('📋 初始化 Popup');
  await loadUserInfo();  // 调用加载用户信息函数
});
```

**步骤**：
- Popup 页面打开时触发 DOMContentLoaded 事件
- 调用 `loadUserInfo()` 函数

---

### 2️⃣ 向 Background 发送消息 (popup.js)

```javascript
// popup.js 第 23-30 行
async function loadUserInfo() {
  try {
    showState('loading');  // 显示加载状态

    // ⚠️ 关键步骤：向 background script 发送消息
    const response = await chrome.runtime.sendMessage({
      action: 'getUserInfo'
    });

    if (!response || !response.success) {
      throw new Error(response?.error || '获取用户信息失败');
    }

    // 根据返回结果决定显示哪个界面
    if (response.isLoggedIn) {
      displayLoggedInUser(response);  // 显示登录用户信息
    } else {
      displayGuestUser(response);     // 显示访客信息 ⬅️ 当前走到这里
    }
  } catch (error) {
    console.error('❌ 加载用户信息失败:', error);
    showError('加载失败: ' + error.message);
  }
}
```

**步骤**：
- Popup 向 Background Script 发送 `getUserInfo` 消息
- 等待 Background 返回用户信息
- 根据 `isLoggedIn` 字段判断显示哪个状态

---

### 3️⃣ Background 接收消息 (background.js)

```javascript
// background.js 第 375-391 行
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('📨 收到消息:', request);

  // 处理 getUserInfo 消息
  if (request.action === 'getUserInfo') {
    getUserInfo().then(sendResponse);  // ⚠️ 调用 getUserInfo 函数
    return true; // 保持消息通道开启
  }

  // ... 其他消息处理
});
```

**步骤**：
- Background Script 监听所有消息
- 收到 `getUserInfo` 消息后调用 `getUserInfo()` 函数
- 将结果通过 `sendResponse` 返回给 Popup

---

### 4️⃣ 检测登录状态 - 读取 Cookie (background.js)

```javascript
// background.js 第 231-244 行
async function getUserInfo() {
  try {
    // 🔍 步骤 1: 读取 Supabase Auth Cookie
    const authCookie = await getSupabaseAuthCookie();

    if (!authCookie) {
      // ❌ 没有找到 Auth Cookie - 判定为未登录
      // 返回访客信息
      const visitorCredits = await getVisitorCreditsCookie();
      return {
        success: true,
        isLoggedIn: false,  // ⚠️ 关键字段：false 表示未登录
        credits: visitorCredits?.credits || 1,
      };
    }

    // ✅ 找到 Auth Cookie - 继续处理登录用户逻辑...
  }
}
```

**步骤**：
- 调用 `getSupabaseAuthCookie()` 读取认证 Cookie
- 如果没有 Cookie，直接返回 `isLoggedIn: false`
- 这就是为什么显示"访客用户"的原因！

---

### 5️⃣ 读取 Cookie 的实现 (background.js)

```javascript
// background.js 第 53-72 行
async function getSupabaseAuthCookie() {
  try {
    // 🔍 从 https://www.sora-prompt.io 域名下读取 Cookie
    const cookie = await chrome.cookies.get({
      url: 'https://www.sora-prompt.io',
      name: 'sb-zjefhzapfbouslkgllah-auth-token'
    });

    if (cookie && cookie.value) {
      console.log('✅ 检测到登录状态');
      return cookie.value;  // 返回 Cookie 值（JWT Token）
    }

    console.log('ℹ️ 未登录状态');
    return null;  // ⚠️ 当前返回 null，表示没找到 Cookie
  } catch (error) {
    console.error('❌ 读取 Auth Cookie 失败:', error);
    return null;
  }
}
```

**步骤**：
- 使用 `chrome.cookies.get()` API 读取指定域名和名称的 Cookie
- 如果找到，返回 Cookie 值
- **如果找不到，返回 null** ⬅️ 当前情况

---

### 6️⃣ 如果找到 Cookie - 调用 API 获取详细信息 (background.js)

```javascript
// background.js 第 246-289 行
async function getUserInfo() {
  // ... 前面的代码 ...

  // ✅ 步骤 2: 解析 Token 获取基本信息
  const userData = parseAuthToken(authCookie);

  if (!userData) {
    return {
      success: false,
      error: '无法解析用户信息',
    };
  }

  // ✅ 步骤 3: 调用 /api/user/profile 获取完整信息
  let credits = 0;
  let fullName = null;
  let avatarUrl = null;

  try {
    // ⚠️ 问题点：从扩展的 background 发起 fetch
    const response = await fetch('https://www.sora-prompt.io/api/user/profile', {
      method: 'GET',
      credentials: 'include',  // ❌ 这个在扩展中不起作用！
    });

    if (response.ok) {
      const data = await response.json();
      credits = data.credits || 0;
      fullName = data.name;
      avatarUrl = data.avatar_url;
      console.log('✅ API 调用成功:', data);
    } else {
      console.warn('⚠️ API 返回错误:', response.status);
    }
  } catch (error) {
    console.warn('⚠️ API 调用失败，使用 Token 中的信息:', error.message);
  }

  // ✅ 步骤 4: 返回完整的用户信息
  return {
    success: true,
    isLoggedIn: true,  // ✅ 已登录
    name: fullName || userData.user_metadata?.full_name || userData.email?.split('@')[0] || '用户',
    email: userData.email,
    avatarUrl: avatarUrl || userData.user_metadata?.avatar_url,
    credits: credits,
  };
}
```

**步骤**：
1. 解析 JWT Token 获取基本用户信息（邮箱、用户ID等）
2. 调用 `/api/user/profile` API 获取完整信息（名字、头像、积分）
3. 合并两者的信息，优先使用 API 返回的数据
4. 返回完整的用户信息对象

**⚠️ 重要问题**：
- 第 263 行的 `credentials: 'include'` 在 Chrome 扩展的 background service worker 中**不起作用**
- Background service worker 无法自动携带网站的 Cookie
- 这就是为什么 API 调用会返回 401（未登录）

---

## 🔴 当前问题诊断

### 问题 1: Chrome Cookies API 无法读取到 Cookie

**可能原因**：
1. ❌ Cookie 的域名不匹配
2. ❌ Cookie 是 HttpOnly 的，扩展无法读取
3. ❌ 扩展的 manifest.json 缺少必要的权限
4. ❌ Cookie 名称错误
5. ❌ 浏览器没有存储 Cookie（用户实际未登录）

**验证方法**：
1. 打开扩展的 background service worker 控制台
2. 手动执行：
   ```javascript
   chrome.cookies.get({
     url: 'https://www.sora-prompt.io',
     name: 'sb-zjefhzapfbouslkgllah-auth-token'
   }).then(console.log)
   ```
3. 查看返回结果

---

### 问题 2: API 调用无法携带 Cookie

**原因**：
- Chrome 扩展的 background service worker 发起的 fetch 请求无法自动携带目标域名的 Cookie
- `credentials: 'include'` 只对同域请求有效

**解决方案**：
- 需要手动在请求头中添加 Cookie
- 修改第 263-266 行的代码：

```javascript
// ❌ 错误的方式（当前代码）
const response = await fetch('https://www.sora-prompt.io/api/user/profile', {
  method: 'GET',
  credentials: 'include',  // 不起作用
});

// ✅ 正确的方式
const response = await fetch('https://www.sora-prompt.io/api/user/profile', {
  method: 'GET',
  headers: {
    'Cookie': `sb-zjefhzapfbouslkgllah-auth-token=${authCookie}`
  }
});
```

---

## 🔧 下一步调试步骤

1. **打开扩展的控制台**：
   - 进入 `chrome://extensions/`
   - 找到 "Sora Video Downloader"
   - 点击 "service worker" 旁边的"检查视图"
   - 查看控制台日志

2. **查找关键日志**：
   - `✅ 检测到登录状态` - 说明 Cookie 读取成功
   - `ℹ️ 未登录状态` - 说明 Cookie 读取失败 ⬅️ 当前情况
   - `✅ API 调用成功` - 说明 API 调用成功
   - `⚠️ API 返回错误` - 说明 API 返回 4xx/5xx 错误

3. **手动测试 Cookie 读取**：
   在控制台中执行：
   ```javascript
   chrome.cookies.get({
     url: 'https://www.sora-prompt.io',
     name: 'sb-zjefhzapfbouslkgllah-auth-token'
   }).then(cookie => {
     console.log('Cookie:', cookie);
     if (cookie) {
       console.log('✅ 找到 Cookie');
     } else {
       console.log('❌ 未找到 Cookie');
     }
   });
   ```

4. **检查浏览器的 Cookie**：
   - 在 `https://www.sora-prompt.io` 页面按 F12
   - 进入 Application -> Cookies
   - 查找 `sb-zjefhzapfbouslkgllah-auth-token`
   - 检查其属性（Domain, Path, HttpOnly, Secure, SameSite）

---

## 📝 总结

### 完整流程：

```
Popup 打开
  ↓
发送 getUserInfo 消息
  ↓
Background 接收消息
  ↓
调用 getSupabaseAuthCookie()
  ↓
chrome.cookies.get() 读取 Cookie
  ↓
【当前卡在这里】返回 null
  ↓
判定为未登录
  ↓
返回 { isLoggedIn: false }
  ↓
Popup 显示"访客用户"
```

### 预期流程：

```
Popup 打开
  ↓
发送 getUserInfo 消息
  ↓
Background 接收消息
  ↓
调用 getSupabaseAuthCookie()
  ↓
chrome.cookies.get() 读取 Cookie
  ↓
✅ 返回 Cookie 值（JWT Token）
  ↓
解析 Token 获取用户基本信息
  ↓
调用 /api/user/profile（手动携带 Cookie）
  ↓
API 返回完整用户信息
  ↓
返回 { isLoggedIn: true, name: '李李李', ... }
  ↓
Popup 显示用户信息和头像
```
