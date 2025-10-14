# 🚀 Chrome 扩展 OAuth 独立登录 - 完整实施计划

## 📊 项目概览

- **目标**：实现 Chrome 扩展独立的 OAuth 登录功能
- **认证方式**：Supabase Auth + Google OAuth
- **预计时间**：4-6 小时
- **当前状态**：✅ 配置和认证模块已完成

---

## ✅ 已完成的任务

- [x] 创建配置文件 `config.js`
- [x] 更新 `manifest.json` 添加 `identity` 权限
- [x] 创建 OAuth 认证模块 `auth.js`

---

## 📋 剩余任务清单

### 🎯 阶段 1：环境配置（30 分钟）

#### ✅ 已完成
- 扩展配置文件创建
- Manifest 权限更新

#### ⏳ 待完成
- [ ] **配置 Supabase OAuth Redirect URI**

  **操作步骤**：
  1. 打开 https://supabase.com/dashboard/project/zjefhzapfbouslkgllah
  2. 导航到：`Authentication` → `URL Configuration`
  3. 获取当前扩展 ID：
     - 打开 `chrome://extensions/`
     - 找到 "Sora Video Downloader" 扩展
     - 复制扩展 ID（类似：`abcdefghijklmnopqrstuvwxyz123456`）
  4. 在 Supabase 的 `Redirect URLs` 中添加：
     ```
     https://[扩展ID].chromiumapp.org/
     ```
  5. 点击 Save

  **⚠️ 重要**：
  - 开发环境的扩展 ID 每次加载会变化
  - 发布后的扩展 ID 是固定的
  - 两个都需要配置

---

### 🔧 阶段 2：更新 Background Script（1 小时）

#### 任务 2.1：集成 OAuth 模块到 background.js

需要修改 `background.js`，集成新创建的 `auth.js` 模块。

**修改要点**：
1. 导入 OAuth 模块
2. 添加登录/登出消息处理
3. 修改 `getUserInfo()` 使用 OAuth token
4. 修改 `processVideo()` 使用 OAuth token

**具体代码**见下方"代码实现"部分。

---

### 🎨 阶段 3：更新 Popup UI（1 小时）

#### 任务 3.1：更新 popup.html

添加登录界面，支持 Google 和 GitHub 登录。

**新增元素**：
- 登录状态区域
- Google 登录按钮
- GitHub 登录按钮（可选）
- 登出按钮

#### 任务 3.2：更新 popup.js

实现登录/登出逻辑。

#### 任务 3.3：添加登录按钮样式

创建 Google 和 GitHub 登录按钮的样式和图标。

---

### 🌐 阶段 4：后端 API 适配（30 分钟）

#### 任务 4.1：修改 `/api/user/profile/route.ts`

确保支持 Bearer Token 认证。

**关键代码**：
```typescript
const authHeader = request.headers.get('authorization');
if (authHeader?.startsWith('Bearer ')) {
  const token = authHeader.substring(7);
  // 使用 token 验证用户
}
```

#### 任务 4.2：修改 `/api/video/process/route.ts`

同样支持 Bearer Token。

---

### 🧪 阶段 5：测试验证（1 小时）

#### 测试清单：

- [ ] **测试 1：OAuth 登录流程**
  1. 重新加载扩展
  2. 打开 popup
  3. 点击"使用 Google 登录"
  4. 完成 Google 授权
  5. 验证返回扩展后显示用户信息

- [ ] **测试 2：用户信息显示**
  1. 检查 popup 显示用户名、邮箱、头像
  2. 检查积分显示正确

- [ ] **测试 3：视频下载功能**
  1. 访问 https://sora.chatgpt.com
  2. 找到视频
  3. 点击下载按钮
  4. 验证 API 调用携带正确的 Bearer Token
  5. 验证视频成功下载

- [ ] **测试 4：Token 刷新**
  1. 修改 `EXPIRES_AT` 到过去的时间
  2. 重新打开 popup
  3. 验证 token 自动刷新

- [ ] **测试 5：登出功能**
  1. 点击登出按钮
  2. 验证返回登录界面
  3. 验证 storage 中的 token 被清除

---

### 🎁 阶段 6：优化和发布（30 分钟）

#### 任务 6.1：错误处理

- [ ] 添加网络错误提示
- [ ] 添加登录失败提示
- [ ] 添加 Token 过期提示

#### 任务 6.2：用户体验优化

- [ ] 添加加载动画
- [ ] 优化按钮禁用状态
- [ ] 添加登录成功提示

#### 任务 6.3：准备发布

- [ ] 更新版本号到 2.0.0
- [ ] 更新 README.md
- [ ] 准备 Chrome Web Store 截图
- [ ] 编写更新日志

---

## 📝 详细代码实现

### 1. 更新 background.js

在文件开头添加：

```javascript
import {
  loginWithOAuth,
  logout,
  getUserInfo,
  getValidAccessToken,
} from './auth.js';
```

