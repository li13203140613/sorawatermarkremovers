# CORS 配置指南

## 什么是 CORS？

CORS（Cross-Origin Resource Sharing，跨域资源共享）是浏览器的一种安全机制，用于控制不同源之间的资源访问。

### 为什么需要配置 CORS？

**场景**：
```
扩展域名：chrome-extension://abcdefg123456
网站域名：https://www.sora-prompt.io

当扩展调用网站 API 时：
扩展 → 发送请求 → https://www.sora-prompt.io/api/video/process
```

浏览器会检查：
1. 请求来源（Origin）是 `chrome-extension://abcdefg123456`
2. 服务器是否允许这个来源访问

如果服务器没有配置允许，浏览器会**阻止**请求并报错。

---

## 配置步骤

### 步骤 1：修改 API 路由文件

文件位置：`/app/api/video/process/route.ts`

**完整代码示例**：

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { processVideo } from '@/lib/video'
import { verifyTurnstileToken } from '@/lib/turnstile/verify'

// 定义允许的来源
const ALLOWED_ORIGINS = [
  'https://www.sora-prompt.io',  // 网站本身
  'chrome-extension://*'          // 所有 Chrome 扩展（生产环境可限制具体 ID）
]

// 辅助函数：检查来源是否允许
function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false

  return ALLOWED_ORIGINS.some(allowed => {
    if (allowed.endsWith('*')) {
      // 通配符匹配
      const prefix = allowed.slice(0, -1)
      return origin.startsWith(prefix)
    }
    return origin === allowed
  })
}

// 辅助函数：生成 CORS 响应头
function getCorsHeaders(origin: string | null) {
  return {
    'Access-Control-Allow-Origin': isOriginAllowed(origin) ? origin! : 'https://www.sora-prompt.io',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400', // 24 小时缓存预检请求
  }
}

// 处理 OPTIONS 预检请求
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin')
  return new NextResponse(null, {
    status: 200,
    headers: getCorsHeaders(origin),
  })
}

// 处理 POST 请求
export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin')
  const headers = getCorsHeaders(origin)

  try {
    // 1. 验证用户身份
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // 2. 获取请求参数
    const body = await request.json()
    const { shareLink, visitorId, turnstileToken } = body

    if (!shareLink) {
      return NextResponse.json(
        { error: '缺少分享链接参数' },
        { status: 400, headers }
      )
    }

    // 3. 未登录用户需要验证 Turnstile
    if (!user && visitorId) {
      if (!turnstileToken) {
        return NextResponse.json(
          { error: 'Missing Turnstile verification' },
          { status: 400, headers }
        )
      }

      const isValidToken = await verifyTurnstileToken(turnstileToken)
      if (!isValidToken) {
        return NextResponse.json(
          { error: 'Turnstile verification failed. Please try again.' },
          { status: 403, headers }
        )
      }
    }

    // 4. 判断用户类型并处理视频
    let result

    if (user) {
      // 已登录用户 → Database 轨道
      result = await processVideo(shareLink, user.id, undefined)
    } else if (visitorId) {
      // 未登录用户 → Cookie 轨道
      result = await processVideo(shareLink, null, visitorId)
    } else {
      return NextResponse.json(
        { error: '缺少用户身份信息' },
        { status: 400, headers }
      )
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400, headers }
      )
    }

    // 5. 返回结果（带上 CORS 响应头）
    return NextResponse.json({
      success: true,
      videoUrl: result.videoUrl,
      shouldConsumeCredit: result.shouldConsumeCredit,
    }, { headers })

  } catch (error) {
    console.error('API 错误:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500, headers }
    )
  }
}
```

---

### 步骤 2：在扩展中声明权限

文件位置：`sora-extension/manifest.json`

```json
{
  "manifest_version": 3,
  "name": "Sora Video Downloader",
  "version": "1.0.0",
  "host_permissions": [
    "https://www.sora-prompt.io/*"
  ],
  "permissions": [
    "downloads",
    "storage"
  ]
}
```

---

## 验证配置

### 1. 本地测试

在扩展的 content script 中测试 API 调用：

```javascript
// content.js
const testCORS = async () => {
  try {
    const response = await fetch('https://www.sora-prompt.io/api/video/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        shareLink: 'https://sora.chatgpt.com/p/test123',
        visitorId: 'test-visitor-id',
      }),
    })

    if (response.ok) {
      console.log('✅ CORS 配置成功！')
    } else {
      console.error('❌ API 返回错误:', response.status)
    }
  } catch (error) {
    console.error('❌ CORS 配置失败:', error)
  }
}

// 调用测试
testCORS()
```

### 2. 检查浏览器控制台

如果配置正确，不会看到以下错误：
```
Access to fetch at 'https://www.sora-prompt.io/api/video/process'
from origin 'chrome-extension://abcdefg123456' has been blocked by CORS policy
```

如果看到这个错误，说明 CORS 配置有问题。

---

## 安全建议

### 生产环境配置

生产环境建议限制特定的扩展 ID，而不是使用通配符：

```typescript
const ALLOWED_ORIGINS = [
  'https://www.sora-prompt.io',
  'chrome-extension://YOUR_EXTENSION_ID_HERE'  // 替换为实际的扩展 ID
]
```

**如何获取扩展 ID**：
1. 在 Chrome 中打开 `chrome://extensions/`
2. 找到你的扩展
3. 复制"ID"字段的值

---

## 常见问题

### Q1: 为什么需要处理 OPTIONS 请求？

A: 浏览器在发送跨域请求前，会先发送一个 OPTIONS"预检请求"，询问服务器是否允许。如果不处理，浏览器会阻止实际请求。

### Q2: 可以只配置后端，不配置扩展吗？

A: 不可以，两边都需要配置：
- 后端：允许扩展的请求
- 扩展：声明自己需要访问的域名

### Q3: 如何测试 CORS 配置？

A: 最简单的方法是在扩展的 content script 中发送测试请求，查看控制台是否有错误。

---

## 参考资料

- [MDN: CORS 文档](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/CORS)
- [Chrome Extension: Cross-origin requests](https://developer.chrome.com/docs/extensions/mv3/xhr/)
- [Next.js: API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
