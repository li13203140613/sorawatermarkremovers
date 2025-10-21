# RemoveWM - 项目完整文档

> 一个基于 Next.js 15 的 Sora2 视频去水印与 AI 视频生成平台
>
> **版本**: 1.0.0 | **最后更新**: 2025-10-21 | **技术栈**: Next.js 15, React 19, TypeScript, Supabase, Stripe

---

## 📚 目录

1. [项目概览](#项目概览)
2. [核心功能模块](#核心功能模块)
3. [技术架构](#技术架构)
4. [项目结构](#项目结构)
5. [数据流与状态管理](#数据流与状态管理)
6. [API 端点](#api-端点)
7. [数据库设计](#数据库设计)
8. [关键组件说明](#关键组件说明)
9. [环境配置](#环境配置)
10. [开发指南](#开发指南)

---

## 项目概览

### 核心业务
RemoveWM 是一个提供 Sora2 视频处理服务的 SaaS 平台，主要功能包括：
- **视频去水印**：移除 Sora2 生成视频的水印
- **AI 视频生成**：基于文本提示词和参考图片生成视频
- **Prompt 展示**：Sora2 提示词库与分类展示
- **积分系统**：双轨积分（数据库 + Cookie）
- **多语言支持**：i18n 支持（中文/英文为主）

### 技术特色
- ✅ **Next.js 15** + React 19 服务端组件
- ✅ **双认证系统**：Cookie 认证 + Bearer Token（Chrome 插件）
- ✅ **双积分轨道**：已登录用户数据库积分 / 未登录用户 Cookie 积分
- ✅ **Stripe 支付**：美元/人民币双币种支付
- ✅ **国际化路由**：基于 next-intl 的多语言路由系统
- ✅ **Chrome 扩展**：独立的浏览器扩展支持

---

## 核心功能模块

### 1. 视频去水印系统

**路径**: `lib/video/*`, `app/api/video/process/route.ts`

#### 核心流程
```
用户提交链接
  → 验证 Sora 链接格式
  → 判断用户类型（已登录/未登录）
  → 检查积分
  → 调用第三方去水印 API
  → 扣除积分
  → 返回无水印视频 URL
```

#### 双轨积分系统
```typescript
// Database 轨道（已登录用户）
lib/video/service.ts: processWithDatabaseCredits()
  - 从 Supabase 查询用户积分
  - 调用 API 后通过 RPC consume_credit() 扣除
  - 记录到 video_processes 表

// Cookie 轨道（未登录用户）
lib/video/service.ts: processWithCookieCredits()
  - 服务端不检查积分（由客户端完成）
  - 调用 API 成功后返回 shouldConsumeCredit: true
  - 客户端通过 CookieCreditsManager 扣除 Cookie 积分
```

#### 关键文件
| 文件 | 职责 |
|------|------|
| `lib/video/api.ts` | 调用第三方去水印 API |
| `lib/video/service.ts` | 双轨积分处理逻辑 |
| `app/api/video/process/route.ts` | API 端点（支持 CORS、Bearer Token） |
| `components/video/VideoProcessor.tsx` | 视频处理 UI 组件 |

---

### 2. AI 视频生成系统

**路径**: `app/api/video-generation/*`, `components/video-generation/*`

#### 核心流程
```
用户输入提示词 + 参考图片（可选）
  → 选择模型（sora2 / sora2-unwm）
  → 检查积分（1 或 2 积分）
  → 调用 AICoding API 创建任务
  → 轮询任务状态（6秒间隔）
  → 视频生成完成 → 展示 & 下载
```

#### 模型与积分
- **sora2**（标准版）：1 积分，带水印
- **sora2-unwm**（专业版）：2 积分，无水印

#### 关键文件
| 文件 | 职责 |
|------|------|
| `app/api/video-generation/create/route.ts` | 创建视频生成任务 |
| `app/api/video-generation/status/[taskId]/route.ts` | 查询任务状态 |
| `components/video-generation/VideoGenerator.tsx` | 视频生成 UI（完整的表单+预览） |

#### 状态轮询机制
```javascript
// 6秒轮询，最多连续失败5次
pollIntervalRef.current = setInterval(async () => {
  const response = await fetch(`/api/video-generation/status/${taskId}`);
  const data = await response.json();

  if (data.status === 'completed' || data.status === 'failed') {
    stopPolling();
  }
}, 6000);
```

---

### 3. 用户认证系统

**路径**: `lib/auth/*`, `components/auth/*`

#### 认证方式
1. **Google OAuth**（网页端主要方式）
   - 通过 Supabase Auth 实现
   - 回调路径: `app/[locale]/auth/callback/route.ts`

2. **Bearer Token**（Chrome 插件专用）
   - 插件通过 `chrome.identity.getAuthToken()` 获取 Google token
   - 发送到 `/api/video/process` 时附带 `Authorization: Bearer <token>`
   - 服务端通过 `supabase.auth.getUser(token)` 验证

#### Google One Tap
```typescript
// components/auth/GoogleOneTap.tsx
// 自动弹出 Google 登录窗口（仅未登录用户）
useEffect(() => {
  if (!user && !loading) {
    // 加载 Google One Tap SDK
    window.google.accounts.id.initialize({...});
    window.google.accounts.id.prompt();
  }
}, [user, loading]);
```

#### 关键文件
| 文件 | 职责 |
|------|------|
| `lib/auth/context.tsx` | AuthContext 全局状态管理 |
| `lib/auth/hooks.ts` | useAuth Hook |
| `components/auth/GoogleOneTap.tsx` | Google One Tap 组件 |
| `app/[locale]/auth/callback/route.ts` | OAuth 回调处理 |

---

### 4. 积分系统

**路径**: `lib/credits/*`, `contexts/CreditsContext.tsx`

#### 双轨积分架构

```
┌─────────────────────────────────────────┐
│         CreditsContext (全局状态)         │
├─────────────────────────────────────────┤
│  - credits: number                      │
│  - source: 'database' | 'cookie'        │
│  - hasCredits: boolean                  │
│  - consumeCredit()                      │
│  - refresh()                            │
└─────────────────────────────────────────┘
           ↓                    ↓
  ┌────────────────┐    ┌──────────────────┐
  │ Database Track │    │   Cookie Track   │
  ├────────────────┤    ├──────────────────┤
  │ 已登录用户      │    │  未登录访客       │
  │ Supabase 存储  │    │ localStorage     │
  │ 服务端扣除      │    │ 客户端扣除        │
  └────────────────┘    └──────────────────┘
```

#### Cookie 积分管理
```typescript
// lib/credits/cookie.ts
export class CookieCreditsManager {
  static getCreditsCount(): number {
    const data = this.getData();
    return data?.credits || 0;
  }

  static consumeCredit(): { success: boolean; remainingCredits: number } {
    const data = this.getData();
    if (!data || data.credits < 1) {
      return { success: false, remainingCredits: 0 };
    }

    data.credits -= 1;
    this.saveData(data);
    return { success: true, remainingCredits: data.credits };
  }
}
```

#### 关键文件
| 文件 | 职责 |
|------|------|
| `contexts/CreditsContext.tsx` | 全局积分状态管理 |
| `lib/credits/cookie.ts` | Cookie 积分管理工具类 |
| `hooks/useCredits.tsx` | 积分 Hook（实际导出 CreditsContext） |
| `components/credits/CreditsDisplay.tsx` | 积分显示组件 |

---

### 5. 支付系统

**路径**: `lib/payment/*`, `app/api/payment/*`

#### Stripe 集成
- **双币种支持**：USD（美元）/ CNY（人民币）
- **套餐定价**：
  - 美元：$10=30积分, $50=400积分, $100=1000积分
  - 人民币：¥10=10积分, ¥50=70积分, ¥100=200积分

#### 支付流程
```
用户选择套餐
  → POST /api/payment/create-session
  → 创建 Stripe Checkout Session
  → 记录到 payment_records 表（status: pending）
  → 跳转到 Stripe 支付页面
  → 支付成功 → Stripe Webhook 回调
  → POST /api/payment/webhook
  → 验证签名
  → 调用 completePayment()
  → 充值积分（RPC add_credits）
  → 更新 payment_records.status = completed
```

#### Webhook 验证
```typescript
// app/api/payment/webhook/route.ts
const sig = request.headers.get('stripe-signature');
const event = stripe.webhooks.constructEvent(body, sig, webhookSecret);

if (event.type === 'checkout.session.completed') {
  await completePayment(session.id);
}
```

#### 关键文件
| 文件 | 职责 |
|------|------|
| `lib/payment/service.ts` | 支付逻辑（创建会话、完成支付） |
| `lib/payment/stripe.ts` | Stripe SDK 封装 |
| `lib/payment/types.ts` | 套餐配置与类型定义 |
| `app/api/payment/webhook/route.ts` | Stripe Webhook 处理 |

---

### 6. 博客系统

**路径**: `lib/blog/*`, `app/[locale]/blog/*`

#### 基于 MDX 的博客
- 文章存储：`content/blog/{locale}/{slug}.mdx`
- 支持中英文双语
- 自动生成阅读时间
- 标签分类与搜索

#### 文章结构
```
content/blog/
├── en/
│   ├── getting-started.mdx
│   ├── ai-watermark-removal.mdx
│   └── sora-2-remove-watermark-guide.mdx
└── zh/
    ├── getting-started.mdx
    └── ...
```

#### 关键功能
```typescript
// lib/blog/utils.ts
export function getAllPosts(lang: Language): BlogPost[] {
  const langDir = path.join(contentDirectory, lang);
  const files = fs.readdirSync(langDir).filter(file => file.endsWith('.mdx'));

  return files.map(filename => {
    const slug = filename.replace('.mdx', '');
    return getPostBySlug(slug, lang);
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
```

#### 关键文件
| 文件 | 职责 |
|------|------|
| `lib/blog/utils.ts` | 博客工具函数（读取、搜索、相关文章） |
| `app/[locale]/blog/page.tsx` | 博客列表页 |
| `app/[locale]/blog/[slug]/page.tsx` | 博客详情页 |
| `components/blog/MDXComponents.tsx` | MDX 自定义组件 |

---

### 7. 国际化系统

**路径**: `i18n.ts`, `i18n.config.ts`, `messages/*`

#### 路由结构
```
/en/              → 英文首页
/zh/              → 中文首页
/en/pricing       → 英文定价页
/zh/pricing       → 中文定价页
```

#### 实现方式
- **next-intl** 插件
- **路由前缀**: `localePrefix: 'always'`
- **支持的语言**: `['en', 'zh', 'ja', 'de', 'zh-hant']`
- **前端显示**: 只显示中英文（`displayLocales`）

#### 翻译文件
```
messages/
├── en.json    → 英文翻译
└── zh.json    → 中文翻译
```

#### 使用示例
```typescript
// 组件中使用
import { useTranslations } from 'next-intl';

const t = useTranslations('video');
<h1>{t('title')}</h1>
```

---

### 8. Sora2 Prompt 展示系统

**路径**: `app/[locale]/sora2prompt/*`, `components/prompt/*`

#### 数据来源
- 从 Cloudflare R2 存储加载 JSON 数据
- 包含视频、提示词、分类标签

#### 功能特性
- 分类筛选（Nature, People, Abstract 等）
- 视频播放预览
- 提示词复制功能

#### 关键文件
| 文件 | 职责 |
|------|------|
| `app/[locale]/sora2prompt/page.tsx` | Prompt 展示页面 |
| `components/prompt/PromptCard.tsx` | Prompt 卡片组件 |
| `components/prompt/CategoryFilter.tsx` | 分类筛选器 |
| `components/prompt/VideoModal.tsx` | 视频播放模态框 |

---

### 9. 管理后台

**路径**: `app/admin/*`, `lib/admin/*`

#### 功能模块
- **统计仪表盘**：用户数、处理次数、成功率
- **用户管理**：查看所有用户及积分
- **操作日志**：记录所有视频处理记录

#### 权限控制
```typescript
// lib/admin/auth.ts
export async function isAdmin(): Promise<boolean> {
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',');
  const { user } = await getCurrentUser();

  return user?.email ? adminEmails.includes(user.email) : false;
}
```

#### 关键文件
| 文件 | 职责 |
|------|------|
| `lib/admin/queries.ts` | 管理后台数据查询 |
| `lib/admin/logger.ts` | 操作日志记录 |
| `app/admin/page.tsx` | 管理后台主页 |
| `components/admin/StatsCards.tsx` | 统计卡片 |

---

### 10. Chrome 扩展

**路径**: `chrome-extension/*`

#### 功能
- 在 Sora2 官网注入"去水印"按钮
- 通过 Bearer Token 调用后端 API
- 一键复制无水印视频链接

#### 通信流程
```
Content Script (注入按钮)
  → Background Script (处理 OAuth)
  → chrome.identity.getAuthToken()
  → 发送 Bearer Token 到 API
  → 返回无水印视频 URL
```

#### 关键文件
| 文件 | 职责 |
|------|------|
| `chrome-extension/manifest.json` | 扩展配置 |
| `chrome-extension/content.js` | 页面脚本（注入按钮） |
| `chrome-extension/background.js` | 后台脚本（OAuth、API 调用） |
| `chrome-extension/popup.html` | 弹出窗口 UI |

---

## 技术架构

### 前端架构
```
┌──────────────────────────────────────┐
│      Next.js 15 App Router           │
│  (React 19 Server Components)        │
├──────────────────────────────────────┤
│  ┌────────────┐  ┌─────────────┐    │
│  │ AuthContext│  │CreditsContext│    │
│  └────────────┘  └─────────────┘    │
│                                      │
│  Components:                         │
│  - VideoProcessor                    │
│  - VideoGenerator                    │
│  - PaymentPackages                   │
│  - BlogCard / BlogContent            │
└──────────────────────────────────────┘
```

### 后端架构
```
┌──────────────────────────────────────┐
│        API Routes (Next.js)          │
├──────────────────────────────────────┤
│  /api/video/process                  │
│  /api/video-generation/*             │
│  /api/payment/*                      │
│  /api/admin/*                        │
└──────────────────────────────────────┘
         ↓                    ↓
  ┌─────────────┐      ┌───────────────┐
  │  Supabase   │      │ Third-party   │
  │  (Auth+DB)  │      │ APIs          │
  ├─────────────┤      ├───────────────┤
  │ - Auth      │      │ - Sora API    │
  │ - Profiles  │      │ - AICoding    │
  │ - Credits   │      │ - Stripe      │
  │ - Logs      │      └───────────────┘
  └─────────────┘
```

### 数据流向
```
用户操作
  → React Component
  → fetch(/api/...)
  → API Route Handler
  → lib/* 业务逻辑
  → Supabase / 第三方 API
  → 返回结果
  → 更新 Context / State
  → UI 重新渲染
```

---

## 项目结构

```
RemoveWM/
├── app/                          # Next.js 15 App Router
│   ├── [locale]/                 # 国际化路由
│   │   ├── page.tsx              # 首页
│   │   ├── pricing/              # 定价页
│   │   ├── dashboard/            # 用户仪表盘
│   │   ├── blog/                 # 博客
│   │   ├── sora2prompt/          # Prompt 展示
│   │   ├── video-generation/     # AI 视频生成
│   │   └── auth/callback/        # OAuth 回调
│   ├── api/                      # API Routes
│   │   ├── video/
│   │   │   ├── process/          # 视频去水印
│   │   │   └── download/         # 视频下载代理
│   │   ├── video-generation/     # AI 视频生成 API
│   │   ├── payment/              # 支付 API
│   │   ├── admin/                # 管理后台 API
│   │   └── user/profile/         # 用户信息 API
│   ├── admin/                    # 管理后台页面
│   ├── globals.css               # 全局样式
│   └── layout.tsx                # 根布局
│
├── components/                   # React 组件
│   ├── auth/                     # 认证组件
│   │   ├── AuthForm.tsx
│   │   ├── GoogleOneTap.tsx
│   │   └── NavUserProfile.tsx
│   ├── video/                    # 视频处理组件
│   │   ├── VideoProcessor.tsx    # 去水印表单
│   │   └── VideoResult.tsx       # 结果展示
│   ├── video-generation/         # AI 视频生成组件
│   │   └── VideoGenerator.tsx    # 完整的生成界面
│   ├── payment/                  # 支付组件
│   │   └── PaymentPackages.tsx
│   ├── blog/                     # 博客组件
│   ├── prompt/                   # Prompt 展示组件
│   ├── admin/                    # 管理后台组件
│   ├── credits/                  # 积分组件
│   ├── layout/                   # 布局组件
│   ├── language/                 # 语言切换组件
│   └── turnstile/                # Turnstile 验证组件
│
├── lib/                          # 业务逻辑库
│   ├── auth/                     # 认证逻辑
│   │   ├── context.tsx           # AuthContext
│   │   ├── hooks.ts              # useAuth
│   │   └── types.ts
│   ├── credits/                  # 积分逻辑
│   │   ├── cookie.ts             # Cookie 积分管理
│   │   └── types.ts
│   ├── video/                    # 视频处理逻辑
│   │   ├── api.ts                # 第三方 API 调用
│   │   ├── service.ts            # 双轨积分处理
│   │   └── types.ts
│   ├── payment/                  # 支付逻辑
│   │   ├── service.ts            # 支付流程
│   │   ├── stripe.ts             # Stripe 封装
│   │   └── types.ts
│   ├── blog/                     # 博客逻辑
│   │   ├── utils.ts              # MDX 解析
│   │   └── types.ts
│   ├── admin/                    # 管理后台逻辑
│   │   ├── queries.ts            # 数据查询
│   │   ├── logger.ts             # 日志记录
│   │   └── auth.ts               # 权限验证
│   ├── supabase/                 # Supabase 客户端
│   │   ├── client.ts             # 浏览器端
│   │   ├── server.ts             # 服务端
│   │   ├── admin.ts              # Admin 客户端
│   │   └── middleware.ts         # Session 更新
│   ├── r2/                       # Cloudflare R2
│   │   └── client.ts
│   ├── turnstile/                # Cloudflare Turnstile
│   │   └── verify.ts
│   └── navigation.ts             # 国际化导航
│
├── contexts/                     # React Contexts
│   └── CreditsContext.tsx        # 积分全局状态
│
├── hooks/                        # 自定义 Hooks
│   └── useCredits.tsx            # 积分 Hook
│
├── content/                      # 内容文件
│   └── blog/
│       ├── en/                   # 英文博客
│       └── zh/                   # 中文博客
│
├── messages/                     # i18n 翻译文件
│   ├── en.json
│   └── zh.json
│
├── supabase/                     # Supabase 配置
│   └── migrations/               # 数据库迁移脚本
│
├── scripts/                      # 脚本工具
│   ├── crawl-sora-prompts.js     # 爬取 Prompt
│   ├── create-blog-post.js       # 创建博客文章
│   └── test-r2-connection.js     # 测试 R2 连接
│
├── chrome-extension/             # Chrome 扩展
│   ├── manifest.json
│   ├── background.js
│   ├── content.js
│   └── popup.html
│
├── public/                       # 静态资源
│
├── middleware.ts                 # Next.js 中间件
├── i18n.ts                       # i18n 配置
├── i18n.config.ts                # i18n 配置（前端）
├── next.config.js                # Next.js 配置
├── tailwind.config.ts            # Tailwind 配置
├── tsconfig.json                 # TypeScript 配置
└── package.json                  # 依赖配置
```

---

## 数据流与状态管理

### 全局状态
```typescript
// 1. AuthContext (lib/auth/context.tsx)
interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{error}>;
  signIn: (email: string, password: string) => Promise<{error}>;
  signInWithGoogle: (customRedirect?: string) => Promise<{error}>;
  signOut: () => Promise<void>;
}

// 2. CreditsContext (contexts/CreditsContext.tsx)
interface CreditsContextValue {
  credits: number;
  source: 'database' | 'cookie';
  loading: boolean;
  error: string | null;
  hasCredits: boolean;
  isLoggedIn: boolean;
  refresh: () => Promise<void>;
  consumeCredit: () => {success: boolean, remainingCredits: number};
  getVisitorId: () => string | null;
}
```

### 组件状态
- **VideoProcessor**: 表单状态、加载状态、错误状态、视频 URL
- **VideoGenerator**: 任务状态轮询、进度条、模型选择
- **PaymentPackages**: 选中套餐、加载状态

---

## API 端点

### 视频处理
| 端点 | 方法 | 认证 | 说明 |
|------|------|------|------|
| `/api/video/process` | POST | Bearer/Cookie | 视频去水印 |
| `/api/video/download` | GET | - | 视频下载代理 |

### AI 视频生成
| 端点 | 方法 | 认证 | 说明 |
|------|------|------|------|
| `/api/video-generation/create` | POST | Cookie | 创建生成任务 |
| `/api/video-generation/status/[taskId]` | GET | Cookie | 查询任务状态 |

### 支付
| 端点 | 方法 | 认证 | 说明 |
|------|------|------|------|
| `/api/payment/create-session` | POST | Cookie | 创建支付会话 |
| `/api/payment/webhook` | POST | Stripe签名 | Stripe Webhook |

### 管理后台
| 端点 | 方法 | 认证 | 说明 |
|------|------|------|------|
| `/api/admin/stats` | GET | Admin | 统计数据 |
| `/api/admin/users` | GET | Admin | 用户列表 |
| `/api/admin/logs` | GET | Admin | 操作日志 |

### 用户
| 端点 | 方法 | 认证 | 说明 |
|------|------|------|------|
| `/api/user/profile` | GET | Bearer/Cookie | 用户信息 |

---

## 数据库设计

### Supabase 表结构

#### user_profiles (用户信息表)
```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  credits INTEGER DEFAULT 3,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### video_processes (视频处理记录)
```sql
CREATE TABLE video_processes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  original_link TEXT NOT NULL,
  processed_url TEXT,
  status TEXT CHECK (status IN ('processing', 'completed', 'failed')),
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);
```

#### payment_records (支付记录)
```sql
CREATE TABLE payment_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  amount INTEGER NOT NULL,
  credits INTEGER NOT NULL,
  status TEXT CHECK (status IN ('pending', 'completed', 'failed')),
  stripe_session_id TEXT UNIQUE,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);
```

#### usage_logs (操作日志)
```sql
CREATE TABLE usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  user_email TEXT,
  original_url TEXT,
  processed_url TEXT,
  credits_used INTEGER,
  credits_remaining INTEGER,
  status TEXT,
  error_message TEXT,
  platform TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### RPC 函数

#### consume_credit (扣除积分)
```sql
CREATE OR REPLACE FUNCTION consume_credit(user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE user_profiles
  SET credits = GREATEST(credits - 1, 0),
      updated_at = NOW()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;
```

#### add_credits (充值积分)
```sql
CREATE OR REPLACE FUNCTION add_credits(user_id UUID, amount INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE user_profiles
  SET credits = credits + amount,
      updated_at = NOW()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;
```

---

## 关键组件说明

### VideoProcessor
**路径**: `components/video/VideoProcessor.tsx`

核心逻辑：
- 集成 Turnstile 人机验证（未登录用户）
- 双轨积分检查
- 视频链接验证
- 错误处理与提示

### VideoGenerator
**路径**: `components/video-generation/VideoGenerator.tsx`

核心逻辑：
- 模型选择（sora2 / sora2-unwm）
- 图片上传与 Base64 转换
- 任务状态轮询（6秒间隔）
- 模拟进度条（80秒线性增长）
- 视频下载功能

### CreditsContext
**路径**: `contexts/CreditsContext.tsx`

核心逻辑：
- 自动检测用户登录状态
- 切换数据库/Cookie 积分轨道
- 全局积分状态管理
- 提供 refresh() 和 consumeCredit() 方法

### AuthContext
**路径**: `lib/auth/context.tsx`

核心逻辑：
- Supabase Auth 封装
- 监听认证状态变化
- 提供登录/注册/登出方法

---

## 环境配置

### 必需的环境变量
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# Sora API (去水印)
SORA_API_URL=https://xxx
SORA_API_KEY=xxx

# AICoding API (视频生成)
AICODING_API_KEY=xxx

# Stripe
STRIPE_SECRET_KEY=sk_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Cloudflare Turnstile
NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x4xxx
TURNSTILE_SECRET_KEY=0x4xxx

# Cloudflare R2 (可选)
R2_ACCOUNT_ID=xxx
R2_ACCESS_KEY_ID=xxx
R2_SECRET_ACCESS_KEY=xxx
R2_BUCKET_NAME=xxx

# 管理员邮箱
ADMIN_EMAILS=admin@example.com,admin2@example.com
```

---

## 开发指南

### 启动开发服务器
```bash
npm run dev         # 启动开发服务器 (localhost:3000)
npm run build       # 生产构建
npm run start       # 启动生产服务器
npm run lint        # 代码检查
```

### 创建博客文章
```bash
npm run blog        # 运行交互式博客创建脚本
```

### 数据库迁移
```bash
# 在 Supabase Dashboard 中执行 SQL:
supabase/migrations/xxx.sql
```

### Chrome 扩展开发
1. 打开 Chrome 扩展管理页面
2. 启用"开发者模式"
3. 加载 `chrome-extension/` 目录
4. 修改代码后点击"重新加载"

---

## 常见问题

### 1. 积分扣除后未更新显示
**解决方案**: 调用 `refreshCredits()` 刷新状态
```typescript
await refreshCredits();
```

### 2. Stripe Webhook 未触发
**检查清单**:
- Webhook URL 是否正确配置
- Webhook 签名密钥是否正确
- 测试环境使用 Stripe CLI 转发

### 3. Chrome 扩展无法调用 API
**检查清单**:
- CORS 配置是否包含扩展 ID
- Bearer Token 是否正确传递
- 用户是否已登录 Google

### 4. 国际化路由跳转错误
**解决方案**: 使用 `lib/navigation.ts` 导出的 `Link` 和 `useRouter`
```typescript
import { Link, useRouter } from '@/lib/navigation';
```

---

## 代码规范

### TypeScript
- 所有组件必须有类型定义
- 优先使用 `interface` 而非 `type`
- API 响应必须定义类型

### 组件
- 使用函数组件
- Hooks 必须在组件顶层调用
- 避免深层嵌套（最多3层）

### 文件命名
- 组件：PascalCase (e.g., `VideoProcessor.tsx`)
- 工具函数：camelCase (e.g., `utils.ts`)
- API 路由：kebab-case (e.g., `create-session/route.ts`)

---

## 性能优化建议

1. **图片优化**: 使用 `next/image` 组件
2. **代码分割**: 大组件使用 `dynamic import`
3. **API 缓存**: 使用 SWR 或 React Query
4. **数据库查询**: 添加索引、避免 N+1 查询
5. **CDN 加速**: 静态资源使用 Cloudflare R2

---

## 安全建议

1. **永远不要在客户端暴露 Service Role Key**
2. **所有用户输入必须验证和清理**
3. **API 端点必须有认证和授权检查**
4. **使用 HTTPS（生产环境必须）**
5. **定期更新依赖以修复安全漏洞**

---

## 部署

### Vercel 部署
```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel --prod
```

### 环境变量配置
在 Vercel Dashboard 中配置所有环境变量

### 域名配置
1. 添加自定义域名
2. 配置 DNS 记录
3. 启用 HTTPS

---

## 许可证

本项目为私有项目，版权所有。

---

**维护者**: Claude AI
**最后更新**: 2025-10-21
**文档版本**: 2.0

如有任何问题，请联系项目维护者或查阅相关文档。