# Sora-Prompt 网站开发需求文档

## 📋 项目概述

**项目名称：** Sora-Prompt - 专业级Sora提示词生成器  
**网址：** https://www.sora-prompt.io/  
**主要功能：** 帮助用户生成高质量的Sora AI视频提示词  
**目标用户：** 内容创作者、视频制作人、AI爱好者

---

## 🎨 SEO信息

### Title
```
Create Amazing Sora AI Video Prompts with Our Free Generator
```

### Meta Description
```
Free Sora Prompt Generator - Create Viral AI Video Prompts Instantly. Generate perfect prompts for Sora AI video creation. Best prompt generator for stunning videos!
```

---

## 📐 页面架构与文案

### **1. Hero区域（H1）**

**H1 标题：**
```
Create Amazing Sora AI Video Prompts with Our Free Generator
```

**特点：**
- 简洁有力
- 包含核心关键词
- 无副标题

---

### **2. 输入区域（H2）**

**H2 标题：**
```
🚀 Start Using Sora Prompt Generator - Enter Your Video Idea
```

**结构：**
```
H3: Enter Your Video Idea
  - 输入框（Textarea）
  - Placeholder: "Example: A dog drinks coke"
  - 高度：100px

H3: Select Video Type
  - 下拉菜单（Select）
  - 选项：
    * -- Select Type --
    * Animation
    * Realistic
    * Cartoon
    * Movie

H3: Number of Prompts to Generate
  - 下拉菜单（Select）
  - 默认值：1
  - 选项：1, 2, 3, 4, 5, 6, 7, 8, 9
  - 说明：Choose how many prompt variations you want

按钮：🚀 Generate AI Prompt
```

**布局要求：**
- 最大宽度：700px
- 水平居中
- 垂直间距：40px margin
- 标题和按钮居中对齐
- 输入框左对齐

**颜色和样式：**
- 主色：#4CAF50（绿色）
- 边框：#ddd
- 圆角：4px
- 字体大小：14px

---

### **3. 结果区域（H2）**

**H2 标题：**
```
✅ Your Optimized Sora AI Prompt Results - Professional Grade Sora Prompts
```

**结构：**
```
H4: Output Content
  - 根据生成的数量显示多个提示词卡片
  - 每个卡片显示一个提示词
  - 可显示 1-9 个提示词
```

**结果卡片排版：**
```
单个提示词卡片布局：
┌─────────────────────────────┐
│ Prompt #1                   │
├─────────────────────────────┤
│ A golden retriever dog      │
│ happily drinking from a     │
│ classic red Coca-Cola can   │
│ placed on a wooden table.   │
│ Close-up cinematic shot...  │
│                             │
│ [Copy] [Share] [Download]   │
└─────────────────────────────┘
```

**展示模式：**
```
1-3个提示词：竖排（1列）
  - 每个卡片占满宽度
  - 之间有20px间距
  - 适合移动端和阅读

示例：
┌─────────────┐
│ Prompt #1   │
├─────────────┤
│ Content...  │
└─────────────┘
        ↓
┌─────────────┐
│ Prompt #2   │
├─────────────┤
│ Content...  │
└─────────────┘

4-6个提示词：2列网格
  - 每行2个卡片
  - Desktop：各占50%
  - Tablet：可调整

7-9个提示词：3列网格
  - 每行3个卡片
  - Desktop：各占33.3%
  - Tablet：可改为2列
  - Mobile：改为1列
```

