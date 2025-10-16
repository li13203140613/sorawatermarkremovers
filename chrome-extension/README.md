# Chrome Extension - 浏览器插件开发文档

## 项目概述

本插件为网页版去水印工具的浏览器扩展版本，与网页版共享用户系统和积分系统。

## 功能需求列表

| 序号 | 功能模块 | 具体需求 | 优先级 | 实现方式 | 状态 |
|------|----------|----------|--------|----------|------|
| 1 | 用户登录 | 使用 Google OAuth 独立登录 | P0 | 调用 Supabase Auth API | 待开发 |
| 2 | 积分查询 | 登录后自动查询并显示用户积分 | P0 | 调用 `GET /api/user/credits` | 待开发 |
| 3 | 用户退出 | 点击退出按钮清除本地 token | P0 | 清除 `chrome.storage.local` | 待开发 |
| 4 | 页面按钮注入 | 在 Sora 页面上显示"下载无水印"按钮 | P0 | Content Script 注入 DOM | 待开发 |
| 5 | 视频去水印 | 点击按钮调用 API 下载无水印视频 | P0 | 调用 `POST /api/video/process` | 待开发 |
| 6 | 积分充值 | 点击充值按钮跳转到网页版充值页面 | P0 | `chrome.tabs.create()` 打开网页 | 待开发 |
| 7 | 充值后刷新 | 充值页面关闭后自动刷新积分显示 | P0 | 监听 tab 关闭事件，重新查询积分 | 待开发 |
| 8 | Cookie 共享 | V1 版本：插件和网页版独立登录，通过账号关联（共享数据库） | P1 | 各自管理 token，后端通过 user_id 关联 | 待开发 |

## V1 版本核心目标（闭环）

**必须完成的功能闭环**：
1. ✅ 用户可以通过 Google 登录插件
2. ✅ 登录成功后显示当前积分
3. ✅ 在 Sora 页面上显示下载按钮
4. ✅ 点击按钮成功下载无水印视频（扣除积分）
5. ✅ 积分不足时可以跳转充值
6. ✅ 充值后积分自动更新
7. ✅ 可以正常退出登录

## 技术实现要点

### 1. 独立登录（不共享 Cookie）
- 插件使用独立的 Google OAuth 流程
- 登录后获取独立的 `access_token`
- Token 存储在 `chrome.storage.local`（不与网页版共享）
- 后端通过 Google 账号的 `email` 或 `user_id` 关联同一用户

### 2. 数据库共享
```
网页版登录 → Supabase Auth → user_profiles 表
插件登录   → Supabase Auth → 同一个 user_profiles 表
```

两种登录方式最终指向同一个用户记录（通过 email 或 user_id 关联）。

## 技术栈

- **HTML5** - 页面结构
- **CSS3** - 样式设计
- **TypeScript** - 主要开发语言（编译为 JavaScript）
- **Chrome Extension Manifest V3** - 插件规范

### 构建工具（可选）
- Webpack 或 Vite - TypeScript 编译和打包
- 或直接使用 `tsc` 编译器

## 项目结构

```
chrome-extension/
├── manifest.json          # 插件配置文件
├── popup.html            # 弹窗页面
├── popup.js              # 弹窗逻辑
├── background.js         # 后台脚本
├── content.js            # 内容脚本（注入页面）
├── styles/
│   └── popup.css         # 弹窗样式
├── icons/                # 图标资源
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md
```

## API 接口设计

### 基础配置

**API Base URL**:
- 开发环境: `http://localhost:3000/api`
- 生产环境: `https://yourdomain.com/api`

**认证方式**: Bearer Token（存储在插件本地存储中）

---

## 🎯 可直接复用的网页版 API

### ✅ 1. 查询用户信息和积分（已完成）

**接口**: `GET /api/user/profile`

**文件**: `app/api/user/profile/route.ts`

