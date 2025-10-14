# 后端 API 更新说明

> 为了支持 Chrome 扩展调用，需要在后端 API 中添加 CORS 配置

## 🎯 需要修改的文件

**文件路径**：`/app/api/video/process/route.ts`

---

## 📝 完整代码示例

将原有的 `route.ts` 文件替换为以下代码：

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { processVideo } from '@/lib/video'
import { verifyTurnstileToken } from '@/lib/turnstile/verify'

// ========== 新增：CORS 配置 ==========

// 定义允许的来源
const ALLOWED_ORIGINS = [
  'https://www.sora-prompt.io',  // 网站本身
  'chrome-extension://*'          // 所有 Chrome 扩展（生产环境可限制具体 ID）
]

// 检查来源是否允许
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

// 生成 CORS 响应头
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

// ========== 修改：POST 请求处理 ==========

export async function POST(request: NextRequest) {
  // 获取请求来源并设置 CORS 响应头
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
        { status: 400, headers }  // ← 添加 headers
      )
    }

    // 3. 未登录用户需要验证 Turnstile
    if (!user && visitorId) {
      if (!turnstileToken) {
        return NextResponse.json(
          { error: 'Missing Turnstile verification' },
          { status: 400, headers }  // ← 添加 headers
        )
      }

      const isValidToken = await verifyTurnstileToken(turnstileToken)
      if (!isValidToken) {
        return NextResponse.json(
          { error: 'Turnstile verification failed. Please try again.' },
          { status: 403, headers }  // ← 添加 headers
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
        { status: 400, headers }  // ← 添加 headers
      )
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400, headers }  // ← 添加 headers
      )
    }

    // 5. 返回结果（带上 CORS 响应头）
    return NextResponse.json({
      success: true,
      videoUrl: result.videoUrl,
      shouldConsumeCredit: result.shouldConsumeCredit,
    }, { headers })  // ← 添加 headers

  } catch (error) {
    console.error('API 错误:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500, headers }  // ← 添加 headers
    )
  }
}
```

---

## 🔑 关键改动说明

### 1. **新增 CORS 辅助函数**（第 7-34 行）

```typescript
// 允许的来源列表
const ALLOWED_ORIGINS = [
  'https://www.sora-prompt.io',
  'chrome-extension://*'
]

// 检查来源是否合法
function isOriginAllowed(origin: string | null): boolean { ... }

// 生成 CORS 响应头
function getCorsHeaders(origin: string | null) { ... }
```

### 2. **新增 OPTIONS 处理**（第 36-41 行）

```typescript
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin')
  return new NextResponse(null, {
    status: 200,
    headers: getCorsHeaders(origin),
  })
}
```

**作用**：处理浏览器的"预检请求"，告诉浏览器允许跨域访问。

### 3. **所有响应都添加 headers**

在每个 `NextResponse.json()` 的第二个参数中添加 `{ headers }`：

```typescript
// 错误响应
return NextResponse.json(
  { error: '缺少分享链接参数' },
  { status: 400, headers }  // ← 新增
)

// 成功响应
return NextResponse.json({
  success: true,
  videoUrl: result.videoUrl,
  shouldConsumeCredit: result.shouldConsumeCredit,
}, { headers })  // ← 新增
```

---

## ✅ 验证 CORS 配置

### 方法一：使用浏览器开发者工具

1. 安装并启用扩展
2. 访问 Sora 视频页面
3. 点击下载按钮
4. 按 F12 打开开发者工具
5. 切换到 Network 标签
6. 查找 `/api/video/process` 请求
7. 检查 Response Headers 是否包含：
   ```
   Access-Control-Allow-Origin: chrome-extension://xxxxx
   Access-Control-Allow-Methods: POST, OPTIONS
   ```

### 方法二：使用 curl 测试

```bash
curl -X OPTIONS https://www.sora-prompt.io/api/video/process \
  -H "Origin: chrome-extension://test123" \
  -H "Access-Control-Request-Method: POST" \
  -v
```

应该看到响应头包含：
```
< HTTP/2 200
< access-control-allow-origin: chrome-extension://test123
< access-control-allow-methods: POST, OPTIONS
```

---

## 🔒 生产环境安全建议

**当前配置**（开发阶段）：
```typescript
'chrome-extension://*'  // 允许所有扩展
```

**生产环境配置**（推荐）：
```typescript
const ALLOWED_ORIGINS = [
  'https://www.sora-prompt.io',
  'chrome-extension://abcdefghijklmnop'  // 替换为实际的扩展 ID
]
```

**如何获取扩展 ID**：
1. 在 Chrome 中打开 `chrome://extensions/`
2. 找到"Sora Video Downloader"
3. 复制"ID"字段的值
4. 替换上面代码中的 `abcdefghijklmnop`

---

## 📊 测试清单

部署后请验证：

- [ ] 网站正常访问（不受 CORS 配置影响）
- [ ] 扩展能成功调用 API
- [ ] OPTIONS 预检请求正常返回
- [ ] 错误响应也包含 CORS 响应头
- [ ] 控制台没有 CORS 错误

---

## 🆘 常见问题

### Q: 添加 CORS 后网站功能异常？

A: CORS 配置不会影响网站本身的功能，因为同域请求不需要 CORS。如果有问题，检查代码是否有语法错误。

### Q: 扩展仍然报 CORS 错误？

A: 检查：
1. 后端代码是否正确部署
2. `manifest.json` 中的 `host_permissions` 是否正确
3. 浏览器控制台的具体错误信息

### Q: 如何限制特定扩展 ID？

A: 在 `ALLOWED_ORIGINS` 中替换 `chrome-extension://*` 为具体的扩展 ID。

---

## 🚀 部署步骤

1. **修改代码**：按照上述示例更新 `route.ts`
2. **本地测试**：`npm run dev`
3. **验证功能**：测试扩展是否能正常调用
4. **提交代码**：`git add` → `git commit` → `git push`
5. **部署生产**：`npm run build` → 部署到服务器
6. **生产验证**：在生产环境测试扩展功能

---

## 📞 需要帮助？

如果遇到问题，请提供以下信息：
- 浏览器控制台的完整错误信息
- Network 标签中的请求详情
- 后端日志输出
