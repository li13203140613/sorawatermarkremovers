# Canonical Links 验证指南

## ✅ 实施完成

已成功为项目添加完整的 canonical 链接支持！

## 🎯 已实施的页面

### 1. 全局 Layout（所有页面的基础）
- **文件**: `app/[locale]/layout.tsx`
- **功能**: 为所有页面提供基础的 canonical 链接
- **支持**: 所有5种语言（en, zh, ja, de, zh-hant）

### 2. Pricing 页面
- **文件**: `app/[locale]/pricing/layout.tsx`
- **URL 示例**:
  - EN: https://www.sora-prompt.io/en/pricing
  - ZH: https://www.sora-prompt.io/zh/pricing

### 3. Blog 列表页
- **文件**: `app/[locale]/blog/layout.tsx`
- **URL 示例**:
  - EN: https://www.sora-prompt.io/en/blog
  - ZH: https://www.sora-prompt.io/zh/blog

### 4. Blog 详情页（动态路由）
- **文件**: `app/[locale]/blog/[slug]/layout.tsx`
- **URL 示例**:
  - EN: https://www.sora-prompt.io/en/blog/getting-started
  - ZH: https://www.sora-prompt.io/zh/blog/getting-started
- **特性**: 从API动态获取文章信息以生成更精确的metadata

### 5. Video Generation 页面
- **文件**: `app/[locale]/video-generation/layout.tsx`
- **URL 示例**:
  - EN: https://www.sora-prompt.io/en/video-generation
  - ZH: https://www.sora-prompt.io/zh/video-generation

### 6. SoraPrompting 页面
- **文件**: `app/[locale]/soraprompting/layout.tsx`
- **URL 示例**:
  - EN: https://www.sora-prompt.io/en/soraprompting
  - ZH: https://www.sora-prompt.io/zh/soraprompting

## 🛠️ 核心工具函数

创建了 `lib/seo/canonical.ts` 提供以下功能：

### 1. getCanonicalUrl()
```typescript
// 生成规范的 canonical URL
getCanonicalUrl('/pricing', 'en')
// 返回: https://www.sora-prompt.io/en/pricing
```

### 2. extractPathnameWithoutLocale()
```typescript
// 从完整路径中提取不含 locale 的路径
extractPathnameWithoutLocale('/zh/blog/my-post')
// 返回: /blog/my-post
```

### 3. getAlternateLinks()
```typescript
// 生成多语言 alternate links
getAlternateLinks('/pricing')
// 返回: [
//   { hreflang: 'en', href: 'https://www.sora-prompt.io/en/pricing' },
//   { hreflang: 'zh', href: 'https://www.sora-prompt.io/zh/pricing' },
//   ...
//   { hreflang: 'x-default', href: 'https://www.sora-prompt.io/en/pricing' }
// ]
```

## 🔍 如何验证

### 方法1: 查看页面源代码（推荐）

1. 访问任意页面（如 http://localhost:3000/en/pricing）
2. 右键 → "查看页面源代码"
3. 搜索 `<link rel="canonical"`
4. 应该能看到类似这样的标签：
   ```html
   <link rel="canonical" href="https://www.sora-prompt.io/en/pricing"/>
   ```

### 方法2: 使用浏览器开发者工具

1. 打开开发者工具（F12）
2. 切换到 "Elements" 标签页
3. 在 `<head>` 标签中查找 `<link rel="canonical">`

### 方法3: 使用 SEO 工具

推荐使用以下浏览器扩展：
- **SEO Meta in 1 Click** (Chrome/Edge)
- **SEO Minion** (Chrome/Edge)
- **Meta SEO Inspector** (Firefox)

### 方法4: 使用命令行工具

```bash
# 使用 curl 检查（Linux/Mac）
curl -s http://localhost:3000/en/pricing | grep -i "canonical"

# 使用 PowerShell（Windows）
(Invoke-WebRequest http://localhost:3000/en/pricing).Content | Select-String -Pattern "canonical"
```

## 📝 期望的输出示例

### 首页 (/)
```html
<head>
  <link rel="canonical" href="https://www.sora-prompt.io/en"/>
  <link rel="alternate" hreflang="en" href="https://www.sora-prompt.io/en"/>
  <link rel="alternate" hreflang="zh" href="https://www.sora-prompt.io/zh"/>
  <link rel="alternate" hreflang="ja" href="https://www.sora-prompt.io/ja"/>
  <link rel="alternate" hreflang="de" href="https://www.sora-prompt.io/de"/>
  <link rel="alternate" hreflang="zh-hant" href="https://www.sora-prompt.io/zh-hant"/>
  <link rel="alternate" hreflang="x-default" href="https://www.sora-prompt.io/en"/>
</head>
```