**已支持功能**:
- ✅ Bearer Token 认证（优先）
- ✅ Cookie 认证（降级）
- ✅ CORS 支持（已配置 `https://www.sora-prompt.io`）
- ✅ 自动创建用户档案（首次登录）
- ✅ 返回积分、邮箱、用户名、头像

**插件调用方式**:
```javascript
const response = await fetch('https://yourdomain.com/api/user/profile', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
})

const data = await response.json()
// data = { id, email, name, avatar_url, credits }
```

**返回示例**:
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "张三",
  "avatar_url": "https://...",
  "credits": 100
}
```

---

### ✅ 2. 视频去水印处理（已完成）

**接口**: `POST /api/video/process`

**文件**: `app/api/video/process/route.ts`

**已支持功能**:
- ✅ Bearer Token 认证（通过 `supabase.auth.getUser()`）
- ✅ Cookie 认证支持
- ✅ CORS 支持（已配置）
- ✅ 自动扣除积分
- ✅ 记录使用日志
- ✅ 返回处理结果和剩余积分

**插件调用方式**:
```javascript
const response = await fetch('https://yourdomain.com/api/video/process', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    shareLink: 'https://xiaohongshu.com/video/xxx'
    // turnstileToken 可选，登录用户不需要
  })
})

const result = await response.json()
// result = { success, videoUrl, shouldConsumeCredit }
```

**返回示例**:
```json
{
  "success": true,
  "videoUrl": "https://...",
  "shouldConsumeCredit": true
}
```

---

### ❌ 3. 登录接口（需要处理）

**说明**: Supabase Auth 使用 OAuth 流程，插件需要使用 Chrome Identity API

**实现方式**:
```javascript
// 插件中使用 chrome.identity.launchWebAuthFlow
chrome.identity.launchWebAuthFlow({
  url: supabaseAuthUrl,
  interactive: true
}, (redirectUrl) => {
  // 从 redirectUrl 中提取 access_token
})
```

**或者使用 Supabase JS SDK**:
```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Google 登录
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: chrome.identity.getRedirectURL()
  }
})
```

---

### ✅ 4. 充值功能（跳转方式）

**方式**: 打开新标签页跳转到网页版充值页面

```javascript
// 打开充值页面
chrome.tabs.create({
  url: 'https://yourdomain.com/pricing'
}, (tab) => {
  // 监听标签页关闭
  chrome.tabs.onRemoved.addListener((tabId) => {
    if (tabId === tab.id) {
      // 刷新积分
      refreshCredits()
    }
  })
})
```

---

## 🔧 需要添加的 CORS 配置

由于插件的请求来源是 `chrome-extension://[extension-id]`，需要在网页版 API 中添加 CORS 支持：

### 修改 1: `/api/user/profile/route.ts`

在 `ALLOWED_ORIGINS` 数组中添加：

```typescript
const ALLOWED_ORIGINS = [
  'https://www.sora-prompt.io',
  // 添加插件支持（开发阶段可以用通配符）
  process.env.NODE_ENV === 'development'
    ? '*'
    : 'chrome-extension://YOUR_EXTENSION_ID'
]
```

或者更宽松的配置：
```typescript
function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false
  // 允许插件来源
  if (origin.startsWith('chrome-extension://')) return true
  return ALLOWED_ORIGINS.includes(origin)
}
```

### 修改 2: `/api/video/process/route.ts`

同样添加插件来源支持：

```typescript
const ALLOWED_ORIGINS = [
  'https://www.sora-prompt.io',
  // 插件支持
  process.env.NODE_ENV === 'development'
    ? '*'
    : 'chrome-extension://YOUR_EXTENSION_ID'
]
```

---

## 📋 功能与 API 对应关系

