# Chrome 插件产品需求文档（PRD）

## 文档信息
- **项目名称**: 去水印浏览器插件
- **版本**: V1.0
- **创建日期**: 2025-01-16
- **目标平台**: Chrome / Edge 浏览器
- **依赖项目**: 网页版去水印系统

---

## 一、产品概述

### 1.1 产品定位
为网页版去水印工具提供浏览器插件版本，用户可以在浏览 Sora 视频时直接点击插件按钮下载无水印视频。

### 1.2 核心价值
- **便捷性**: 无需复制链接到网页版，直接在视频页面一键下载
- **一致性**: 与网页版共享账号系统和积分系统
- **独立性**: 插件独立登录，不依赖网页版 Cookie

### 1.3 用户流程（核心闭环）
```
安装插件 → Google 登录 → 浏览 Sora 视频 → 点击下载按钮 →
调用 API 去水印 → 下载视频（扣除积分）→ 积分不足 →
跳转网页版充值 → 充值完成 → 关闭页面 → 积分自动刷新
```

---

## 二、功能需求详解

### 2.1 用户登录（Google OAuth）

#### 功能描述
用户首次使用插件时，需要通过 Google 账号登录，登录成功后获取 access_token 并保存到本地。

#### 技术实现方案

**方案 1: 使用 Supabase Auth SDK + Chrome Identity API（推荐）**

```javascript
// 1. 在 background.js 中实现登录逻辑
import { createClient } from '@supabase/supabase-js'

// 自定义 storage adapter（必须）
const chromeLocalStorage = {
  getItem: async (key) => {
    return new Promise((resolve) => {
      chrome.storage.local.get([key], (result) => {
        resolve(result[key] || null)
      })
    })
  },
  setItem: async (key, value) => {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [key]: value }, () => {
        resolve()
      })
    })
  },
  removeItem: async (key) => {
    return new Promise((resolve) => {
      chrome.storage.local.remove([key], () => {
        resolve()
      })
    })
  }
}

// 创建 Supabase 客户端
const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      storage: chromeLocalStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false
    }
  }
)

// Google 登录流程
async function loginWithGoogle() {
  const redirectURL = chrome.identity.getRedirectURL('oauth')

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectURL,
      skipBrowserRedirect: true // 重要！
    }
  })

  if (error) {
    console.error('登录失败:', error)
    return
  }

  // 使用 chrome.identity.launchWebAuthFlow 打开 OAuth 页面
  chrome.identity.launchWebAuthFlow(
    {
      url: data.url,
      interactive: true
    },
    async (redirectUrl) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError)
        return
      }

      // 从 redirectUrl 中提取 token
      const url = new URL(redirectUrl)
      const access_token = url.searchParams.get('access_token')
      const refresh_token = url.searchParams.get('refresh_token')

      if (access_token && refresh_token) {
        // 设置 session
        const { data: session, error } = await supabase.auth.setSession({
          access_token,
          refresh_token
        })

        if (!error) {
          console.log('登录成功:', session.user)
          // 保存到本地存储
          await chrome.storage.local.set({
            'supabase.auth.token': JSON.stringify({
              access_token,
              refresh_token,
              user: session.user
            })
          })
        }
      }
    }
  )
}
```

#### 前置条件（重要！）

**1. Supabase 配置**
- 登录 Supabase Dashboard
- 进入 Authentication → URL Configuration
- 添加 Redirect URL: `chrome-extension://{extension_id}/oauth.html`
- 获取 extension_id: 上传插件到 Chrome Web Store 后获得

**2. manifest.json 配置**
```json
{
  "manifest_version": 3,
  "permissions": [
    "identity",
    "storage"
  ],
  "oauth2": {
    "client_id": "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com",
    "scopes": ["openid", "email", "profile"]
  },
  "key": "YOUR_EXTENSION_KEY"
}
```

**3. Google Cloud Console 配置**
- 创建 OAuth 2.0 客户端 ID
- 应用类型: **Chrome 扩展程序**
- 应用 ID: 你的插件 ID
- 授权的重定向 URI: `https://{extension_id}.chromiumapp.org/`

#### UI 设计

