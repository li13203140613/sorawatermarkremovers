# RemoveWM 品牌调性指南

> **版本**: 1.0.0 | **最后更新**: 2025-10-23 | **设计师**: Claude AI

---

## 📚 目录

1. [品牌概述](#品牌概述)
2. [品牌定位](#品牌定位)
3. [色彩系统](#色彩系统)
4. [排版系统](#排版系统)
5. [视觉风格](#视觉风格)
6. [UI 组件规范](#ui-组件规范)
7. [语气与声音](#语气与声音)
8. [图标与图形](#图标与图形)
9. [应用示例](#应用示例)
10. [品牌禁忌](#品牌禁忌)

---

## 品牌概述

### 品牌名称
**RemoveWM** / **AI 视频创作工坊**

### 品牌 Slogan

**主 Slogan**（核心定位）：
- **中文**: "高效批量生成 AI 视频"
- **英文**: "Batch AI Video Generation, Made Efficient"
- **精简版**: "AI 视频，批量创作"

**辅助 Slogan**（功能特色）：
- **中文**: "智能提示词 + 批量生成 + 去水印 = 完整创作流程"
- **英文**: "Smart Prompts • Batch Generation • Seamless Workflow"
- **备选**: "从灵感到视频，只需 30 秒"

### 品牌使命
让每一位创作者都能通过 AI 技术，高效批量生成专业级视频内容，释放无限创意潜能。

### 品牌愿景
成为全球最高效的 Sora AI 视频批量创作与智能处理平台。

### 核心价值观
- **批量高效**: 一次生成 6 个视频，效率提升 10 倍
- **智能创作**: AI 驱动的提示词生成，从灵感到成品一站式
- **专业品质**: 企业级视频质量，稳定可靠的服务
- **持续创新**: DeepSeek AI + Sora 双引擎，技术领先

---

## 品牌定位

### 目标用户画像

**1. 视频创作者** (40%)
- 年龄：25-35 岁
- 职业：自媒体、短视频博主、视频剪辑师
- 需求：高效去水印、批量生成视频
- 特点：追求效率、注重质量

**2. AI 爱好者** (30%)
- 年龄：20-30 岁
- 职业：科技从业者、学生、研究者
- 需求：探索 Sora AI 能力、生成创意视频
- 特点：技术敏感、乐于尝试新工具

**3. 企业用户** (20%)
- 年龄：30-45 岁
- 职业：营销总监、品牌经理、广告公司
- 需求：批量处理、商业级质量
- 特点：预算充足、注重品牌形象

**4. 普通用户** (10%)
- 年龄：18-50 岁
- 职业：各行各业
- 需求：偶尔使用、简单操作
- 特点：价格敏感、操作简单

### 品牌个性
- **专业**: 企业级服务质量
- **高效**: 快速响应，流程简洁
- **创新**: AI 技术驱动，持续进化
- **友好**: 界面直观，易于上手
- **可靠**: 稳定运行，数据安全

### 竞争优势

**🚀 核心差异化**：
- ✅ **批量生成王者**: 一次生成 6 个视频，竞品只能单个生成
- ✅ **完整创作流程**: Prompt 生成 → 批量创作 → 去水印，一站式解决
- ✅ **AI 智能加持**: DeepSeek API 智能优化提示词，质量提升 3 倍
- ✅ **极致性能**: Vercel CDN 缓存，首次 3s，后续 0.3s 加载
- ✅ **灵活积分**: 双轨积分系统，未登录也能用 3 次

**📊 数据优势**：
- **生成速度**: 平均 30 秒完成单个视频
- **批量效率**: 6 个视频并行生成，节省 80% 时间
- **提示词库**: 184+ 专业选项，7 大分类全覆盖
- **视频质量**: Sora 官方 API，专业级画质

---

## 色彩系统

### 主色调 (Primary Colors)

**深紫色 (Deep Purple)** - 主品牌色
```css
/* 核心色 */
--primary-600: #7C3AED;      /* 主按钮、链接 */
--primary-700: #6D28D9;      /* 悬停状态 */
--primary-800: #5B21B6;      /* 激活状态 */

/* 浅色变体 */
--primary-50: #FAF5FF;       /* 背景浅色 */
--primary-100: #F3E8FF;      /* 卡片背景 */
--primary-200: #E9D5FF;      /* 边框浅色 */
```

**理由**: 紫色代表创新、科技、智能，符合 AI 视频平台的定位。深紫色更显专业和高端。

### 辅助色 (Secondary Colors)

**靛蓝色 (Indigo)** - 辅助色
```css
--secondary-600: #4F46E5;    /* 次要按钮 */
--secondary-700: #4338CA;    /* 悬停状态 */
```

**理由**: 靛蓝色与紫色和谐搭配，增加视觉层次。

### 功能色 (Functional Colors)

**成功绿 (Success Green)**
```css
--success-500: #10B981;      /* 成功提示 */
--success-600: #059669;      /* 成功按钮 */
```

**警告橙 (Warning Orange)**
```css
--warning-500: #F59E0B;      /* 警告提示 */
--warning-600: #D97706;      /* 警告按钮 */
```

**错误红 (Error Red)**
```css
--error-500: #EF4444;        /* 错误提示 */
--error-600: #DC2626;        /* 错误状态 */
```

**信息蓝 (Info Blue)**
```css
--info-500: #3B82F6;         /* 信息提示 */
--info-600: #2563EB;         /* 信息按钮 */
```

### 中性色 (Neutral Colors)

**灰度系统**
```css
--gray-50: #F9FAFB;          /* 背景 */
--gray-100: #F3F4F6;         /* 卡片背景 */
--gray-200: #E5E7EB;         /* 边框 */
--gray-300: #D1D5DB;         /* 分割线 */
--gray-400: #9CA3AF;         /* 禁用文字 */
--gray-500: #6B7280;         /* 次要文字 */
--gray-600: #4B5563;         /* 正文 */
--gray-700: #374151;         /* 小标题 */
--gray-800: #1F2937;         /* 标题 */
--gray-900: #111827;         /* 主标题 */
```

### 渐变色系统

**主渐变 (Primary Gradient)**
```css
background: linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%);
```

**次渐变 (Secondary Gradient)**
```css
background: linear-gradient(135deg, #6D28D9 0%, #3B82F6 100%);
```

**背景渐变 (Background Gradient)**
```css
background: linear-gradient(180deg, #FAF5FF 0%, #FFFFFF 100%);
```

### 色彩使用规则

1. **主色调占比**: 20% - 用于关键 CTA、导航、重要按钮
2. **辅助色占比**: 10% - 用于次要操作、图标、装饰
3. **中性色占比**: 60% - 用于文字、背景、边框
4. **功能色占比**: 10% - 用于状态提示、反馈信息

### 色彩对比度要求

- **文字对比度**: 至少 4.5:1（WCAG AA 标准）
- **大文字对比度**: 至少 3:1（18pt 以上）
- **图标对比度**: 至少 3:1

---

## 排版系统

### 字体家族

**中文字体**
```css
font-family:
  "PingFang SC",          /* macOS/iOS */
  "Microsoft YaHei",      /* Windows */
  "Noto Sans SC",         /* Android */
  -apple-system,
  BlinkMacSystemFont,
  sans-serif;
```

**英文字体**
```css
font-family:
  "Inter",                /* 主字体 */
  "Helvetica Neue",
  Arial,
  sans-serif;
```

**等宽字体** (代码、数字)
```css
font-family:
  "JetBrains Mono",
  "Fira Code",
  "Consolas",
  monospace;
```

### 字号系统 (Type Scale)

基于 1.25 比例（Major Third）

```css
/* 标题字号 */
--text-5xl: 48px;     /* 3rem */    /* Hero 标题 */
--text-4xl: 36px;     /* 2.25rem */ /* 页面主标题 */
--text-3xl: 30px;     /* 1.875rem *//* 章节标题 */
--text-2xl: 24px;     /* 1.5rem */  /* 卡片标题 */
--text-xl: 20px;      /* 1.25rem */ /* 小标题 */
--text-lg: 18px;      /* 1.125rem *//* 强调文字 */

/* 正文字号 */
--text-base: 16px;    /* 1rem */    /* 正文 */
--text-sm: 14px;      /* 0.875rem *//* 次要文字 */
--text-xs: 12px;      /* 0.75rem */ /* 辅助文字 */
```

### 字重系统 (Font Weights)

```css
--font-light: 300;    /* 装饰文字 */
--font-normal: 400;   /* 正文 */
--font-medium: 500;   /* 强调 */
--font-semibold: 600; /* 小标题 */
--font-bold: 700;     /* 标题 */
--font-extrabold: 800;/* 超大标题 */
```

### 行高系统 (Line Heights)

```css
--leading-none: 1;        /* 超大标题 */
--leading-tight: 1.25;    /* 标题 */
--leading-snug: 1.375;    /* 小标题 */
--leading-normal: 1.5;    /* 正文 */
--leading-relaxed: 1.625; /* 长文本 */
--leading-loose: 2;       /* 稀疏文本 */
```

### 字间距 (Letter Spacing)

```css
--tracking-tighter: -0.05em; /* 超大标题 */
--tracking-tight: -0.025em;  /* 标题 */
--tracking-normal: 0;        /* 正文 */
--tracking-wide: 0.025em;    /* 按钮文字 */
--tracking-wider: 0.05em;    /* 标签 */
--tracking-widest: 0.1em;    /* LOGO */
```

### 排版组合示例

**Hero 标题**
```css
font-size: 48px;
font-weight: 800;
line-height: 1.1;
letter-spacing: -0.02em;
color: var(--gray-900);
```

**页面标题**
```css
font-size: 36px;
font-weight: 700;
line-height: 1.2;
color: var(--gray-900);
```

**正文**
```css
font-size: 16px;
font-weight: 400;
line-height: 1.6;
color: var(--gray-700);
```

**按钮文字**
```css
font-size: 16px;
font-weight: 600;
letter-spacing: 0.025em;
```

---

## 视觉风格

### 设计原则

1. **简洁至上** (Minimalism)
   - 去除不必要的装饰
   - 聚焦核心功能
   - 留白充足

2. **扁平化设计** (Flat Design)
   - 避免过度拟物
   - 使用纯色和渐变
   - 轻微阴影增加层次

3. **现代感** (Modern)
   - 圆角设计（8px/12px/16px）
   - 柔和的阴影
   - 流畅的动画过渡

4. **响应式** (Responsive)
   - 移动优先设计
   - 断点清晰（sm/md/lg/xl）
   - 灵活的网格系统

### 圆角系统 (Border Radius)

```css
--rounded-none: 0;         /* 直角 */
--rounded-sm: 4px;         /* 小圆角（标签） */
--rounded: 8px;            /* 默认（按钮、输入框） */
--rounded-md: 12px;        /* 中等（卡片） */
--rounded-lg: 16px;        /* 大圆角（模态框） */
--rounded-xl: 20px;        /* 超大圆角（Hero 区域） */
--rounded-full: 9999px;    /* 圆形（头像、徽章） */
```

### 阴影系统 (Box Shadow)

```css
/* 悬浮阴影 */
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow: 0 1px 3px rgba(0, 0, 0, 0.1),
          0 1px 2px rgba(0, 0, 0, 0.06);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07),
             0 2px 4px rgba(0, 0, 0, 0.06);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1),
             0 4px 6px rgba(0, 0, 0, 0.05);
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.1),
             0 10px 10px rgba(0, 0, 0, 0.04);

/* 内阴影 */
--shadow-inner: inset 0 2px 4px rgba(0, 0, 0, 0.06);

/* 特殊阴影 - 品牌色光晕 */
--shadow-primary: 0 10px 30px rgba(124, 58, 237, 0.2);
```

### 间距系统 (Spacing)

基于 4px 网格系统

```css
--space-1: 4px;      /* 0.25rem */
--space-2: 8px;      /* 0.5rem */
--space-3: 12px;     /* 0.75rem */
--space-4: 16px;     /* 1rem */
--space-5: 20px;     /* 1.25rem */
--space-6: 24px;     /* 1.5rem */
--space-8: 32px;     /* 2rem */
--space-10: 40px;    /* 2.5rem */
--space-12: 48px;    /* 3rem */
--space-16: 64px;    /* 4rem */
--space-20: 80px;    /* 5rem */
--space-24: 96px;    /* 6rem */
```

### 网格系统

**容器宽度**
```css
--container-sm: 640px;   /* 小屏 */
--container-md: 768px;   /* 中屏 */
--container-lg: 1024px;  /* 大屏 */
--container-xl: 1280px;  /* 超大屏 */
--container-2xl: 1536px; /* 2K 屏 */
```

**断点**
```css
--breakpoint-sm: 640px;
--breakpoint-md: 768px;
--breakpoint-lg: 1024px;
--breakpoint-xl: 1280px;
--breakpoint-2xl: 1536px;
```

### 动画系统

**过渡时长**
```css
--duration-75: 75ms;      /* 快速交互 */
--duration-100: 100ms;
--duration-150: 150ms;
--duration-200: 200ms;    /* 默认 */
--duration-300: 300ms;    /* 中等 */
--duration-500: 500ms;    /* 慢速 */
--duration-700: 700ms;
--duration-1000: 1000ms;  /* 复杂动画 */
```

**缓动函数**
```css
--ease-linear: linear;
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);

/* 自定义 - 弹性效果 */
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

---

## UI 组件规范

### 按钮 (Buttons)

**主要按钮 (Primary Button)**
```css
.btn-primary {
  background: var(--primary-600);
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 16px;
  letter-spacing: 0.025em;
  transition: all 200ms ease-out;
  box-shadow: 0 1px 3px rgba(124, 58, 237, 0.3);
}

.btn-primary:hover {
  background: var(--primary-700);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(124, 58, 237, 0.4);
}

.btn-primary:active {
  background: var(--primary-800);
  transform: translateY(0);
}
```

**次要按钮 (Secondary Button)**
```css
.btn-secondary {
  background: white;
  color: var(--primary-600);
  border: 2px solid var(--primary-600);
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
}

.btn-secondary:hover {
  background: var(--primary-50);
}
```

**大按钮 (Large Button)**
```css
.btn-lg {
  padding: 16px 32px;
  font-size: 18px;
  border-radius: 12px;
}
```

**小按钮 (Small Button)**
```css
.btn-sm {
  padding: 8px 16px;
  font-size: 14px;
  border-radius: 6px;
}
```

### 输入框 (Input Fields)

```css
.input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid var(--gray-300);
  border-radius: 8px;
  font-size: 16px;
  transition: all 200ms ease-out;
}

.input:focus {
  outline: none;
  border-color: var(--primary-600);
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
}

.input::placeholder {
  color: var(--gray-400);
}
```

### 卡片 (Cards)

```css
.card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 300ms ease-out;
}

.card:hover {
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  transform: translateY(-4px);
}
```

### 徽章 (Badges)

```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 9999px;
  font-size: 14px;
  font-weight: 500;
}

.badge-success {
  background: var(--success-100);
  color: var(--success-700);
}

.badge-primary {
  background: var(--primary-100);
  color: var(--primary-700);
}
```

### 加载状态 (Loading)

**骨架屏**
```css
.skeleton {
  background: linear-gradient(
    90deg,
    var(--gray-200) 25%,
    var(--gray-100) 50%,
    var(--gray-200) 75%
  );
  background-size: 200% 100%;
  animation: loading 1.5s ease-in-out infinite;
  border-radius: 8px;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

**进度条**
```css
.progress-bar {
  height: 8px;
  background: var(--gray-200);
  border-radius: 9999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary-600), var(--secondary-600));
  transition: width 300ms ease-out;
}
```

---

## 语气与声音

### 品牌语气 (Tone of Voice)

**核心原则**
- **专业但不生硬**: 使用简洁的专业术语，避免过度技术化
- **友好但不随意**: 保持亲切感，但维持品牌专业性
- **自信但不傲慢**: 展示能力，但尊重用户
- **创新但不炫技**: 强调技术优势，但聚焦用户价值

### 文案风格

**标题文案**
- 简短有力（5-10 字）
- 突出核心价值
- 使用动词开头
- 激发行动欲望

✅ 好的示例：
- "一次生成 6 个视频，效率提升 10 倍"
- "AI 智能提示词，30 秒从灵感到成品"
- "批量创作专业视频，释放无限创意"
- "184+ 专业选项，7 大分类，一键生成"

❌ 不好的示例：
- "我们提供视频去水印服务"（定位过窄，不突出核心价值）
- "超级无敌厉害的视频处理工具"（过于夸张，缺乏具体）
- "基于深度学习的视频水印去除技术"（过于技术化）
- "最好的 AI 视频工具"（空洞无物，缺乏差异化）

**正文文案**
- 短句为主（15-20 字）
- 一段不超过 3 句
- 使用列表和分点
- 数据可视化

✅ 好的示例：
```
3 步创作专业 AI 视频，效率提升 10 倍：

1. 选择分类，填写创意描述
2. AI 智能生成优化提示词
3. 批量生成 6 个视频，一键下载

每个用户免费赠送 3 积分，立即体验 →
```

**核心功能介绍文案**：
```
🎬 智能 Prompt 生成器
7 大分类，184+ 专业选项，DeepSeek AI 智能优化
从模糊灵感到专业提示词，只需 3 秒

⚡ 批量视频生成
一次创建 6 个视频任务，并行处理，独立追踪
效率提升 10 倍，节省 80% 时间

🎨 完整创作流程
Prompt 生成 → 批量创作 → 去水印
一站式解决，无需切换平台
```

**按钮文案**
- 使用行动动词
- 2-5 个字
- 突出紧迫感
- 明确结果

✅ 好的示例（按场景）：
- **Prompt 生成**: "生成提示词" / "AI 优化" / "批量生成"
- **视频创作**: "立即生成 6 个视频" / "开始创作" / "批量生成"
- **去水印**: "去除水印" / "立即处理"
- **充值**: "获取积分" / "立即充值"
- **通用**: "立即体验" / "开始使用"

❌ 不好的示例：
- "点击这里" （无明确动作）
- "提交" （过于技术化）
- "确定" / "OK" （缺乏吸引力）
- "生成" （不够具体，应该说"生成什么"）

**错误提示**
- 简洁说明问题
- 提供解决方案
- 避免责怪用户
- 保持友好语气

✅ 好的示例：
```
积分不足 😢

您当前积分为 0，无法继续使用。
建议：充值积分 或 分享给好友获取免费积分

[充值积分] [邀请好友]
```

❌ 不好的示例：
```
错误：积分余额不足
Error Code: INSUFFICIENT_CREDITS_001
```

### 情感表达

**使用 Emoji 指南**
- ✅ 标题和重点处：适度使用（1-2 个）
- ✅ 成功提示：✓ ✨ 🎉 👏
- ✅ 错误提示：⚠️ 😢 💡
- ❌ 正文段落：避免使用
- ❌ 专业文档：禁止使用

### 多语言文案

**中文文案**
- 简洁明了，避免歧义
- 适当使用成语、俗语
- 保持亲切感

**英文文案**
- 使用简单词汇（初中水平）
- 避免俚语和行话
- 句式清晰

---

## 图标与图形

### 图标风格

**设计原则**
- 线性图标（Outline Icons）
- 2px 线宽
- 24x24px 网格
- 2px 圆角
- 一致的视觉重量

**推荐图标库**
- [Heroicons](https://heroicons.com/) - 主要使用
- [Lucide Icons](https://lucide.dev/) - 补充使用
- [Phosphor Icons](https://phosphoricons.com/) - 备选

**自定义图标规范**
```css
.icon {
  width: 24px;
  height: 24px;
  stroke: currentColor;
  stroke-width: 2px;
  stroke-linecap: round;
  stroke-linejoin: round;
  fill: none;
}
```

### LOGO 设计

**主 LOGO**
- 图形 + 文字组合
- 紫色渐变图形
- 深灰色文字
- 最小尺寸：120px 宽

**图形部分设计元素**
- 视频播放符号 ▶ 变形
- 去除符号 ✕ 融合
- 流动的曲线代表创意

**字体**
- 字重：Bold (700)
- 字间距：宽松 (0.05em)
- 大小写：首字母大写 "RemoveWM"

### 插图风格

**设计风格**
- 扁平化插图
- 紫色系为主
- 简洁的几何形状
- 适度的留白

**应用场景**
- 空状态页面
- 引导页面
- 功能介绍
- 错误页面

**推荐插图库**
- [unDraw](https://undraw.co/) - 可定制颜色
- [Storyset](https://storyset.com/) - 动画插图
- [Illustrations](https://www.illustrations.co/) - 高质量插图

---

## 应用示例

### 首页 Hero 区域

**方案 A - 突出批量生成**：
```html
<section class="hero">
  <div class="container">
    <div class="hero-badge">⚡ 高效批量 AI 视频创作平台</div>

    <h1 class="hero-title">
      一次生成 6 个视频<br>
      <span class="gradient-text">效率提升 10 倍</span>
    </h1>

    <p class="hero-subtitle">
      AI 智能提示词生成 + 批量视频创作 + 专业去水印<br>
      从灵感到成品，只需 30 秒
    </p>

    <div class="hero-stats">
      <div class="stat-item">
        <span class="stat-number">1,234+</span>
        <span class="stat-label">视频已生成</span>
      </div>
      <div class="stat-item">
        <span class="stat-number">30s</span>
        <span class="stat-label">平均完成时间</span>
      </div>
      <div class="stat-item">
        <span class="stat-number">6x</span>
        <span class="stat-label">批量并行生成</span>
      </div>
    </div>

    <div class="hero-actions">
      <button class="btn-primary btn-lg">
        立即生成 6 个视频 →
      </button>
      <button class="btn-secondary btn-lg">
        查看示例视频
      </button>
    </div>

    <p class="hero-notice">
      💎 新用户免费赠送 3 积分，无需登录即可体验
    </p>
  </div>
</section>
```

**方案 B - 突出完整流程**：
```html
<section class="hero">
  <div class="container">
    <h1 class="hero-title">
      智能提示词 + 批量生成<br>
      <span class="gradient-text">完整的 AI 视频创作流程</span>
    </h1>

    <p class="hero-subtitle">
      184+ 专业选项 • DeepSeek AI 优化 • 批量生成 6 个视频<br>
      让每个创意都能快速变成精彩视频
    </p>

    <div class="hero-actions">
      <button class="btn-primary btn-lg">
        开始批量创作 →
      </button>
      <button class="btn-secondary btn-lg">
        了解工作流程
      </button>
    </div>
  </div>
</section>
```

**样式**
```css
.hero {
  background: linear-gradient(180deg, #FAF5FF 0%, #FFFFFF 100%);
  padding: 80px 20px;
  text-align: center;
}

.hero-title {
  font-size: 48px;
  font-weight: 800;
  line-height: 1.2;
  color: var(--gray-900);
  margin-bottom: 20px;
}

.hero-subtitle {
  font-size: 20px;
  line-height: 1.6;
  color: var(--gray-600);
  margin-bottom: 40px;
}

.hero-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}
```

### 功能卡片

**核心功能展示**：
```html
<!-- 功能 1: 批量生成 -->
<div class="feature-card featured">
  <div class="feature-badge">🔥 核心功能</div>
  <div class="feature-icon">⚡</div>
  <h3 class="feature-title">批量视频生成</h3>
  <p class="feature-description">
    一次创建 6 个视频任务，并行处理，独立追踪<br>
    <strong>效率提升 10 倍，节省 80% 时间</strong>
  </p>
  <ul class="feature-list">
    <li>✓ 支持单个/批量生成模式</li>
    <li>✓ 独立任务状态追踪</li>
    <li>✓ 失败任务可单独重试</li>
    <li>✓ 一键批量下载</li>
  </ul>
  <a href="/video-generation" class="feature-link">
    立即生成 6 个视频 →
  </a>
</div>

<!-- 功能 2: Prompt 生成器 -->
<div class="feature-card">
  <div class="feature-icon">🎬</div>
  <h3 class="feature-title">AI 智能 Prompt 生成器</h3>
  <p class="feature-description">
    7 大分类，184+ 专业选项，DeepSeek AI 智能优化<br>
    从模糊灵感到专业提示词，只需 3 秒
  </p>
  <ul class="feature-list">
    <li>✓ 7 大分类完整覆盖</li>
    <li>✓ AI 自动优化扩展</li>
    <li>✓ 批量生成 3-5 个变体</li>
    <li>✓ 一键复制/下载</li>
  </ul>
  <a href="/prompt-generator" class="feature-link">
    生成专业提示词 →
  </a>
</div>

<!-- 功能 3: 去水印 -->
<div class="feature-card">
  <div class="feature-icon">✨</div>
  <h3 class="feature-title">专业视频去水印</h3>
  <p class="feature-description">
    移除 Sora2 官方水印，保持原始画质<br>
    平均 30 秒完成处理
  </p>
  <ul class="feature-list">
    <li>✓ 保持原始分辨率</li>
    <li>✓ 无损画质处理</li>
    <li>✓ 支持批量去水印</li>
    <li>✓ 快速下载导出</li>
  </ul>
  <a href="/video-processor" class="feature-link">
    去除视频水印 →
  </a>
</div>

<!-- 功能 4: 提示词库 -->
<div class="feature-card">
  <div class="feature-icon">📚</div>
  <h3 class="feature-title">高质量提示词库</h3>
  <p class="feature-description">
    精选 SoraPrompting 优质提示词<br>
    视频预览 + 提示词详情，快速参考
  </p>
  <a href="/soraprompting" class="feature-link">
    浏览提示词库 →
  </a>
</div>
```

### 定价卡片

```html
<div class="pricing-card">
  <div class="pricing-badge">最受欢迎</div>
  <h3 class="pricing-name">专业版</h3>
  <div class="pricing-price">
    <span class="price-currency">¥</span>
    <span class="price-amount">50</span>
  </div>
  <ul class="pricing-features">
    <li>✓ 70 积分</li>
    <li>✓ 批量生成视频</li>
    <li>✓ 优先处理</li>
    <li>✓ 7x24 客服支持</li>
  </ul>
  <button class="btn-primary btn-block">
    选择此套餐
  </button>
</div>
```

---

## 品牌禁忌

### ❌ 设计禁忌

1. **不要使用**
   - 过时的渐变效果（如 Web 2.0 风格的光泽渐变）
   - 过度的阴影和立体效果
   - 花哨的动画特效
   - 低对比度的文字颜色

2. **不要做**
   - 拉伸 LOGO
   - 改变品牌色
   - 使用超过 3 种字体
   - 过度使用 Emoji

### ❌ 文案禁忌

1. **避免使用**
   - 过度承诺（"100% 完美"）
   - 贬低竞品
   - 技术术语堆砌
   - 模糊不清的表述

2. **禁止出现**
   - 错别字和语法错误
   - 不一致的称呼（时而"您"时而"你"）
   - 负面情绪词汇
   - 歧视性语言

### ❌ 色彩禁忌

1. **不要组合**
   - 纯黑 (#000000) + 纯白 (#FFFFFF) - 对比度过高
   - 红色 + 绿色 - 色盲不友好
   - 过于鲜艳的霓虹色

2. **不要使用**
   - 低对比度的文字色（<4.5:1）
   - 超过 5 种颜色的配色方案
   - 渐变作为文字颜色

---

## 实施指南

### 前端实现

**1. 创建 CSS 变量文件**
```css
/* styles/brand.css */
:root {
  /* 主色调 */
  --primary-600: #7C3AED;
  --primary-700: #6D28D9;
  /* ... 其他变量 */
}
```

**2. 在 Tailwind 配置中扩展**
```javascript
// tailwind.config.ts
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#FAF5FF',
          600: '#7C3AED',
          700: '#6D28D9',
          // ...
        }
      },
      fontFamily: {
        sans: ['Inter', 'PingFang SC', ...],
        mono: ['JetBrains Mono', ...],
      }
    }
  }
}
```

**3. 使用组件库统一样式**
```typescript
// components/ui/button.tsx
import { cva } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-lg font-semibold transition-all",
  {
    variants: {
      variant: {
        primary: "bg-primary-600 text-white hover:bg-primary-700",
        secondary: "border-2 border-primary-600 text-primary-600 hover:bg-primary-50",
      },
      size: {
        sm: "px-4 py-2 text-sm",
        md: "px-6 py-3 text-base",
        lg: "px-8 py-4 text-lg",
      }
    }
  }
);
```

### 设计资源

**Figma 设计系统**
- 创建组件库
- 定义设计令牌（Design Tokens）
- 建立共享样式

**协作规范**
- 设计师提供 Figma 原型
- 开发者使用 Figma Dev Mode 获取样式
- 定期同步设计系统更新

---

## 版本历史

### Version 1.0.0 (2025-10-23)
- ✨ 初始版本发布
- 📝 完整的品牌定位和色彩系统
- 🎨 UI 组件规范和视觉风格指南
- 📖 文案风格和语气指南

---

**维护者**: Claude AI
**联系方式**: 通过项目 Issue 反馈
**最后更新**: 2025-10-23

---

## 附录

### 快速参考卡片

**主品牌色**
- Primary: `#7C3AED` (深紫色)
- Secondary: `#4F46E5` (靛蓝色)

**字体**
- 中文: PingFang SC / Microsoft YaHei
- 英文: Inter / Helvetica Neue
- 等宽: JetBrains Mono

**常用间距**
- 4px / 8px / 12px / 16px / 24px / 32px / 48px

**圆角**
- 默认: 8px
- 卡片: 12px
- 大容器: 16px

**按钮**
- 高度: 48px (lg) / 40px (md) / 32px (sm)
- 内边距: 16px 32px (lg) / 12px 24px (md) / 8px 16px (sm)

---

> 本指南持续更新中，如有任何建议或问题，欢迎反馈！