| 功能 | API 接口 | 状态 | 说明 |
|------|----------|------|------|
| 1. 用户登录 | Supabase Auth SDK | ⚠️ 需实现 | 使用 `chrome.identity` 或 Supabase SDK |
| 2. 积分查询 | `GET /api/user/profile` | ✅ 可直接用 | 已支持 Bearer Token |
| 3. 用户退出 | 本地清除 Token | ✅ 可直接用 | 清除 `chrome.storage.local` |
| 4. 页面按钮注入 | Content Script | ⚠️ 需开发 | 注入 DOM 按钮 |
| 5. 视频去水印 | `POST /api/video/process` | ✅ 可直接用 | 已支持 Bearer Token |
| 6. 积分充值 | 跳转网页 `/pricing` | ✅ 可直接用 | 使用 `chrome.tabs.create()` |
| 7. 充值后刷新 | 监听 tab 关闭 + 查询积分 | ⚠️ 需开发 | 监听 `chrome.tabs.onRemoved` |

---

## 🎯 开发优先级

### P0 - 核心功能（必须完成）
1. ✅ **积分查询**: 直接调用 `/api/user/profile`
2. ✅ **视频去水印**: 直接调用 `/api/video/process`
3. ⚠️ **Google 登录**: 使用 Supabase SDK + `chrome.identity`
4. ⚠️ **页面按钮**: Content Script 注入 DOM
5. ⚠️ **充值刷新**: 监听标签页关闭事件

### P1 - 优化功能（后续完善）
6. CORS 配置优化（允许插件来源）
7. 错误处理和重试机制
8. 离线状态检测

## 用户流程

### 首次使用
1. 用户安装插件
2. 点击插件图标，弹出登录界面
3. 选择 Google 登录或邮箱登录
4. 登录成功，获得初始积分（与网页版相同逻辑）
5. Token 保存到 `chrome.storage.local`

### 日常使用
1. 用户访问小红书视频页面
2. 点击插件图标
3. 显示当前积分和视频信息
4. 点击"去水印"按钮
5. 调用 `/api/video/process` 接口
6. 显示处理结果和下载链接

### 积分不足
1. 插件检测到积分不足
2. 显示"充值"按钮
3. 点击后打开新标签页到 `/pricing`
4. 用户完成充值
5. 关闭标签页，插件自动刷新积分

## 开发步骤

### 1. 初始化项目
```bash
cd chrome-extension
npm init -y
npm install --save-dev typescript @types/chrome
```

### 2. 配置 TypeScript
创建 `tsconfig.json`

### 3. 创建 manifest.json
定义插件权限和配置

### 4. 开发核心功能
- popup.html - 用户界面
- background.js - 后台逻辑（保持登录状态）
- content.js - 页面内容检测（可选）

### 5. 测试
在 Chrome 中加载未打包的扩展（开发者模式）

### 6. 打包发布
```bash
# 编译 TypeScript
npm run build

# 打包为 zip
zip -r extension.zip chrome-extension/
```

## 发布渠道

- **Chrome Web Store** - 主要发布平台
- **Edge Add-ons** - 兼容 Chrome 插件
- **本地安装** - 提供 `.zip` 文件供用户手动安装

## 注意事项

1. **不需要部署到 Vercel** - 插件是本地运行的
2. **Token 安全** - 使用 `chrome.storage.local` 安全存储
3. **CORS 配置** - 确保网页版 API 允许插件域名访问
4. **权限最小化** - 只申请必要的浏览器权限
5. **Manifest V3** - 使用最新的插件规范

## 与网页版的区别

| 功能 | 网页版 | 插件版 |
|------|--------|--------|
| 登录 | Supabase Auth | 同左，共享 token |
| 积分查询 | 实时显示 | 调用 API 查询 |
| 充值 | 直接充值页面 | 跳转到网页版 |
| 视频处理 | 在线处理 | 调用网页版 API |
| 部署 | Vercel | Chrome Web Store |

## 开发环境要求

- Node.js 18+
- TypeScript 5+
- Chrome 浏览器（用于测试）

## 后续扩展

- 支持 Firefox 扩展
- 支持 Safari 扩展
- 批量处理功能
- 历史记录功能