**popup.html - 未登录状态**
```
┌─────────────────────────────┐
│   🎬 Sora 去水印工具        │
├─────────────────────────────┤
│                             │
│   🔐 登录后即可使用          │
│                             │
│  ┌───────────────────────┐  │
│  │  🔵 使用 Google 登录  │  │
│  └───────────────────────┘  │
│                             │
│   登录即送 1 积分            │
│                             │
└─────────────────────────────┘
```

#### 注意事项
1. **extension_id 问题**: 开发阶段 extension_id 会变化，建议尽早上传到 Chrome Web Store 获取稳定 ID
2. **CORS 问题**: 确保 Supabase 允许插件来源的请求
3. **Token 刷新**: Supabase SDK 会自动处理 token 刷新
4. **错误处理**: 登录失败需要给用户明确提示

---

### 2.2 积分查询

#### 功能描述
登录成功后，自动查询用户积分并显示在 popup 页面。

#### Token 机制说明

**⚠️ 重要：插件和网页版使用独立的 token**

##### Token 来源区别

| 项目 | 网页版 | 插件版 | 是否相同 |
|------|--------|--------|----------|
| 存储位置 | `localStorage` | `chrome.storage.local` | ❌ 不同 |
| Token 值 | `eyJhbGc...AAA` | `eyJhbGc...BBB` | ❌ 不同 |
| 用户 ID | `123e4567...` | `123e4567...` | ✅ 相同 |
| 用户邮箱 | `user@gmail.com` | `user@gmail.com` | ✅ 相同 |
| 积分数据 | 从 `user_profiles` 查询 | 从 `user_profiles` 查询 | ✅ 相同 |

##### 为什么是独立的 token？

1. **存储位置不同**：
   - 网页版使用 `localStorage`（浏览器标准 API）
   - 插件使用 `chrome.storage.local`（Chrome 扩展 API）
   - 两者**无法互相访问**（Chrome 安全机制）

2. **登录流程不同**：
   - 网页版使用网页的 OAuth 重定向流程
   - 插件使用 `chrome.identity.launchWebAuthFlow`
   - 虽然都是 Google OAuth，但**生成的 token 不同**

3. **但用户是同一个**：
   ```javascript
   // 网页版登录
   { user: { id: "123e4567...", email: "user@gmail.com" } }

   // 插件登录（同一个 Google 账号）
   { user: { id: "123e4567...", email: "user@gmail.com" } }

   // ✅ Supabase 通过 user.id 关联同一个用户档案！
   ```

##### 数据库共享机制

```
用户通过 Google 登录网页版
  ↓
Supabase 创建用户：id = "123e4567..."
  ↓
user_profiles 表插入记录：id = "123e4567...", credits = 50
  ↓
用户通过 Google 登录插件（同一个 Google 账号）
  ↓
Supabase 识别已存在的用户：id = "123e4567..."
  ↓
插件查询 user_profiles：SELECT * FROM user_profiles WHERE id = "123e4567..."
  ↓
✅ 查询到同一条记录！积分数据共享！
```

#### API 调用

**接口**: `GET /api/user/profile`

**请求示例**:
```javascript
async function fetchUserProfile() {
  // 从本地获取 token（插件的独立 token）
  const { 'supabase.auth.token': tokenData } = await chrome.storage.local.get(['supabase.auth.token'])
  const { access_token } = JSON.parse(tokenData)

  const response = await fetch('https://yourdomain.com/api/user/profile', {
    headers: {
      'Authorization': `Bearer ${access_token}`,  // ← 这是插件的 token
      'Content-Type': 'application/json'
    }
  })

  if (!response.ok) {
    // 处理错误
    const error = await response.json()
    console.error('积分查询失败:', error)

    // 401 = token 过期，需要重新登录
    if (response.status === 401) {
      await logout()
      return
    }

    throw new Error(error.error.message)
  }

  const data = await response.json()
  // data = { id, email, name, avatar_url, credits }

  return data
}
```

**流程说明**:
```
1. 从 chrome.storage.local 获取插件的 access_token
   ↓
2. 用这个 token 调用网页版的 API
   ↓
3. 网页版 API 接收到 Bearer Token
   ↓
4. 调用 supabase.auth.getUser(token) 验证 token
   ↓
5. 返回 user.id = "123e4567..."
   ↓
6. 查询数据库：SELECT * FROM user_profiles WHERE id = "123e4567..."
   ↓
7. 返回积分数据（与网页版共享同一条记录）
```