**卡片样式：**
- 背景：白色 (#ffffff)
- 边框：1px solid #e0e0e0
- 内边距：20px
- 圆角：8px
- 阴影：0 2px 8px rgba(0,0,0,0.1)
- 最小高度：200px
- 字体大小：13-14px
- 行高：1.8
- 字体颜色：#333
- 间距：20px

**卡片内容结构：**
```
[Prompt #1 标号]
[编号 + 序号]

[提示词内容]
[完整的Sora优化提示词文本]

[操作按钮组]
[Copy] [Share] [Download] [Regenerate]
```

**功能需求：**
- [ ] 显示生成的所有提示词
- [ ] 每个提示词独立卡片显示
- [ ] 复制提示词到剪贴板
- [ ] 分享提示词
- [ ] 下载为TXT文件
- [ ] 单个提示词重新生成

**响应式调整：**
```
Desktop (1200px+):
  - 3列网格 (1-9个)
  - 或 2列网格 (1-6个)
  - 或 1列竖排 (1-3个)

Tablet (768px-1199px):
  - 2列网格
  - 卡片宽度：calc(50% - 10px)

Mobile (375px-767px):
  - 1列竖排
  - 卡片宽度：100%
  - 字体大小：12px
```

---

### **4. 平台提示词分享库（H2）**

**H2 标题：**
```
📚 Best Sora Prompts Gallery - Free AI Video Prompt Library
```

**子标题：**
```
Browse popular Sora prompts and get inspiration for best Sora prompt practices
```

**结构：**
```
2行3列 = 6个提示词卡片

每个卡片包含：
  - 日期：2024-10-21
  - H3：卡片标题
    * A dog drinks coke - Sora 2 Prompt
    * Cat jumping - Sora AI Video Tip
    * Dancing in rain - Viral Video Prompt
    * Viral content - Creative Video Tip
    * Nature landscape - Landscape Video Tip
    * Animation style - Anime-style Prompt
  - 描述：
    * High-quality Sora AI video generation prompt example
    * Sora animated video generator professional prompt
    * Sora 2 prompt generator viral content example
    * AI video prompt generator popular template
    * Sora prompt generator nature landscape template
    * Sora 2 animation style prompt generation example
```

**卡片样式：**
- 背景：#f5f5f5
- 边框左边：4px solid #4CAF50
- 内边距：20px
- 圆角：4px
- 边距：15px

---

### **5. 什么是Sora 2（H2）**

**H2 标题：**
```
🎬 What is Sora 2? - Complete AI Video Generator Guide
```

**背景色：** #E3F2FD（浅蓝）

**子部分：**

**H3 子标题：**
```
📹 Sora 2 AI Video Generator - OpenAI Latest Technology
```

**文本：**
```
Sora 2 is the latest AI video generation model from OpenAI. You only need to enter a simple text description, and Sora 2 will generate high-quality video content based on your Sora prompt. Whether it's movie-level special effects, realistic scenes, or creative animations, our Sora prompt generator can help you create the perfect Sora prompts.
```

---

### **6. 产品优势（H2）**

**H2 标题：**
```
⭐ Why Choose Sora-Prompt Prompt Generator?
```

**4个优势卡片：**

**卡片1 - 速度**
```
⚡ Title: 🚀 Ultra-Fast Sora Prompt Generation
Description: Generate professional-grade Sora prompts in just 3 seconds, 
100x faster than manual input
```

**卡片2 - 定制化**
```
🎯 Title: 🎨 Highly Customized Prompts
Description: Generate optimized Sora AI prompts based on your creative needs
```

**卡片3 - 走红优化**
```
🔥 Title: 📱 Viral Content Optimization
Description: AI analysis helps you generate more viral-friendly Sora video prompts
```

**卡片4 - 免费**
```
💰 Title: ✨ 100% Free to Use
Description: Free Sora prompt generator, no payment needed, no hidden costs
```

**卡片样式：**
- 4列网格布局
- 背景：#f9f9f9
- 文本对齐：居中
- 圆角：8px
- 边框：1px solid #e0e0e0

---

### **7. 常见问题 FAQ（H2）**

**H2 标题：**
```
❓ Frequently Asked Questions - Sora Prompt Generator FAQ
```

**背景色：** #FFF9C4（浅黄）

**6个问题及答案：**

**Q1: How to use Sora prompt generator to create AI videos?**
```
A: Just three simple steps:
1) Enter your video creative idea
2) Select your desired video type
3) Click the "Generate AI Prompt" button

Our AI Sora prompt generator will immediately generate optimized professional-level Sora 2 prompts for you.
```

**Q2: Can the generated Sora prompt be used directly in Sora 2?**
```
A: Yes! All Sora prompts generated by our Sora prompt generator are 
fully compatible with Sora 2 AI video generator. You can directly 
copy the generated Sora prompts to Sora 2 official platform and 
immediately generate the high-quality videos you want.
```

**Q3: Is there a limit to the number of prompts I can generate?**
```
A: No limits! You can generate unlimited Sora prompts and create 
unlimited AI video prompts. All historical prompt records are saved 
in your account for easy viewing and reuse of our Sora prompts.
```

**Q4: Is the free Sora prompt generator really completely free?**
```
A: Yes! Sora-Prompt 100% free to use. We promise no fees, no credit 
card required, no hidden costs. Free use of our Sora AI prompt 
generation tool to create unlimited high-quality Sora prompts.
```

**Q5: How to contact Sora prompt generator technical support?**
```
A: You can contact our support team in multiple ways. Send an email 
to support@sora-prompt.io, or click the "Contact" link at the bottom 
of the page. Our professional team will reply to your questions within 
24 hours.
```

**Q6: What is Sora-Prompt? Why choose our Sora prompt generator?**
```
A: Welcome to sora-prompt, the most powerful Sora prompt generator. 
Our Sora AI prompt generator can help you quickly generate high-quality 
Sora prompts. Whether you want to create Sora video prompts or Sora 
image prompts, you can use our tool to generate professional-level 
prompts with one click.

This is a free Sora Prompt Generator, specially designed for Sora 2 
prompt generator users. Whether you need a Sora AI prompt generator or 
Sora 2 Prompt Generator, we can help you quickly generate optimized 
Sora prompts, helping you create more viral-friendly viral Sora 2 
prompt content.

Our AI video generation Sora tool is completely free to use and supports 
generating various types of video prompts, including all the functionality 
required by the free Sora AI video generator. Start using Sora prompts 
now and create your next AI video masterpiece!
```

---



---

## 📝 关于提示词生成逻辑

**重要说明：**
```
✅ V1版本：使用Mock数据显示提示词
   - 页面框架和交互逻辑完全实现
   - 使用模拟数据展示生成结果
   - 用户可以复制、分享、下载

❌ 不在V1范围内：提示词优化算法
   - 提示词优化逻辑将作为单独的需求文档
   - 后续版本与提示词生成API集成

好处：
✓ V1可以快速完成部署
✓ 提示词逻辑可以独立优化
✓ 易于测试和维护
```

---

## 💻 技术需求

### **前端技术栈**
```
推荐：
- React 或 Vue 3
- Tailwind CSS 或 Styled Components
- Next.js （SEO优化）
- TypeScript （类型安全）
```

### **后端需求**
```
1. 提示词生成API（暂时使用Mock数据）
   - 接收用户输入（description + video_type + promptCount）
   - 返回指定数量的提示词示例
   - 注：真实的提示词优化逻辑在单独的需求文档中
   
2. 交互功能API（可选）
   - 复制功能：前端本地处理（navigator.clipboard）
   - 分享功能：分享链接或分享到社媒
   - 下载功能：前端生成TXT文件

3. 用户认证（V2 版本）
   - 用户注册/登录
   - 用户个人数据保存
```

### **数据库需求**
```
表1：Prompts 生成历史
- id
- user_id
- original_input
- selected_type
- generated_prompt
- created_at

表2：Users 用户信息
- id
- email
- username
- created_at
```

---

## 📱 响应式设计需求

```
Desktop: 1200px+
  - 输入框宽度：700px
  - 平台分享：2行3列
  - 优势卡片：4列网格

Tablet: 768px - 1199px
  - 输入框宽度：600px
  - 平台分享：2行2列
  - 优势卡片：2列网格

Mobile: 375px - 767px
  - 输入框宽度：100% - 20px padding
  - 平台分享：1列
  - 优势卡片：1列
  - 字体大小：12-14px
```

---

## 🎨 色彩方案

```
主色：#4CAF50 (Green)
  - 用于：按钮、强调、卡片边框

辅助色：
  - 蓝色：#E3F2FD (Light Blue) - Sora 2介绍区域背景
  - 黄色：#FFF9C4 (Light Yellow) - FAQ区域背景
  - 紫色：#F3E5F5 (Light Purple) - 未来可用

中性色：
  - 文字：#333 (深灰)
  - 边框：#ddd (浅灰)
  - 背景：#f5f5f5 (浅灰)
  - 白色：#ffffff
```

---



**V2 增强功能：**
- [ ] 用户注册/登录
- [ ] 保存收藏的提示词
- [ ] 历史记录查看
- [ ] 提示词评分/点赞
- [ ] 社区分享
- [ ] 高级提示词优化选项
- [ ] 批量下载所有提示词

**V3 企业功能：**
- [ ] API接口
- [ ] 批量生成
- [ ] 团队协作
- [ ] 专业模板库
- [ ] 高级分析

---

## 📊 页面性能指标

```
目标：
- 首屏加载时间 < 2秒
- Lighthouse 分数 > 90
- Core Web Vitals 绿色指标
- 移动设备友好
```

---

## 🚀 部署建议

```
CDN：Cloudflare / AWS CloudFront
Hosting：Vercel / Netlify / AWS Amplify
Database：Firebase / Supabase / MongoDB Atlas
```

---

## 📝 备注

- 这份文档涵盖了V1版本的完整功能
- 所有文案和SEO关键词已充分优化
- 可以根据实际需求调整样式和功能
- 建议优先完成核心功能，后续迭代增强

