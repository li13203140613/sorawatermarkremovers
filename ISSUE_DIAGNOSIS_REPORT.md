# 线上错误诊断报告

**日期**: 2025-10-27
**环境**: 本地开发环境 (localhost:3000)
**测试页面**: /zh (中文首页)

---

## 📊 问题摘要

**核心错误**: `getTranslations` is not supported in Client Components
**错误位置**: `app/[locale]/page.tsx:22`
**影响范围**: 首页无法正常渲染，显示运行时错误页面

---

## 🔍 详细错误信息

### 1. 主要错误
```
Error: `getTranslations` is not supported in Client Components.
    at Home (app\[locale]\page.tsx:22:34)
```

**代码位置**:
```typescript
// app/[locale]/page.tsx:20-22
export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
> const t = await getTranslations({ locale, namespace: 'home' });  // ❌ 错误行
```

### 2. 次要错误
```
Invalid hook call. Hooks can only be called inside of the body of a function component.
This could happen for one of the following reasons:
1. You might have mismatching versions of React and the renderer (such as React DOM)
2. You might be breaking the Rules of Hooks
3. You might have more than one copy of React in the same app
```

### 3. 网络请求失败
- **500 Internal Server Error**: http://localhost:3000/zh
- **404 Not Found**: http://localhost:3000/favicon.ico (次要)

---

## 🎯 根本原因分析

### 问题根源
虽然 `page.tsx` 是一个服务端组件（没有 'use client' 标记），但 Next.js 将其**错误地识别为客户端组件**。

### 可能的原因

#### 1. React Hook 冲突（最可能）
错误信息明确提到 "Invalid hook call"，这表明可能存在：
- React 版本不匹配
- 多个 React 副本共存
- Hook 调用规则违反

#### 2. 依赖链污染
虽然检查显示 SSR 组件都没有 'use client' 标记，但可能存在：
- 深层依赖中的客户端标记
- 循环依赖导致的边界问题

#### 3. next-intl 配置问题
`getTranslations` from 'next-intl/server' 应该只在服务端组件中使用，但当前被当作客户端组件处理。

---

## 📸 测试结果

### 页面截图
✅ 已保存: `test-screenshot.png`

**显示内容**:
- ❌ Runtime Error 错误页面
- ❌ 错误信息: `getTranslations` is not supported in Client Components
- ✅ 导航栏正常加载

### 控制台日志统计
- **总消息数**: 3 条
- **错误**: 2 条
  - 500 Internal Server Error (主页)
  - 404 Not Found (favicon)
- **警告**: 1 条
  - CSS preload 未使用警告

### 页面错误
- **数量**: 1 条
- **内容**: `getTranslations` is not supported in Client Components

### 网络请求
- **失败请求**: 0 条（HTTP层面）
- **服务器错误**: 1 条（500状态码）

---

## 🔧 修复方案

### 方案 1: 使用 next-intl 的 unstable_setRequestLocale（推荐）

修改 `app/[locale]/page.tsx`:

```typescript
import { unstable_setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  // 设置请求级别的 locale
  unstable_setRequestLocale(locale);

  // 移除 getTranslations，在客户端组件中使用 useTranslations
  const homeSchemas = generateHomePageSchema();
  const faqSchema = generateFAQSchema(HOME_FAQ_DATA);

  return (
    <>
      {/* ... schemas ... */}

      <div className="min-h-screen bg-white">
        {/* Hero Section - 需要创建独立的服务端组件 */}
        <HeroSectionSSR locale={locale} />

        {/* 其他组件保持不变 */}
        <ClientInteractiveSection />
        <SoraIntroductionSSR />
        <ProductAdvantagesSSR />
        <FeatureNavigationSSR />
      </div>
    </>
  );
}
```

创建新组件 `components/home/HeroSectionSSR.tsx`:

```typescript
import { getTranslations } from 'next-intl/server';

interface HeroSectionSSRProps {
  locale: string;
}

export default async function HeroSectionSSR({ locale }: HeroSectionSSRProps) {
  const t = await getTranslations({ locale, namespace: 'home' });

  return (
    <div className="bg-gray-50 py-16 px-4 text-center border-b border-gray-200">
      <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
        {t('hero.title')}
      </h1>
    </div>
  );
}
```

### 方案 2: 将整个页面转为客户端组件（不推荐，影响SEO）

```typescript
'use client';

import { useTranslations } from 'next-intl';
// ... 其他导入

export default function Home() {
  const t = useTranslations('home');

  // ... 其余代码
}
```

**缺点**:
- ❌ 失去服务端渲染的 SEO 优势
- ❌ 结构化数据无法在首次加载时注入
- ❌ 违反当前架构设计（混合渲染）

### 方案 3: 检查并修复 React 版本冲突

```bash
# 1. 检查 React 版本
pnpm list react react-dom

# 2. 如果发现多个版本，清理并重新安装
pnpm store prune
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install

# 3. 确保 package.json 中版本一致
{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "next": "^15.5.4"
  }
}
```

---

## ✅ 推荐修复步骤

### Step 1: 创建 HeroSectionSSR 组件
```bash
# 创建文件
touch components/home/HeroSectionSSR.tsx
```

### Step 2: 修改 page.tsx
移除直接的 `getTranslations` 调用，使用新的 HeroSectionSSR 组件。

### Step 3: 测试验证
```bash
# 重启开发服务器
pnpm dev

# 访问测试
http://localhost:3000/zh
```

### Step 4: 部署到生产环境
```bash
# 构建测试
pnpm build

# 部署
vercel --prod
```

---

## 📝 测试记录

### 本地测试环境
- **Node版本**: (待补充)
- **pnpm版本**: (待补充)
- **Next.js版本**: 15.5.4
- **React版本**: 19.0.0
- **浏览器**: Chromium (Playwright)

### 测试文件生成
- ✅ `test-screenshot.png` - 页面截图
- ✅ `test-page.html` - 完整HTML
- ✅ `test-log.json` - 详细日志
- ✅ `test-local.js` - 测试脚本

---

## 🎯 下一步行动

### 立即执行
1. ✅ 本地测试完成 - 问题已复现
2. ⏳ 实施修复方案 1（创建 HeroSectionSSR）
3. ⏳ 本地验证修复
4. ⏳ 提交代码并部署

### 后续优化
- 添加更多集成测试
- 配置 CI/CD 自动测试
- 监控线上错误日志
- 优化 React 依赖管理

---

**报告生成**: 自动化测试脚本
**测试工具**: Playwright + Node.js
**报告时间**: 2025-10-27 00:46:22