#### Token 存储键名建议

根据 Supabase 文档，推荐使用以下键名：

```javascript
// 推荐方案（统一键名）
const STORAGE_KEY = 'supabase.auth.token'

// 使用示例
async function saveSession(session) {
  await chrome.storage.local.set({
    [STORAGE_KEY]: JSON.stringify(session)
  })
}

async function getAccessToken() {
  const result = await chrome.storage.local.get([STORAGE_KEY])
  const sessionData = result[STORAGE_KEY]

  if (!sessionData) return null

  const session = JSON.parse(sessionData)
  return session.access_token
}
```

#### 网页版 API 准备工作

**需要修改**: `app/api/user/profile/route.ts`

**添加插件 CORS 支持**:
```typescript
// 当前配置
const ALLOWED_ORIGINS = [
  'https://www.sora-prompt.io'
]

// 修改为
const ALLOWED_ORIGINS = [
  'https://www.sora-prompt.io',
]

function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false
  // 允许插件来源
  if (origin.startsWith('chrome-extension://')) return true
  return ALLOWED_ORIGINS.includes(origin)
}
```

#### UI 设计

**popup.html - 已登录状态**
```
┌─────────────────────────────┐
│   🎬 Sora 去水印工具        │
├─────────────────────────────┤
│  👤 张三 (user@gmail.com)   │
│  💎 积分: 50                │
│                             │
│  ┌───────────────────────┐  │
│  │   💰 充值积分          │  │
│  └───────────────────────┘  │
│                             │
│  ┌───────────────────────┐  │
│  │   🚪 退出登录          │  │
│  └───────────────────────┘  │
│                             │
│  💡 在 Sora 视频页面点击    │
│     插件图标即可下载         │
└─────────────────────────────┘
```

#### 注意事项
1. **自动刷新**: 每次打开 popup 都应该重新查询积分
2. **缓存策略**: 可以缓存 30 秒，避免频繁请求
3. **错误处理**: token 过期（401）需要重新登录
4. **首次登录送积分**: API 已支持，自动创建用户档案时送 0 积分（需要后端修改默认值）

---

### 2.3 退出登录

#### 功能描述
用户点击退出按钮，清除本地存储的 token 和用户信息。

#### 实现代码
```javascript
async function logout() {
  // 1. 调用 Supabase 登出
  await supabase.auth.signOut()

  // 2. 清除本地存储
  await chrome.storage.local.clear()

  // 3. 刷新 popup 页面
  window.location.reload()
}
```

#### UI 交互
- 点击"退出登录"按钮
- 显示确认对话框: "确定要退出登录吗？"
- 确认后执行登出逻辑
- 页面自动刷新，显示登录界面

---

### 2.4 页面按钮注入（Sora 视频页面）

#### 功能描述
在用户访问 Sora 视频页面时，自动在页面上注入"下载无水印"按钮。

#### 技术实现方案

**1. Content Script 注入**

**manifest.json 配置**:
```json
{
  "content_scripts": [
    {
      "matches": [
        "https://sora.com/*",
        "https://*.sora.com/*",
        "*://*/explore/video/*"
      ],
      "js": ["content.js"],
      "css": ["content.css"],
      "run_at": "document_idle"
    }
  ]
}
```

**2. 真实页面 DOM 结构分析**

根据实际页面分析（2025-01-16），Sora 视频页面的 DOM 结构如下：

```html
<!-- "Remixes" 元素位置 -->
<div class="flex w-full items-center justify-between gap-9">
  <span class="text-token text-secondary">Remixes</span>
  <div class="flex w-fit items-center justify-end gap-9">
    <!-- 缩略图列表 -->
  </div>
</div>
```

**父容器**:
```html
<div class="-mb-3 overflow-x-auto pb-3">
  <!-- Remixes 容器 -->
</div>
```

**3. 准确的元素查找策略**

基于真实 DOM 结构，使用以下三种查找方案：

