# Next.js 15 组件使用规则 - 客户端 vs 服务端组件

## 🎯 核心原则

### ✅ 默认：服务端组件（Server Components）
- Next.js 15 中，**所有组件默认都是服务端组件**
- 不需要添加 `'use client'`
- 可以直接访问数据库、文件系统等服务端资源

### ⚡ 显式声明：客户端组件（Client Components）
- 需要在文件顶部添加 `'use client'` 指令
- 可以使用 React Hooks (useState, useEffect等)
- 可以使用浏览器 API (window, document等)
- 可以添加交互性（点击、输入等）

---

## 📋 决策树：何时使用哪种组件？

```
需要以下任一功能？
  ├─ 使用 useState, useEffect 等 React Hooks? → 客户端组件
  ├─ 使用浏览器 API (window, localStorage)? → 客户端组件
  ├─ 需要事件处理 (onClick, onChange)? → 客户端组件
  ├─ 使用 useContext, useReducer? → 客户端组件
  ├─ 使用第三方客户端库 (Stripe, 图表库)? → 客户端组件
  └─ 都不需要 → 服务端组件 ✅
```

---

## 🚨 常见错误与解决方案

### ❌ 错误 1: 在服务端组件中使用客户端 Hook

```typescript
// ❌ 错误 - page.tsx (默认是服务端组件)
import { useTranslations } from 'next-intl'

export default function Page() {
  const t = useTranslations() // ❌ 错误！
  return <div>{t('hello')}</div>
}
```

**✅ 解决方案 A: 改为客户端组件**
```typescript
'use client' // ✅ 添加此行

import { useTranslations } from 'next-intl'

export default function Page() {
  const t = useTranslations() // ✅ 现在可以了
  return <div>{t('hello')}</div>
}
```

**✅ 解决方案 B: 使用服务端 API**
```typescript
// ✅ 保持服务端组件
import { getTranslations } from 'next-intl/server'

export default async function Page() {
  const t = await getTranslations() // ✅ 使用服务端版本
  return <div>{t('hello')}</div>
}
```

---

### ❌ 错误 2: 客户端组件污染

```typescript
// page.tsx (服务端组件)
import ClientComponent from './ClientComponent' // ClientComponent 有 'use client'

export default async function Page() {
  const data = await fetch(...) // ❌ 这会失败！
  return <ClientComponent data={data} />
}
```

**原因**：导入客户端组件会将父组件也变成客户端组件，导致无法使用服务端功能。

**✅ 解决方案：组件组合模式（推荐）**
```typescript
// page.tsx (保持服务端组件)
export default async function Page() {
  const data = await fetch(...) // ✅ 可以使用服务端功能
  return (
    <div>
      <ServerComponent data={data} />
      <ClientWrapper>
        <ClientComponent />
      </ClientWrapper>
    </div>
  )
}
```

---

## 📚 常见场景与最佳实践

### 场景 1: 表单页面

```typescript
// ❌ 不好 - 整个页面都是客户端组件
'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'

export default function FormPage() {
  const [value, setValue] = useState('')
  const t = useTranslations()
  return <form>...</form>
}
```

```typescript
// ✅ 更好 - 拆分组件
// page.tsx (服务端组件)
import { getTranslations } from 'next-intl/server'
import FormComponent from './FormComponent'

export default async function FormPage() {
  const t = await getTranslations()
  return (
    <div>
      <h1>{t('title')}</h1>
      <FormComponent />
    </div>
  )
}

// FormComponent.tsx (客户端组件)
'use client'
import { useState } from 'react'

export default function FormComponent() {
  const [value, setValue] = useState('')
  return <form>...</form>
}
```

---

### 场景 2: 数据获取 + 交互

```typescript
// ❌ 不好
'use client'
import { useState, useEffect } from 'react'

export default function Page() {
  const [data, setData] = useState(null)

  useEffect(() => {
    fetch('/api/data').then(r => r.json()).then(setData)
  }, [])

  return <div>{data}</div>
}
```

