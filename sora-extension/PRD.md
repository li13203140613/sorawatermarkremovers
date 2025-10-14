# Sora 视频去水印 Chrome 扩展 - 产品需求文档（PRD）

> **文档版本**：v1.0
> **创建日期**：2025-01-13
> **产品负责人**：lixiaofei
> **开发周期**：3 期迭代（预计 4-5 周）

---

## 目录

1. [产品概述](#1-产品概述)
2. [用户画像与场景](#2-用户画像与场景)
3. [核心需求](#3-核心需求)
4. [功能需求详述](#4-功能需求详述)
5. [技术方案](#5-技术方案)
6. [交互设计](#6-交互设计)
7. [非功能需求](#7-非功能需求)
8. [风险与挑战](#8-风险与挑战)
9. [验收标准](#9-验收标准)
10. [待确认问题](#10-待确认问题)

---

## 1. 产品概述

### 1.1 产品定位

Sora 视频去水印 Chrome 扩展是一款浏览器插件，旨在为用户提供便捷的 Sora 视频下载功能。用户无需离开 Sora 网站，即可通过一键点击完成视频去水印和下载操作。

### 1.2 核心价值

- **便捷性**：无需复制链接、打开新网站，在 Sora 页面直接操作
- **一致性**：与现有网站的积分系统、登录状态无缝衔接
- **高效性**：自动提取链接、自动触发下载，减少操作步骤

### 1.3 产品目标

| 指标 | 目标值 | 说明 |
|------|--------|------|
| 用户转化率 | 提升 30% | 降低使用门槛，提高从访客到付费用户的转化 |
| 日活跃用户 | 500+ | 第一期上线后 1 个月内达成 |
| 平均处理时长 | < 10 秒 | 从点击到下载完成的总耗时 |
| 错误率 | < 5% | API 调用成功率 > 95% |

---

## 2. 用户画像与场景

### 2.1 目标用户

**主要用户群体**：
- Sora 视频创作者和营销人员
- 需要批量下载 Sora 视频的内容工作者
- 普通用户（偶尔需要下载视频保存）

**用户特征**：
- 熟悉浏览器扩展的安装和使用
- 对视频质量有一定要求（需要无水印）
- 追求操作便捷性

### 2.2 典型使用场景

#### 场景 1：新用户首次使用
```
用户行为：
1. 浏览 Sora 网站，看到喜欢的视频
2. 发现右侧有"下载"按钮（扩展注入）
3. 点击按钮
4. 等待几秒，视频自动下载到本地

痛点：不清楚需要多少积分、是否需要登录
解决方案：按钮旁显示"剩余积分：3"，积分不足时引导登录
```

#### 场景 2：已登录用户批量下载
```
用户行为：
1. 登录网站后浏览多个视频
2. 每个视频页面都能看到"下载"按钮
3. 依次点击下载多个视频
4. 每次下载后积分自动扣除

痛点：不知道剩余积分是否足够
解决方案：Popup 中显示实时积分余额，支持快速充值
```

#### 场景 3：未登录游客尝试使用
```
用户行为：
1. 未登录状态下访问 Sora
2. 点击"下载"按钮
3. 弹出 Turnstile 人机验证
4. 验证通过后，使用 Cookie 积分下载

痛点：不知道自己有多少免费次数
解决方案：按钮旁提示"免费试用：剩余 3 次"
```

---

## 3. 核心需求

### 3.1 必须满足的需求（Must Have）

| 需求 | 优先级 | 实现期数 |
|------|--------|---------|
| 在 Sora 视频页面注入下载按钮 | P0 | 第一期 |
| 自动提取当前页面的视频链接 | P0 | 第一期 |
| 调用后端 API 处理视频 | P0 | 第一期 |
| 自动触发浏览器下载 | P0 | 第一期 |
| 显示处理状态（加载中/成功/失败） | P0 | 第一期 |
| 支持未登录用户使用（Cookie 积分） | P0 | 第一期 |

### 3.2 应该满足的需求（Should Have）

| 需求 | 优先级 | 实现期数 |
|------|--------|---------|
| 共享网站登录状态（Cookie） | P1 | 第二期 |
| 显示剩余积分 | P1 | 第二期 |
| Turnstile 人机验证 | P1 | 第二期 |
| 扩展 Popup 页面 | P1 | 第二期 |
| 完善的错误处理和提示 | P1 | 第二期 |

### 3.3 可以满足的需求（Could Have）

| 需求 | 优先级 | 实现期数 |
|------|--------|---------|
| 下载历史记录 | P2 | 第三期 |
| 批量下载 | P2 | 第三期 |
| 快捷键支持 | P2 | 第三期 |
| 自定义设置 | P2 | 第三期 |

---

## 4. 功能需求详述

### 4.1 第一期：最小闭环（MVP）

#### 4.1.1 页面检测与按钮注入

**功能描述**：
- 扩展自动检测用户当前是否在 Sora 视频页面
- URL 匹配规则：`https://sora.chatgpt.com/p/*`
- 在页面加载完成后 1 秒内完成按钮注入

**技术实现**：
```javascript
// content.js
const isSoraVideoPage = () => {
  const url = window.location.href;
  return url.includes('sora.chatgpt.com/p/');
};

const injectDownloadButton = () => {
  // 找到操作按钮容器（点赞、分享等）
  const buttonContainer = document.querySelector('[data-action-buttons]');
  if (!buttonContainer) return;

  // 创建下载按钮
  const downloadBtn = document.createElement('button');
  downloadBtn.className = 'sora-extension-download-btn';
  downloadBtn.textContent = '下载';
  downloadBtn.onclick = handleDownload;

  // 插入到最右侧
  buttonContainer.appendChild(downloadBtn);
};
```

**验收标准**：
- ✅ 在 Sora 视频页面能看到"下载"按钮
- ✅ 按钮位置在原有按钮的最右侧
- ✅ 按钮样式与页面风格协调
- ✅ 非视频页面不显示按钮

---

#### 4.1.2 视频链接提取

**功能描述**：
- 从当前页面 URL 提取视频分享链接
- 格式验证：必须是 `https://sora.chatgpt.com/p/xxxxx`

**技术实现**：
```javascript
const extractVideoLink = () => {
  const url = window.location.href;

  // 验证 URL 格式
  if (!url.includes('sora.chatgpt.com/p/')) {
    throw new Error('无效的 Sora 视频页面');
  }

  return url;
};
```

**验收标准**：
- ✅ 能正确提取完整的分享链接
- ✅ 对无效 URL 能抛出错误

---

#### 4.1.3 API 调用（未登录模式）

**功能描述**：
- 点击下载按钮后，调用后端 `/api/video/process` 接口
- 使用 `visitorId`（UUID v4）作为用户标识
- 传递 `shareLink` 和 `visitorId`

**接口定义**：
```typescript
POST /api/video/process

Request Body:
{
  "shareLink": "https://sora.chatgpt.com/p/abc123",
  "visitorId": "550e8400-e29b-41d4-a716-446655440000"
}

Response Success (200):
{
  "success": true,
  "videoUrl": "https://cdn.example.com/video_no_watermark.mp4",
  "shouldConsumeCredit": true  // Cookie 积分需要客户端扣除
}

Response Error (400):
{
  "success": false,
  "error": "积分不足，请先充值"
}
```

**技术实现**：
```javascript
// background.js
const processVideo = async (shareLink, visitorId) => {
  const response = await fetch('https://your-domain.com/api/video/process', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      shareLink,
      visitorId,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'API 调用失败');
  }

  return await response.json();
};
```

**验收标准**：
- ✅ 能成功调用 API 并返回视频 URL
- ✅ 错误时能正确解析错误信息
- ✅ 网络超时时有提示

---

#### 4.1.4 视频下载

**功能描述**：
- 获取去水印视频 URL 后，自动触发浏览器下载
- 文件命名规则：`sora_video_YYYYMMDD_HHMMSS.mp4`

**技术实现**：
```javascript
// background.js
const downloadVideo = (videoUrl) => {
  const timestamp = new Date().toISOString().replace(/[-:]/g, '').slice(0, 15);
  const filename = `sora_video_${timestamp}.mp4`;

  chrome.downloads.download({
    url: videoUrl,
    filename: filename,
    saveAs: false,  // 自动保存到默认下载目录
  }, (downloadId) => {
    if (chrome.runtime.lastError) {
      console.error('下载失败:', chrome.runtime.lastError);
      return;
    }
    console.log('下载开始，ID:', downloadId);
  });
};
```

**验收标准**：
- ✅ 浏览器自动开始下载视频
- ✅ 文件保存到用户默认下载目录
- ✅ 文件名格式正确

---

#### 4.1.5 状态提示

**功能描述**：
- 按钮点击后，显示"处理中..."状态，禁用按钮
- 成功后，显示"✓ 已下载"，3 秒后恢复
- 失败时，显示错误信息（如"积分不足"）

**UI 状态机**：
```
初始状态 → 点击 → 处理中 → 成功/失败
  ↓                ↓         ↓
"下载"       "⟳ 处理中"  "✓ 已下载" / "✕ 失败"
```

**技术实现**：
```javascript
const updateButtonState = (button, state, message) => {
  switch (state) {
    case 'loading':
      button.disabled = true;
      button.textContent = '⟳ 处理中...';
      button.className = 'sora-extension-btn loading';
      break;
    case 'success':
      button.textContent = '✓ 已下载';
      button.className = 'sora-extension-btn success';
      setTimeout(() => {
        button.disabled = false;
        button.textContent = '下载';
        button.className = 'sora-extension-btn';
      }, 3000);
      break;
    case 'error':
      button.textContent = `✕ ${message}`;
      button.className = 'sora-extension-btn error';
      setTimeout(() => {
        button.disabled = false;
        button.textContent = '下载';
        button.className = 'sora-extension-btn';
      }, 5000);
      break;
  }
};
```

**验收标准**：
- ✅ 处理中时按钮禁用，显示加载图标
- ✅ 成功后显示"✓ 已下载"，3 秒后恢复
- ✅ 失败时显示具体错误信息，5 秒后恢复

---

#### 4.1.6 visitorId 管理

**功能描述**：
- 为未登录用户生成唯一的 `visitorId`（UUID v4）
- 存储在 `chrome.storage.local` 中，持久化保存
- 首次使用时生成，后续使用相同 ID

**技术实现**：
```javascript
// background.js
const getOrCreateVisitorId = async () => {
  const result = await chrome.storage.local.get(['visitorId']);

  if (result.visitorId) {
    return result.visitorId;
  }

  // 生成 UUID v4
  const visitorId = crypto.randomUUID();
  await chrome.storage.local.set({ visitorId });

  return visitorId;
};
```

**验收标准**：
- ✅ 首次使用时生成 visitorId
- ✅ 后续使用时使用相同 visitorId
- ✅ 卸载扩展后重新安装，visitorId 会重新生成

---

### 4.2 第二期：用户体验优化

#### 4.2.1 Cookie 共享登录

**功能描述**：
- 扩展读取网站的 Supabase 认证 Cookie
- 自动同步用户登录状态
- 已登录用户使用数据库积分，未登录用户使用 Cookie 积分

**技术实现**：
```javascript
// background.js
const getUserFromCookie = async () => {
  const cookies = await chrome.cookies.getAll({
    domain: 'your-domain.com',
  });

  const authCookie = cookies.find(c => c.name === 'sb-access-token');
  if (!authCookie) return null;

  // 解析 JWT token，提取 user.id
  const token = authCookie.value;
  const payload = JSON.parse(atob(token.split('.')[1]));

  return {
    id: payload.sub,
    email: payload.email,
  };
};
```

**验收标准**：
- ✅ 网站登录后，扩展自动识别登录状态
- ✅ 能正确提取用户 ID 和邮箱
- ✅ 网站登出后，扩展也切换到未登录状态

---

#### 4.2.2 积分显示

**功能描述**：
- 在下载按钮旁显示当前剩余积分
- 已登录用户：从后端 API 获取积分
- 未登录用户：从 localStorage 读取 Cookie 积分

**UI 设计**：
```
┌────────────────────────────┐
│  下载  │  剩余积分：12     │
└────────────────────────────┘
```

**技术实现**：
```javascript
const displayCredits = async (container) => {
  const user = await getUserFromCookie();
  let credits;

  if (user) {
    // 已登录：从后端获取
    const response = await fetch(`/api/credits?userId=${user.id}`);
    const data = await response.json();
    credits = data.credits;
  } else {
    // 未登录：从 Cookie 读取
    credits = getCookieCredits();
  }

  const creditsEl = document.createElement('span');
  creditsEl.textContent = `剩余积分：${credits}`;
  creditsEl.className = 'credits-display';
  container.appendChild(creditsEl);
};
```

**验收标准**：
- ✅ 按钮旁能看到积分显示
- ✅ 积分不足时显示红色警告
- ✅ 下载后积分实时更新

---

#### 4.2.3 Turnstile 验证

**功能描述**：
- 未登录用户首次使用时，需要完成 Turnstile 人机验证
- 验证通过后才能调用 API
- 验证失败时显示错误提示

**技术实现**：
```javascript
// 在 content.js 中嵌入 Turnstile widget
const showTurnstileVerification = () => {
  return new Promise((resolve, reject) => {
    const container = document.createElement('div');
    container.innerHTML = `
      <div class="turnstile-modal">
        <div class="turnstile-content">
          <h3>请完成安全验证</h3>
          <div id="turnstile-widget"></div>
        </div>
      </div>
    `;
    document.body.appendChild(container);

    // 初始化 Turnstile
    turnstile.render('#turnstile-widget', {
      sitekey: 'YOUR_SITE_KEY',
      callback: (token) => {
        container.remove();
        resolve(token);
      },
      'error-callback': () => {
        container.remove();
        reject(new Error('验证失败'));
      },
    });
  });
};
```

**验收标准**：
- ✅ 未登录用户点击下载时弹出验证窗口
- ✅ 验证通过后能正常下载
- ✅ 验证失败时显示错误提示

---

#### 4.2.4 扩展 Popup 页面

**功能描述**：
- 点击扩展图标显示弹窗
- 显示内容：登录状态、积分余额、快捷操作、使用说明

**UI 布局**：参考 README.md 中的线框图

**技术实现**：
```html
<!-- popup.html -->
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="popup.css">
</head>
<body>
  <div class="header">
    <h2>🎬 Sora 去水印</h2>
  </div>

  <div class="user-info" id="userInfo">
    <!-- 动态加载用户信息 -->
  </div>

  <div class="credits-info" id="creditsInfo">
    <!-- 动态加载积分信息 -->
  </div>

  <button id="downloadCurrentBtn">立即下载当前视频</button>

  <div class="actions">
    <button id="rechargeBtn">充值积分</button>
    <button id="historyBtn">下载记录</button>
  </div>

  <div class="help">
    <h4>💡 使用说明</h4>
    <ol>
      <li>打开任意 Sora 视频页面</li>
      <li>点击右侧绿色"下载"按钮</li>
      <li>等待处理完成，自动下载</li>
    </ol>
  </div>

  <script src="popup.js"></script>
</body>
</html>
```

**验收标准**：
- ✅ 点击扩展图标能打开 Popup
- ✅ Popup 中能看到登录状态和积分
- ✅ "立即下载"按钮能触发当前页面的下载

---

### 4.3 第三期：高级功能

（第三期功能详细设计待第二期完成后补充）

---

## 5. 技术方案

### 5.1 技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| Chrome Extension | Manifest V3 | 扩展框架 |
| JavaScript | ES2022 | 主要开发语言 |
| Chrome APIs | - | downloads, storage, cookies, tabs |
| Turnstile | 最新版 | 人机验证 |

### 5.2 架构设计

```
┌─────────────────────────────────────────────────┐
│           Sora 视频页面（sora.chatgpt.com）      │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │  Content Script（content.js）             │ │
│  │  - 检测页面 URL                           │ │
│  │  - 注入下载按钮                           │ │
│  │  - 监听用户点击                           │ │
│  │  - 提取视频链接                           │ │
│  └───────────────┬───────────────────────────┘ │
└──────────────────┼───────────────────────────────┘
                   │ chrome.runtime.sendMessage
                   ↓
┌─────────────────────────────────────────────────┐
│   Background Service Worker（background.js）    │
│  ┌───────────────────────────────────────────┐ │
│  │  - 接收 Content Script 消息               │ │
│  │  - 管理 visitorId / userId                │ │
│  │  - 调用后端 API                           │ │
│  │  - 触发浏览器下载                         │ │
│  └───────────────┬───────────────────────────┘ │
└──────────────────┼───────────────────────────────┘
                   │ fetch()
                   ↓
┌─────────────────────────────────────────────────┐
│           后端 API（your-domain.com）            │
│  POST /api/video/process                        │
│  - 验证用户身份（userId / visitorId）          │
│  - 检查积分余额                                 │
│  - 调用去水印 API                               │
│  - 返回无水印视频 URL                           │
└─────────────────────────────────────────────────┘
```

### 5.3 关键技术点

#### 5.3.1 跨域请求处理

**问题**：扩展调用后端 API 时可能遇到 CORS 限制

**解决方案**：
1. 在 `manifest.json` 中声明 `host_permissions`
2. 后端配置 CORS，允许扩展的请求

```json
// manifest.json
{
  "host_permissions": [
    "https://your-domain.com/*"
  ]
}
```

```typescript
// Next.js API 中配置 CORS
export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin');

  // 允许扩展的请求
  const allowedOrigins = [
    'https://your-domain.com',
    'chrome-extension://*'  // 允许所有扩展（生产环境应限制特定 extension ID）
  ];

  const headers = {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // ... API 逻辑

  return NextResponse.json(data, { headers });
}
```

---

#### 5.3.2 按钮注入时机

**问题**：Sora 页面可能是单页应用（SPA），内容动态加载

**解决方案**：使用 `MutationObserver` 监听 DOM 变化

```javascript
// content.js
const observeDOMChanges = () => {
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        // 检查是否需要注入按钮
        if (shouldInjectButton() && !isButtonInjected()) {
          injectDownloadButton();
        }
      }
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
};

// 页面加载完成后开始监听
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', observeDOMChanges);
} else {
  observeDOMChanges();
}
```

---

#### 5.3.3 积分同步机制

**已登录用户（数据库积分）**：
1. 扩展从 Cookie 提取 `userId`
2. 调用 API 时传递 `userId`
3. 后端扣除数据库积分
4. 返回最新积分余额
5. 扩展更新显示

**未登录用户（Cookie 积分）**：
1. 扩展生成 `visitorId`
2. 调用 API 时传递 `visitorId`
3. 后端验证 Turnstile token，返回视频 URL
4. 返回 `shouldConsumeCredit: true`
5. 扩展本地扣除 Cookie 积分（写入 localStorage）

---

#### 5.3.4 下载进度监听

**功能**：监听下载进度，实时更新按钮状态

```javascript
// background.js
chrome.downloads.onChanged.addListener((delta) => {
  if (delta.state) {
    if (delta.state.current === 'complete') {
      // 通知 Content Script 下载完成
      chrome.tabs.sendMessage(currentTabId, {
        action: 'downloadComplete',
      });
    } else if (delta.state.current === 'interrupted') {
      // 下载失败
      chrome.tabs.sendMessage(currentTabId, {
        action: 'downloadFailed',
        error: '下载中断',
      });
    }
  }
});
```

---

### 5.4 文件结构

```
sora-extension/
├── manifest.json              # 扩展配置
├── content.js                 # 页面注入脚本
├── background.js              # 后台服务
├── popup.html                 # Popup 页面
├── popup.js                   # Popup 逻辑
├── popup.css                  # Popup 样式
├── styles.css                 # 注入按钮样式
├── utils/
│   ├── api.js                 # API 调用封装
│   ├── storage.js             # 存储管理
│   └── auth.js                # 认证相关
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

---

## 6. 交互设计

### 6.1 按钮样式规范

**尺寸**：
- 高度：44px（与 Sora 原生按钮一致）
- 宽度：自适应（最小 80px）
- 圆角：22px

**颜色**：
- 默认：`#4CAF50`（绿色）
- 悬停：`#66BB6A`（浅绿）
- 禁用：`#9E9E9E`（灰色）
- 成功：`#4CAF50`
- 错误：`#f44336`（红色）

**字体**：
- 大小：14px
- 粗细：500（Medium）
- 颜色：`#FFFFFF`

**示例 CSS**：
```css
.sora-extension-btn {
  height: 44px;
  padding: 0 20px;
  border: none;
  border-radius: 22px;
  background: #4CAF50;
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  margin-left: 12px;
}

.sora-extension-btn:hover {
  background: #66BB6A;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(76, 175, 80, 0.3);
}

.sora-extension-btn:disabled {
  background: #9E9E9E;
  cursor: not-allowed;
  transform: none;
}

.sora-extension-btn.loading {
  background: #FF9800;
}

.sora-extension-btn.success {
  background: #4CAF50;
}

.sora-extension-btn.error {
  background: #f44336;
}
```

---

### 6.2 动画效果

**加载动画**：
```css
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.loading-icon {
  display: inline-block;
  animation: spin 1s linear infinite;
}
```

**按钮点击反馈**：
```css
.sora-extension-btn:active {
  transform: scale(0.95);
}
```

---

### 6.3 错误提示设计

**错误类型与提示文案**：

| 错误类型 | 提示文案 | 引导操作 |
|---------|---------|---------|
| 积分不足 | "积分不足，请先充值" | 显示"前往充值"按钮 |
| 链接无效 | "无效的视频链接" | - |
| 网络异常 | "网络连接失败，请稍后重试" | - |
| API 失败 | "处理失败，请稍后重试" | - |
| 验证失败 | "人机验证失败，请重试" | 重新显示 Turnstile |

---

## 7. 非功能需求

### 7.1 性能要求

| 指标 | 目标值 | 说明 |
|------|--------|------|
| 按钮注入耗时 | < 500ms | 从页面加载到按钮显示 |
| API 响应时间 | < 3s | 从发起请求到返回结果 |
| 视频下载启动时间 | < 1s | 从获取 URL 到浏览器开始下载 |
| 内存占用 | < 50MB | 扩展运行时的内存占用 |

### 7.2 兼容性

| 浏览器 | 版本要求 |
|--------|---------|
| Chrome | >= 88 |
| Edge | >= 88 |
| Brave | >= 1.20 |
| Opera | >= 74 |

**不支持**：Firefox（需要单独适配）、Safari（需要单独适配）

### 7.3 安全性

- ✅ 不存储用户敏感信息（密码、支付信息等）
- ✅ 使用 HTTPS 传输数据
- ✅ Turnstile 验证防止机器人滥用
- ✅ 限制 API 调用频率（后端实现 rate limit）

### 7.4 可维护性

- ✅ 代码注释覆盖率 > 30%
- ✅ 关键函数有单元测试
- ✅ 错误日志记录到 `console.error`
- ✅ 版本号管理（遵循语义化版本）

---

## 8. 风险与挑战

### 8.1 技术风险

| 风险 | 影响 | 概率 | 应对措施 |
|------|------|------|---------|
| Sora 网站 DOM 结构变化 | 按钮注入失败 | 中 | 使用多种 CSS 选择器兜底；定期检查 |
| 后端 API 限流 | 用户无法下载 | 低 | 客户端实现重试机制；提示用户稍后再试 |
| Chrome API 兼容性问题 | 部分功能不可用 | 低 | 使用 Polyfill；降级处理 |
| 跨域请求被阻止 | API 调用失败 | 低 | 后端配置 CORS；使用 background fetch |

### 8.2 业务风险

| 风险 | 影响 | 概率 | 应对措施 |
|------|------|------|---------|
| 用户滥用免费积分 | 成本增加 | 中 | Turnstile 验证；限制单 IP 使用次数 |
| 扩展被 Chrome 商店拒绝 | 无法公开发布 | 低 | 严格遵守 Chrome 扩展政策；准备申诉材料 |
| Sora 官方封锁扩展 | 功能失效 | 低 | 与 Sora 沟通合作；准备备用方案 |

### 8.3 用户体验风险

| 风险 | 影响 | 概率 | 应对措施 |
|------|------|------|---------|
| 用户不知道如何安装扩展 | 转化率低 | 中 | 提供详细安装教程视频；简化安装步骤 |
| 按钮样式与页面不符 | 用户体验差 | 低 | 严格匹配 Sora 原生样式；A/B 测试 |
| 下载速度慢 | 用户投诉 | 中 | 优化 CDN 配置；提示用户耐心等待 |

---

## 9. 验收标准

### 9.1 第一期验收（MVP）

**功能验收**：
- [ ] 在 Sora 视频页面能看到绿色"下载"按钮
- [ ] 按钮位置正确（在最右侧）
- [ ] 点击按钮后，按钮文字变为"处理中..."
- [ ] 5-10 秒后，浏览器自动开始下载视频文件
- [ ] 下载成功后，按钮显示"✓ 已下载"
- [ ] 积分不足时，显示"积分不足"错误
- [ ] 网络异常时，显示"网络连接失败"错误

**性能验收**：
- [ ] 按钮注入耗时 < 500ms
- [ ] API 响应时间 < 5s
- [ ] 扩展内存占用 < 50MB

**兼容性验收**：
- [ ] Chrome 88+ 能正常运行
- [ ] Edge 88+ 能正常运行

---

### 9.2 第二期验收

**功能验收**：
- [ ] 网站登录后，扩展自动识别登录状态
- [ ] 按钮旁显示剩余积分
- [ ] 未登录用户首次使用时弹出 Turnstile 验证
- [ ] 点击扩展图标能打开 Popup
- [ ] Popup 中显示登录状态、积分余额

**用户体验验收**：
- [ ] 按钮样式与 Sora 原生按钮一致
- [ ] 错误提示清晰易懂，有引导操作

---

### 9.3 第三期验收

（待第二期完成后补充）

---

## 10. 已确认的配置

### 10.1 技术配置 ✅

1. **后端 API 域名**
   - **生产域名**：`https://www.sora-prompt.io`
   - **API 端点**：`https://www.sora-prompt.io/api/video/process`
   - **配置位置**：`.env.local` 中的 `NEXT_PUBLIC_APP_URL`

2. **Supabase Cookie 名称**
   - **格式**：`sb-<project_ref>-auth-token`
   - **实际名称**：`sb-zjefhzapfbouslkgllah-auth-token`
   - **说明**：`zjefhzapfbouslkgllah` 是 Supabase 项目的 project_ref

3. **CORS 配置需求**
   - **必须配置**：后端需要在 `/app/api/video/process/route.ts` 中添加 CORS 响应头
   - **允许来源**：
     - `https://www.sora-prompt.io`（网站本身）
     - `chrome-extension://*`（扩展请求，生产环境建议限制特定 extension ID）
   - **具体实现**：参见第 5.3.1 节技术方案

---

### 10.2 产品配置 ✅

1. **文件命名规则**
   - **方案**：`sora_video_YYYYMMDD_HHMMSS.mp4`（时间戳）
   - **示例**：`sora_video_20250113_143025.mp4`

2. **免费积分数量**
   - **未登录用户**：默认 **1 次** 免费下载
   - **存储方式**：localStorage（Cookie 积分）

3. **积分不足时的引导**
   - **跳转页面**：`https://www.sora-prompt.io/pricing`
   - **触发时机**：点击"前往充值"按钮

---

### 10.3 待确认问题

1. **按钮位置**
   - 问题：如果 Sora 页面更新，按钮位置可能需要调整
   - 建议：使用多个 CSS 选择器兜底，优先级：`data-*` 属性 > class > tag

2. **API Rate Limit**
   - 问题：后端是否有 API 调用频率限制？
   - 建议：单用户每分钟最多 5 次请求

3. **是否需要统计功能**
   - 问题：是否需要统计用户使用次数、成功率等数据？
   - 建议：第三期考虑添加匿名统计

---

### 10.4 运营相关（待定）

1. **扩展发布渠道**
   - 问题：是否需要发布到 Chrome Web Store？
   - 备选方案：仅提供 `.crx` 文件下载，私有部署
   - **状态**：⏸️ 暂缓确认

2. **用户反馈收集**
   - 问题：如何收集用户反馈和 Bug 报告？
   - 建议：在 Popup 中添加"反馈问题"按钮，跳转到 GitHub Issues

3. **更新通知**
   - 问题：扩展更新后，如何通知用户？
   - 建议：第一次打开时显示更新日志

---

## 附录

### A. 相关文档链接

- [Chrome Extension Manifest V3 文档](https://developer.chrome.com/docs/extensions/mv3/)
- [Chrome Downloads API](https://developer.chrome.com/docs/extensions/reference/downloads/)
- [Turnstile 文档](https://developers.cloudflare.com/turnstile/)

### B. 术语表

| 术语 | 解释 |
|------|------|
| Content Script | 注入到网页中运行的脚本 |
| Background Service Worker | 在后台运行的服务进程 |
| Manifest V3 | Chrome 扩展的最新版本规范 |
| visitorId | 未登录用户的唯一标识（UUID v4） |
| Cookie 积分 | 存储在客户端的免费试用积分 |
| 数据库积分 | 存储在服务器的付费积分 |

---

**文档结束**

> 请确认以上需求是否完整，如有疑问请随时提出！