修改消息监听器：

```javascript
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('📨 收到消息:', request);

  // 登录
  if (request.action === 'login') {
    loginWithOAuth(request.provider || 'google')
      .then((result) => {
        sendResponse(result);
      })
      .catch((error) => {
        sendResponse({
          success: false,
          error: error.message || '登录失败',
        });
      });
    return true; // 保持消息通道开启
  }

  // 登出
  if (request.action === 'logout') {
    logout().then(() => {
      sendResponse({ success: true });
    });
    return true;
  }

  // 获取用户信息
  if (request.action === 'getUserInfo') {
    getUserInfo().then(sendResponse);
    return true;
  }

  // 下载视频
  if (request.action === 'download') {
    handleDownload(request.shareLink).then(sendResponse);
    return true;
  }
});
```

修改 `processVideo()` 函数：

```javascript
async function processVideo(shareLink, visitorId) {
  console.log('🔄 调用 API 处理视频...');

  try {
    // 1. 获取有效的 Access Token
    const token = await getValidAccessToken();

    // 2. 构建请求头
    const headers = {
      'Content-Type': 'application/json',
    };

    // 3. 如果已登录，添加 Bearer Token
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('🔐 使用 OAuth Token');
    } else {
      console.log('👤 访客模式');
    }

    const response = await fetch(CONFIG.API_URL, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        shareLink: shareLink,
        visitorId: visitorId,
      }),
      signal: controller.signal,
    });

    // ... 后续代码保持不变
  } catch (error) {
    // ... 错误处理
  }
}
```

### 2. 更新 popup.html

添加登录界面：

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Sora Video Downloader</title>
  <link rel="stylesheet" href="popup.css">
</head>
<body>
  <div class="container">
    <!-- 加载状态 -->
    <div id="loading-state" class="state">
      <div class="spinner"></div>
      <p>加载中...</p>
    </div>

    <!-- 未登录状态 -->
    <div id="login-state" class="state" style="display: none;">
      <div class="header">
        <img src="icons/icon48.png" alt="Logo" class="logo">
        <h2>Sora Video Downloader</h2>
        <p class="subtitle">去除 Sora 视频水印</p>
      </div>

      <div class="login-section">
        <p class="login-prompt">请选择登录方式：</p>

        <button id="login-google" class="btn btn-google">
          <svg class="icon" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span>使用 Google 登录</span>
        </button>

        <p class="hint">
          💡 与网站 <a href="https://www.sora-prompt.io" target="_blank">www.sora-prompt.io</a> 共享账号
        </p>
      </div>
    </div>

    <!-- 已登录状态 -->
    <div id="user-state" class="state" style="display: none;">
      <div class="user-header">
        <div id="user-avatar" class="avatar">
          <svg width="48" height="48" viewBox="0 0 48 48">
            <circle cx="24" cy="24" r="24" fill="#4CAF50"/>
            <text x="24" y="30" text-anchor="middle" fill="white" font-size="20" font-weight="600">U</text>
          </svg>
        </div>
        <div class="user-details">
          <div id="user-name" class="name">用户</div>
          <div id="user-email" class="email">user@example.com</div>
        </div>
      </div>

      <div class="credits-card">
        <div class="credits-label">剩余免费次数</div>
        <div id="user-credits" class="credits-value">0</div>
      </div>

      <div class="actions">
        <button id="recharge-button" class="btn btn-primary">前往充值</button>
        <button id="logout-button" class="btn btn-secondary">登出</button>
      </div>
    </div>

    <!-- 错误状态 -->
    <div id="error-state" class="state" style="display: none;">
      <div class="error-icon">⚠️</div>
      <p id="error-message" class="error-text">加载失败</p>
      <button id="retry-button" class="btn btn-secondary">重试</button>
    </div>
  </div>

  <script type="module" src="popup.js"></script>
</body>
</html>
```

### 3. 更新 popup.js

```javascript
console.log('🎬 Popup 已加载');

// DOM 元素
const loadingState = document.getElementById('loading-state');
const loginState = document.getElementById('login-state');
const userState = document.getElementById('user-state');
const errorState = document.getElementById('error-state');

const loginGoogleBtn = document.getElementById('login-google');
const logoutBtn = document.getElementById('logout-button');
const rechargeBtn = document.getElementById('recharge-button');
const retryBtn = document.getElementById('retry-button');

// 初始化
document.addEventListener('DOMContentLoaded', async () => {
  await loadUserInfo();
});

/**
 * 加载用户信息
 */
async function loadUserInfo() {
  try {
    showState('loading');

    const response = await chrome.runtime.sendMessage({
      action: 'getUserInfo',
    });

    if (!response || !response.success) {
      throw new Error(response?.error || '获取用户信息失败');
    }

    if (response.isLoggedIn) {
      displayLoggedInUser(response);
    } else {
      displayLoginScreen();
    }
  } catch (error) {
    console.error('❌ 加载用户信息失败:', error);
    showError('加载失败: ' + error.message);
  }
}