```typescript
// ✅ 更好 - 服务端获取数据
// page.tsx (服务端组件)
import ClientComponent from './ClientComponent'

export default async function Page() {
  const data = await fetch('/api/data').then(r => r.json())
  return <ClientComponent data={data} />
}

// ClientComponent.tsx (客户端组件)
'use client'
import { useState } from 'react'

export default function ClientComponent({ data }) {
  const [selected, setSelected] = useState(null)
  return <div onClick={() => setSelected(data)}>{data}</div>
}
```

---

## 🔍 本项目中的实际案例

### ✅ 正确示例

#### 1. 服务端组件 - Dashboard
```typescript
// app/[locale]/dashboard/page.tsx
import { getTranslations } from 'next-intl/server'
import { VideoProcessor } from '@/components/video'

export default async function DashboardPage() {
  const t = await getTranslations('dashboard')

  return (
    <div>
      <h1>{t('title')}</h1>
      <VideoProcessor /> {/* 客户端组件 */}
    </div>
  )
}
```

#### 2. 客户端组件 - VideoProcessor
```typescript
// components/video/VideoProcessor.tsx
'use client'

import { useState } from 'react'
import { useCredits } from '@/hooks/useCredits'

export function VideoProcessor() {
  const [url, setUrl] = useState('')
  const { credits, consumeCredit } = useCredits()

  return (
    <form onSubmit={handleSubmit}>
      <input value={url} onChange={(e) => setUrl(e.target.value)} />
      <button>Process ({credits} credits)</button>
    </form>
  )
}
```

#### 3. 混合使用 - Pricing Page
```typescript
// app/[locale]/pricing/page.tsx
'use client' // ✅ 因为 PaymentPackages 是客户端组件

import { PaymentPackages } from '@/components/payment'
import { useTranslations } from 'next-intl' // ✅ 使用客户端 Hook

export default function PricingPage() {
  const t = useTranslations('payment')
  return <PaymentPackages />
}
```

---

## 📊 快速参考表

| 功能 | 服务端组件 | 客户端组件 |
|------|----------|----------|
| **数据获取** | ✅ async/await | ❌ 需要 useEffect |
| **React Hooks** | ❌ 不支持 | ✅ 支持 |
| **事件处理** | ❌ 不支持 | ✅ 支持 |
| **浏览器 API** | ❌ 不支持 | ✅ 支持 |
| **数据库直接访问** | ✅ 支持 | ❌ 不支持 |
| **环境变量** | ✅ 全部 | ⚠️ 仅 NEXT_PUBLIC_* |
| **包大小** | 📦 0 (不发送到客户端) | 📦 计入客户端包 |
| **SEO** | ✅ 完全支持 | ⚠️ 需等待 hydration |

---

## 🛠️ next-intl 使用指南

### 服务端组件
```typescript
import { getTranslations } from 'next-intl/server'

export default async function ServerPage() {
  const t = await getTranslations('namespace')
  return <h1>{t('title')}</h1>
}
```

### 客户端组件
```typescript
'use client'
import { useTranslations } from 'next-intl'

export default function ClientPage() {
  const t = useTranslations('namespace')
  return <h1>{t('title')}</h1>
}
```

---

## 🎯 最佳实践总结

1. **优先使用服务端组件**
   - 更快的初始加载
   - 更小的包大小
   - 更好的 SEO

2. **只在必要时使用客户端组件**
   - 需要交互性
   - 需要使用 Hooks
   - 需要浏览器 API

3. **避免客户端组件污染**
   - 将客户端组件放在组件树的叶子节点
   - 使用组件组合而非导入

4. **明确标记客户端组件**
   - 始终在文件顶部添加 `'use client'`
   - 不要依赖隐式转换

5. **遵循数据流方向**
   - 服务端 → 客户端：通过 props
   - 客户端 → 服务端：通过 Server Actions 或 API

---

## 🔗 相关资源

- [Next.js 15 Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [React Server Components](https://react.dev/reference/react/use-client)

---

**最后更新**: 2025-10-21
**版本**: 1.0