### Pricing 页面 (/pricing)
```html
<head>
  <link rel="canonical" href="https://www.sora-prompt.io/en/pricing"/>
  <link rel="alternate" hreflang="en" href="https://www.sora-prompt.io/en/pricing"/>
  <link rel="alternate" hreflang="zh" href="https://www.sora-prompt.io/zh/pricing"/>
  <link rel="alternate" hreflang="ja" href="https://www.sora-prompt.io/ja/pricing"/>
  <link rel="alternate" hreflang="de" href="https://www.sora-prompt.io/de/pricing"/>
  <link rel="alternate" hreflang="zh-hant" href="https://www.sora-prompt.io/zh-hant/pricing"/>
  <link rel="alternate" hreflang="x-default" href="https://www.sora-prompt.io/en/pricing"/>
</head>
```

### Blog 详情页 (/blog/getting-started)
```html
<head>
  <link rel="canonical" href="https://www.sora-prompt.io/en/blog/getting-started"/>
  <link rel="alternate" hreflang="en" href="https://www.sora-prompt.io/en/blog/getting-started"/>
  <link rel="alternate" hreflang="zh" href="https://www.sora-prompt.io/zh/blog/getting-started"/>
  ...
</head>
```

## 🚀 SEO 优化效果

### ✅ 解决的问题

1. **重复内容问题**: 告诉搜索引擎多语言版本是同一页面的不同语言版本
2. **权重集中**: 所有语言版本的权重集中到主URL
3. **搜索排名**: 提高搜索引擎对页面的理解和排名
4. **国际化SEO**: 通过 hreflang 标签支持多语言SEO

### 📊 预期改善

- ✅ 避免重复内容惩罚
- ✅ 提高页面权重
- ✅ 改善搜索排名
- ✅ 增强国际化SEO效果

## 🔧 开发者注意事项

### 为新页面添加 canonical 链接

如果需要为新页面添加 canonical 链接，只需：

1. 在页面目录下创建/编辑 `layout.tsx`
2. 使用以下模板：

```typescript
import type { Metadata } from 'next';
import { getCanonicalUrl } from '@/lib/seo/canonical';

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const canonicalUrl = getCanonicalUrl('/your-page-path', locale);

  return {
    title: 'Your Page Title',
    description: 'Your page description',
    alternates: {
      canonical: canonicalUrl,
      languages: Object.fromEntries(
        ['en', 'zh', 'ja', 'de', 'zh-hant'].map(lang => [
          lang,
          getCanonicalUrl('/your-page-path', lang)
        ])
      )
    },
    openGraph: {
      title: 'Your Page Title',
      description: 'Your page description',
      type: 'website',
      url: canonicalUrl,
    },
  };
}

export default function YourPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
```

### 动态路由页面（如 [slug]）

对于动态路由，从 params 中获取动态参数：

```typescript
export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const canonicalUrl = getCanonicalUrl(`/blog/${slug}`, locale);

  // ... 返回 metadata
}
```

## 📚 相关文档

- [Next.js Metadata 文档](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
- [Google Canonical URL 指南](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
- [Hreflang 标签最佳实践](https://developers.google.com/search/docs/specialty/international/localized-versions)

## ✅ 验证清单

在部署前，请确认以下项目：

- [ ] 所有主要页面都有 canonical 链接
- [ ] Canonical URL 格式正确（使用生产环境域名）
- [ ] 多语言 alternate links 正确生成
- [ ] Open Graph URL 与 canonical URL 一致
- [ ] 构建成功无错误
- [ ] 在浏览器中查看页面源代码验证

## 🎉 完成状态

- ✅ 核心工具函数创建完成
- ✅ 全局 Layout 已更新
- ✅ Pricing 页面已配置
- ✅ Blog 列表页已配置
- ✅ Blog 详情页已配置（动态路由）
- ✅ Video Generation 页面已配置
- ✅ SoraPrompting 页面已配置
- ✅ 构建测试通过
- ✅ TypeScript 类型检查通过

---

**创建日期**: 2025-10-24
**最后更新**: 2025-10-24
**版本**: 1.0.0