/**
 * 显示登录界面
 */
function displayLoginScreen() {
  showState('login');
}

/**
 * 显示已登录用户
 */
function displayLoggedInUser(data) {
  document.getElementById('user-name').textContent = data.name || '用户';
  document.getElementById('user-email').textContent = data.email || '-';
  document.getElementById('user-credits').textContent = data.credits || 0;

  const avatarContainer = document.getElementById('user-avatar');
  if (data.avatarUrl) {
    avatarContainer.innerHTML = `<img src="${data.avatarUrl}" alt="Avatar" style="width: 48px; height: 48px; border-radius: 50%;" />`;
  } else {
    const initial = (data.name || 'U')[0].toUpperCase();
    avatarContainer.innerHTML = `
      <svg width="48" height="48" viewBox="0 0 48 48">
        <circle cx="24" cy="24" r="24" fill="#4CAF50"/>
        <text x="24" y="30" text-anchor="middle" fill="white" font-size="20" font-weight="600">
          ${initial}
        </text>
      </svg>
    `;
  }

  showState('user');
}

/**
 * 切换显示状态
 */
function showState(state) {
  loadingState.style.display = 'none';
  loginState.style.display = 'none';
  userState.style.display = 'none';
  errorState.style.display = 'none';

  switch (state) {
    case 'loading':
      loadingState.style.display = 'flex';
      break;
    case 'login':
      loginState.style.display = 'flex';
      break;
    case 'user':
      userState.style.display = 'flex';
      break;
    case 'error':
      errorState.style.display = 'flex';
      break;
  }
}

/**
 * 显示错误信息
 */
function showError(message) {
  document.getElementById('error-message').textContent = message;
  showState('error');
}

// ========== 事件监听 ==========

// Google 登录
loginGoogleBtn?.addEventListener('click', async () => {
  console.log('🔐 点击 Google 登录');
  loginGoogleBtn.disabled = true;
  loginGoogleBtn.innerHTML = '<span>登录中...</span>';

  try {
    const response = await chrome.runtime.sendMessage({
      action: 'login',
      provider: 'google',
    });

    if (response.success) {
      console.log('✅ 登录成功');
      // 1 秒后重新加载用户信息
      setTimeout(() => {
        loadUserInfo();
      }, 1000);
    } else {
      throw new Error(response.error || '登录失败');
    }
  } catch (error) {
    console.error('❌ 登录失败:', error);
    alert('登录失败: ' + error.message);
    loginGoogleBtn.disabled = false;
    loginGoogleBtn.innerHTML = '<svg class="icon">...</svg><span>使用 Google 登录</span>';
  }
});

// 登出
logoutBtn?.addEventListener('click', async () => {
  if (confirm('确定要登出吗？')) {
    console.log('👋 登出');
    await chrome.runtime.sendMessage({ action: 'logout' });
    displayLoginScreen();
  }
});

// 充值
rechargeBtn?.addEventListener('click', () => {
  chrome.tabs.create({ url: 'https://www.sora-prompt.io/pricing' });
});

// 重试
retryBtn?.addEventListener('click', () => {
  loadUserInfo();
});

console.log('✅ Popup 初始化完成');
```

---

## 🎯 下一步行动

1. **立即行动**：
   - [ ] 配置 Supabase Redirect URI
   - [ ] 修改 background.js 集成 OAuth 模块
   - [ ] 更新 popup.html 和 popup.js

2. **测试验证**：
   - [ ] 重新加载扩展
   - [ ] 测试 Google 登录流程
   - [ ] 验证用户信息显示

3. **后端适配**（如果需要）：
   - [ ] 确认 `/api/user/profile` 支持 Bearer Token
   - [ ] 确认 `/api/video/process` 支持 Bearer Token

---

## 📞 需要帮助？

如果遇到问题，按以下顺序排查：

1. **OAuth 流程失败**：
   - 检查 Supabase Redirect URI 是否正确配置
   - 检查扩展 ID 是否匹配
   - 查看 background service worker 控制台日志

2. **Token 无法刷新**：
   - 检查 Refresh Token 是否存在
   - 检查 Supabase API 响应

3. **用户信息获取失败**：
   - 检查后端 API 是否支持 Bearer Token
   - 检查 CORS 配置

---

## ✅ 验收标准

项目完成的标志：

- [ ] 用户可以在扩展中使用 Google 账号登录
- [ ] 登录后显示用户名、邮箱、头像、积分
- [ ] Token 自动刷新，无需频繁登录
- [ ] 视频下载功能正常工作
- [ ] 登出功能正常
- [ ] 错误处理完善，用户体验良好

---

**预计完成时间**：今天（4-6 小时集中开发）

**当前进度**：30% ✅