```javascript
// 方案 1：通过 "Remixes" 文字精确查找（最准确）
function findInjectionPoint() {
  const remixesSpan = [...document.querySelectorAll('span')].find(span => {
    const text = span.textContent?.trim()
    return text === 'Remixes'
  })

  if (remixesSpan) {
    // 获取它的父容器
    const container = remixesSpan.closest('.flex.w-full.items-center.justify-between')
    if (container) {
      return container
    }
    // 备选：直接返回 span 的父元素
    return remixesSpan.parentElement
  }

  // 方案 2：通过 class 查找容器
  const containers = document.querySelectorAll('.flex.w-full.items-center.justify-between')
  for (const container of containers) {
    if (container.textContent?.includes('Remixes')) {
      return container
    }
  }

  // 方案 3：查找包含 "Remixes" 的任何容器（兜底）
  const allElements = document.querySelectorAll('*')
  for (const el of allElements) {
    const text = el.textContent?.trim()
    if (text === 'Remixes' || text?.startsWith('Remixes')) {
      return el.parentElement || el
    }
  }

  return null
}
```

**4. 按钮注入逻辑**

**⚠️ 基于真实 DOM 结构的代码**

```javascript
// content.js

// 检测是否为视频页面
function isVideoPage() {
  // 根据 URL 判断
  const url = window.location.href
  return url.includes('/video/') || url.includes('/explore/')
}

// 查找视频容器（需要根据实际 DOM 结构调整）
function findVideoContainer() {
  // 方案 1: 通过 class 查找
  const container = document.querySelector('.video-container')

  // 方案 2: 通过 ID 查找
  // const container = document.getElementById('video-player')

  // 方案 3: 通过 data 属性查找
  // const container = document.querySelector('[data-video-id]')

  return container
}

// 创建下载按钮
function createDownloadButton() {
  const button = document.createElement('button')
  button.id = 'sora-download-btn'
  button.className = 'sora-download-button'
  button.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 16 16">
      <path d="M8 12l-4-4h3V4h2v4h3l-4 4z"/>
      <path d="M2 14h12v2H2z"/>
    </svg>
    下载无水印
  `

  // 点击事件
  button.addEventListener('click', async () => {
    button.disabled = true
    button.textContent = '处理中...'

    // 获取当前视频链接
    const videoUrl = window.location.href

    // 调用 background script
    chrome.runtime.sendMessage(
      { action: 'downloadVideo', url: videoUrl },
      (response) => {
        button.disabled = false
        button.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 16 16">
            <path d="M8 12l-4-4h3V4h2v4h3l-4 4z"/>
            <path d="M2 14h12v2H2z"/>
          </svg>
          下载无水印
        `

        if (response.success) {
          showNotification('下载成功！', 'success')
          // 自动下载
          downloadFile(response.videoUrl)
        } else {
          showNotification(response.error || '下载失败', 'error')
        }
      }
    )
  })

  return button
}

// 注入按钮到页面
function injectButton() {
  if (!isVideoPage()) return

  // 避免重复注入
  if (document.getElementById('sora-download-btn')) return

  const container = findVideoContainer()
  if (!container) {
    console.log('未找到视频容器，1 秒后重试')
    setTimeout(injectButton, 1000)
    return
  }

  const button = createDownloadButton()

  // 插入位置（需要根据实际 DOM 结构调整）
  // 方案 1: 插入到容器顶部
  container.insertBefore(button, container.firstChild)

  // 方案 2: 插入到特定元素之后
  // const toolbar = container.querySelector('.video-toolbar')
  // toolbar.appendChild(button)

  console.log('下载按钮已注入')
}

// 页面加载完成后注入
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectButton)
} else {
  injectButton()
}

// 监听页面变化（SPA 应用需要）
const observer = new MutationObserver(() => {
  injectButton()
})

observer.observe(document.body, {
  childList: true,
  subtree: true
})
```

**3. 按钮样式**

**content.css**:
```css
.sora-download-button {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 9999;

  display: flex;
  align-items: center;
  gap: 6px;

  padding: 8px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  transition: all 0.3s ease;
}

.sora-download-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.6);
}

.sora-download-button:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
}

.sora-download-button svg {
  fill: currentColor;
}
```

#### 前置条件（必须完成！）

**⚠️ 开发前必须完成以下工作：**

1. **访问目标网页**: 打开 Sora 视频页面
2. **检查 DOM 结构**:
   - 右键 → 检查元素
   - 找到视频播放器的容器元素
   - 记录 class、id 或 data 属性
3. **确定按钮位置**:
   - 确定按钮插入的父元素
   - 确定按钮的绝对/相对位置
4. **测试响应式**: 检查不同屏幕尺寸下的布局

**示例分析步骤**:
```
1. 打开 https://sora.com/video/xxx
2. F12 打开开发者工具
3. 找到视频播放器元素:
   <div class="video-player-container" data-video-id="123">
     <div class="video-controls">
       <button class="play-button">播放</button>
       <!-- 我们的按钮插入到这里 -->
     </div>
   </div>
4. 确定注入位置: .video-controls 的最后一个子元素
```

#### 注意事项
1. **DOM 结构可能变化**: 需要定期检查目标网页是否更新
2. **SPA 应用**: 如果是单页应用，需要监听 URL 变化
3. **样式冲突**: 使用唯一的 class 名称，避免与网页样式冲突
4. **按钮定位**: 使用 `position: absolute` 或 `fixed`，避免影响页面布局

---

### 2.5 视频去水印下载

#### 功能描述
用户点击"下载无水印"按钮后，调用网页版 API 处理视频，并自动下载。

#### API 调用

**接口**: `POST /api/video/process`

**background.js 实现**:
```javascript
// 监听来自 content script 的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'downloadVideo') {
    handleDownloadVideo(request.url)
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ success: false, error: error.message }))

    // 返回 true 表示异步响应
    return true
  }
})

async function handleDownloadVideo(videoUrl) {
  try {
    // 1. 获取 token
    const { 'supabase.auth.token': tokenData } = await chrome.storage.local.get(['supabase.auth.token'])

    if (!tokenData) {
      return { success: false, error: '请先登录' }
    }

    const { access_token } = JSON.parse(tokenData)

    // 2. 调用 API
    const response = await fetch('https://yourdomain.com/api/video/process', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        shareLink: videoUrl
      })
    })

    if (!response.ok) {
      const error = await response.json()

      // 积分不足
      if (error.error?.code === 'INSUFFICIENT_CREDITS') {
        return {
          success: false,
          error: '积分不足，请充值',
          needRecharge: true
        }
      }

      // 其他错误
      return { success: false, error: error.error?.message || '处理失败' }
    }

    const result = await response.json()
    // result = { success: true, videoUrl: "https://...", shouldConsumeCredit: true }

    return {
      success: true,
      videoUrl: result.videoUrl,
      message: '处理成功！'
    }

  } catch (error) {
    console.error('下载失败:', error)
    return { success: false, error: error.message }
  }
}
```

#### 网页版 API 准备工作

**需要修改**: `app/api/video/process/route.ts`

**添加插件 CORS 支持**:
```typescript
// 修改 isOriginAllowed 函数
function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false
  // 允许插件来源
  if (origin.startsWith('chrome-extension://')) return true
  return ALLOWED_ORIGINS.includes(origin)
}
```

**⚠️ 注意**: 当前 API 已经支持 Bearer Token 认证，无需额外修改！

#### 自动下载实现

**content.js - 下载文件**:
```javascript
function downloadFile(url, filename = 'video.mp4') {
  // 方案 1: 使用 chrome.downloads API（推荐）
  chrome.runtime.sendMessage(
    { action: 'downloadFile', url, filename },
    (response) => {
      if (response.success) {
        showNotification('开始下载...', 'success')
      }
    }
  )
}
```

**background.js - 处理下载**:
```javascript
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'downloadFile') {
    chrome.downloads.download({
      url: request.url,
      filename: request.filename,
      saveAs: true // 让用户选择保存位置
    }, (downloadId) => {
      if (chrome.runtime.lastError) {
        sendResponse({ success: false, error: chrome.runtime.lastError.message })
      } else {
        sendResponse({ success: true, downloadId })
      }
    })

    return true
  }
})
```

**manifest.json - 添加权限**:
```json
{
  "permissions": [
    "downloads"
  ]
}
```

#### 注意事项
1. **积分不足**: 需要引导用户充值
2. **网络错误**: 提供重试按钮
3. **下载失败**: 提供复制链接功能
4. **文件名**: 可以从 API 返回的标题生成

---

### 2.6 积分充值

#### 功能描述
积分不足时，引导用户跳转到网页版充值页面，充值完成后关闭页面并刷新积分。

#### 实现代码

**popup.html - 充值按钮**:
```javascript
async function openRecharge() {
  const rechargeUrl = 'https://yourdomain.com/pricing'

  // 打开充值页面
  chrome.tabs.create({ url: rechargeUrl }, (tab) => {
    if (!tab || !tab.id) return

    // 监听标签页关闭
    const tabId = tab.id

    chrome.tabs.onRemoved.addListener(async function listener(closedTabId) {
      if (closedTabId === tabId) {
        // 标签页关闭，移除监听器
        chrome.tabs.onRemoved.removeListener(listener)

        // 刷新积分
        console.log('充值页面已关闭，刷新积分...')
        await refreshCredits()

        // 显示通知
        showNotification('积分已更新', 'success')
      }
    })
  })
}

async function refreshCredits() {
  try {
    const profile = await fetchUserProfile()

    // 更新 UI
    document.getElementById('credits').textContent = profile.credits

  } catch (error) {
    console.error('刷新积分失败:', error)
  }
}
```

#### 优化方案（可选）

**使用 window.postMessage 实时通知**:

1. 网页版充值成功后发送消息:
```javascript
// 网页版 - 充值成功后
window.opener.postMessage({ type: 'RECHARGE_SUCCESS', credits: 100 }, '*')
window.close()
```

2. 插件监听消息:
```javascript
window.addEventListener('message', (event) => {
  if (event.data.type === 'RECHARGE_SUCCESS') {
    refreshCredits()
  }
})
```

#### 注意事项
1. **tab 权限**: manifest.json 需要添加 `"tabs"` 权限
2. **延迟刷新**: 可以延迟 1 秒后刷新，确保后端数据已更新
3. **错误处理**: 如果刷新失败，提示用户手动刷新

---

### 2.7 充值后自动刷新积分

#### 功能描述
监听充值页面关闭事件，自动重新查询用户积分。

#### 实现代码
参考 2.6 的实现。

#### 注意事项
1. **轮询策略**: 不要频繁查询，避免给服务器造成压力
2. **缓存策略**: 使用本地缓存，减少网络请求
3. **通知提示**: 刷新成功后显示 Chrome 通知

---

## 三、页面设计规范

### 3.1 Popup 页面尺寸
- 宽度: 320px
- 高度: 自适应（最小 400px，最大 600px）

### 3.2 颜色规范
- 主色: `#667eea`（渐变紫）
- 成功: `#10b981`（绿色）
- 错误: `#ef4444`（红色）
- 警告: `#f59e0b`（橙色）
- 背景: `#ffffff`
- 文字: `#1f2937`（深灰）
- 次要文字: `#6b7280`（灰色）

### 3.3 字体规范
- 标题: 16px, 600
- 正文: 14px, 400
- 小字: 12px, 400

### 3.4 图标资源
需要提供以下尺寸的图标:
- 16x16 (浏览器工具栏)
- 48x48 (扩展管理页面)
- 128x128 (Chrome Web Store)

---

## 四、开发任务清单

### 4.1 前置准备工作（必须完成）

| 任务 | 负责人 | 状态 | 说明 |
|------|--------|------|------|
| ✅ 上传插件到 Chrome Web Store 获取 extension_id | 开发 | 待开始 | 用于配置 OAuth redirect URL |
| ✅ 配置 Supabase Redirect URL | 开发 | 待开始 | 添加 `chrome-extension://{id}/oauth.html` |
| ✅ 配置 Google Cloud OAuth | 开发 | 待开始 | 创建 Chrome 扩展程序类型的客户端 ID |
| ✅ 查看 Sora 视频页面 DOM 结构 | 开发 | 待开始 | 确定按钮注入位置 |
| ✅ 修改网页版 API CORS 配置 | 后端 | 待开始 | 允许插件来源 |
| ✅ 准备插件图标资源 | 设计 | 待开始 | 16x16, 48x48, 128x128 |

### 4.2 核心功能开发

#### Phase 1: 基础框架（1-2 天）

| 任务 | 工作量 | 优先级 | 说明 |
|------|--------|--------|------|
| 创建 manifest.json | 1h | P0 | 定义插件权限和配置 |
| 实现自定义 storage adapter | 2h | P0 | chrome.storage.local 适配 |
| 创建 popup.html 基础结构 | 2h | P0 | 登录页面 + 主页面 |
| 实现基础样式 popup.css | 2h | P1 | UI 美化 |
| 创建 background.js 框架 | 2h | P0 | 消息监听和路由 |

#### Phase 2: 登录功能（2-3 天）

| 任务 | 工作量 | 优先级 | 说明 |
|------|--------|--------|------|
| 集成 Supabase Auth SDK | 3h | P0 | 配置 OAuth 流程 |
| 实现 Google 登录逻辑 | 4h | P0 | chrome.identity.launchWebAuthFlow |
| 实现 token 存储逻辑 | 2h | P0 | 保存到 chrome.storage.local |
| 实现自动登录检测 | 2h | P0 | 检查本地 token |
| 实现退出登录功能 | 1h | P0 | 清除本地数据 |
| 错误处理和重试机制 | 2h | P1 | 登录失败处理 |

#### Phase 3: 积分查询（1 天）

| 任务 | 工作量 | 优先级 | 说明 |
|------|--------|--------|------|
| 调用 /api/user/profile 接口 | 2h | P0 | Bearer Token 认证 |
| 实现积分显示 UI | 1h | P0 | popup 页面 |
| 实现自动刷新逻辑 | 1h | P0 | 每次打开 popup 刷新 |
| 添加加载状态 | 1h | P1 | loading spinner |

#### Phase 4: 页面按钮注入（2-3 天）

| 任务 | 工作量 | 优先级 | 说明 |
|------|--------|--------|------|
| 分析 Sora 页面 DOM 结构 | 2h | P0 | **前置任务** |
| 创建 content.js | 2h | P0 | 按钮注入逻辑 |
| 创建 content.css | 2h | P0 | 按钮样式 |
| 实现视频页面检测 | 1h | P0 | URL 匹配 |
| 实现按钮注入逻辑 | 3h | P0 | DOM 操作 |
| 实现 SPA 路由监听 | 2h | P1 | MutationObserver |
| 处理按钮点击事件 | 2h | P0 | 与 background 通信 |

#### Phase 5: 视频下载功能（2 天）

| 任务 | 工作量 | 优先级 | 说明 |
|------|--------|--------|------|
| 调用 /api/video/process 接口 | 2h | P0 | Bearer Token 认证 |
| 实现下载逻辑 | 2h | P0 | chrome.downloads API |
| 处理下载进度 | 2h | P1 | 进度显示 |
| 处理积分不足 | 1h | P0 | 引导充值 |
| 错误处理和通知 | 2h | P0 | 失败提示 |

#### Phase 6: 充值功能（1 天）

| 任务 | 工作量 | 优先级 | 说明 |
|------|--------|--------|------|
| 实现充值页面跳转 | 1h | P0 | chrome.tabs.create |
| 监听标签页关闭 | 1h | P0 | chrome.tabs.onRemoved |
| 实现积分自动刷新 | 1h | P0 | 关闭后刷新 |
| 添加刷新通知 | 1h | P1 | Chrome 通知 |

#### Phase 7: 测试和优化（2-3 天）

| 任务 | 工作量 | 优先级 | 说明 |
|------|--------|--------|------|
| 完整流程测试 | 4h | P0 | 登录→下载→充值 |
| 错误场景测试 | 3h | P0 | 网络错误、token 过期等 |
| 性能优化 | 2h | P1 | 减少请求次数 |
| UI/UX 优化 | 3h | P1 | 用户体验改进 |
| 打包和发布准备 | 2h | P0 | 生成 zip 文件 |

### 4.3 后端支持任务

| 任务 | 负责人 | 工作量 | 优先级 | 说明 |
|------|--------|--------|--------|------|
| 修改 /api/user/profile CORS | 后端 | 0.5h | P0 | 允许 chrome-extension:// |
| 修改 /api/video/process CORS | 后端 | 0.5h | P0 | 允许 chrome-extension:// |
| 测试 Bearer Token 认证 | 后端 | 1h | P0 | 确保插件可用 |
| 首次登录送积分逻辑 | 后端 | 1h | P1 | 修改默认值 |

---

## 五、API 接口是否需要包装？

### 结论：**不需要额外包装！**

#### 理由：

1. **`/api/user/profile` 已支持 Bearer Token**
   - ✅ 已有完整的 Bearer Token 认证逻辑
   - ✅ 返回数据格式完全符合需求
   - ✅ 错误处理完善

2. **`/api/video/process` 已支持 Bearer Token**
   - ✅ 已有 Bearer Token 认证逻辑（通过 `supabase.auth.getUser()`）
   - ✅ 自动扣除积分
   - ✅ 记录使用日志
   - ✅ 返回格式符合需求

#### 只需修改 CORS 配置：

**修改文件 1**: `app/api/user/profile/route.ts`
```typescript
// 第 12 行，修改 isOriginAllowed 函数
function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false
  // 添加这一行
  if (origin.startsWith('chrome-extension://')) return true
  return ALLOWED_ORIGINS.includes(origin)
}
```

**修改文件 2**: `app/api/video/process/route.ts`
```typescript
// 第 20 行，修改 isOriginAllowed 函数
function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false
  // 添加这一行
  if (origin.startsWith('chrome-extension://')) return true
  return ALLOWED_ORIGINS.includes(origin)
}
```

**就这么简单！不需要创建新的 API 接口！**

---

## 六、风险和注意事项

### 6.1 技术风险

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| extension_id 变化 | OAuth 配置失效 | 尽早上传到 Chrome Web Store |
| Sora 页面 DOM 结构变化 | 按钮注入失败 | 使用多个选择器作为备选 |
| Token 过期处理 | 用户无法使用 | 自动刷新 token，失败后重新登录 |
| CORS 跨域问题 | API 调用失败 | 正确配置 CORS 白名单 |
| 网页版 API 变更 | 插件功能失效 | 与后端团队保持沟通 |

### 6.2 用户体验风险

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 首次登录流程复杂 | 用户流失 | 提供清晰的引导文案 |
| 积分不足没有明确提示 | 用户困惑 | 积分不足时显著提示并引导充值 |
| 下载失败没有反馈 | 用户体验差 | 提供详细的错误信息和重试选项 |

### 6.3 安全风险

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| Token 泄露 | 账号被盗 | 使用 chrome.storage.local（加密存储） |
| XSS 攻击 | 插件被劫持 | 严格的 CSP 配置 |
| 假冒插件 | 用户上当受骗 | 在 Chrome Web Store 发布官方版本 |

---

## 七、发布和运维

### 7.1 发布流程

1. **开发阶段**:
   - 在本地测试
   - 使用开发者模式加载插件

2. **测试阶段**:
   - 上传到 Chrome Web Store（未发布）
   - 获取稳定的 extension_id
   - 配置 OAuth redirect URL
   - 内部测试

3. **发布阶段**:
   - 提交审核
   - 通过后公开发布
   - 更新官网链接

### 7.2 版本规划

**V1.0 (MVP)**:
- ✅ Google 登录
- ✅ 积分查询
- ✅ 视频下载
- ✅ 充值跳转
- ✅ 退出登录

**V1.1 (优化)**:
- 📋 历史记录
- 📋 批量下载
- 📋 自定义快捷键
- 📋 多语言支持

**V2.0 (扩展)**:
- 📋 支持更多视频平台
- 📋 视频编辑功能
- 📋 云端同步设置

---

## 八、总结

### 核心开发要点

1. **登录流程**: 使用 Supabase SDK + chrome.identity API
2. **API 调用**: 直接复用网页版 API，只需修改 CORS
3. **按钮注入**: 需要先分析目标网页 DOM 结构
4. **充值流程**: 跳转网页版，监听标签页关闭
5. **Token 管理**: 使用 chrome.storage.local 存储

### 前置条件检查清单

- [ ] 获取稳定的 extension_id
- [ ] 配置 Supabase Redirect URL
- [ ] 配置 Google OAuth Client ID
- [ ] 查看 Sora 页面 DOM 结构
- [ ] 修改网页版 CORS 配置
- [ ] 准备图标资源

### 预计开发时间

- **核心功能开发**: 10-12 天
- **测试和优化**: 2-3 天
- **总计**: 12-15 天

### 下一步行动

1. ✅ 完成前置准备工作
2. ✅ 开始 Phase 1 基础框架开发
3. ✅ 与后端团队沟通 CORS 修改
4. ✅ 分析 Sora 页面 DOM 结构

---

**文档版本**: V1.0
**最后更新**: 2025-01-16
**维护人**: 开发团队
