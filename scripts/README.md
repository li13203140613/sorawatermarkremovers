# 博客工具脚本（AI 增强版）

## 快速创建博客文章

### 方法 1：使用 npm 命令（推荐）

```bash
npm run blog
```

然后按提示输入：
- 文章标题（中英文）
- 文章描述（中英文）
- 作者名（默认: RemoveWM Team）
- 标签（用逗号分隔）
- **✨ 核心要点（每行一个，新功能！）**
- 是否创建双语版本

### 方法 2：使用 Git 别名

首先设置 Git 别名：

```bash
git config alias.blog '!npm run blog'
```

然后使用：

```bash
git blog
```

### 示例 1：使用核心要点（AI 辅助）

```bash
$ npm run blog

🚀 RemoveWM 博客文章创建工具（AI 增强版）

📝 文章标题（中文）: AI 视频生成最佳实践
📝 文章标题（英文）: AI Video Generation Best Practices
📄 文章描述（中文）: 分享使用 AI 工具生成高质量视频的技巧和经验
📄 文章描述（英文）: Share tips and experiences for generating high-quality videos with AI tools
👤 作者名（默认: RemoveWM Team）:
🏷️  标签（用逗号分隔，例如: AI,视频处理,教程）: AI,视频生成,最佳实践
✨ 添加文章核心要点？这将生成结构化的文章框架 (Y/n): Y
📌 请输入文章的核心要点（每行一个）:
💡 提示: 每行输入一个要点，输入空行结束

  - 选择合适的 AI 视频生成工具
  - 编写高质量的提示词
  - 优化视频质量和时长
  - 后期处理和优化技巧
  - 常见问题和解决方案
  -

✅ 已添加 5 个核心要点

🌐 创建双语版本？(Y/n): Y

📦 生成 slug: ai-video-generation-best-practices
📅 日期: 2025-10-15

✅ 已创建: content/blog/zh/ai-video-generation-best-practices.mdx
✅ 已创建: content/blog/en/ai-video-generation-best-practices.mdx

🎉 博客文章创建成功！

📋 生成的文章结构:
   - 开头引言（带 AI 提示）
   - 章节 1: 选择合适的 AI 视频生成工具
   - 章节 2: 编写高质量的提示词
   - 章节 3: 优化视频质量和时长
   - 章节 4: 后期处理和优化技巧
   - 章节 5: 常见问题和解决方案
   - 总结章节
   - 相关文章链接

💡 AI 提示: 文章中包含【AI 提示】标记，您可以：
   1. 使用 Claude Code 或其他 AI 工具自动填充内容
   2. 手动编辑并替换 AI 提示标记
   3. 保留框架，逐步完善内容

📖 访问地址:
   中文: http://localhost:3000/blog/ai-video-generation-best-practices
   英文: http://localhost:3000/blog/ai-video-generation-best-practices?lang=en

📝 编辑文件:
   code content/blog/zh/ai-video-generation-best-practices.mdx
   code content/blog/en/ai-video-generation-best-practices.mdx

✨ 提示: 使用 AI 助手可以快速生成完整内容！
```

### 示例 2：不使用核心要点（传统模式）

```bash
$ npm run blog

🚀 RemoveWM 博客文章创建工具（AI 增强版）

📝 文章标题（中文）: 视频压缩技巧
📝 文章标题（英文）: Video Compression Tips
📄 文章描述（中文）: 如何在保持质量的同时减小视频文件大小
📄 文章描述（英文）: How to reduce video file size while maintaining quality
👤 作者名（默认: RemoveWM Team）:
🏷️  标签（用逗号分隔，例如: AI,视频处理,教程）: 视频处理,压缩,技巧
✨ 添加文章核心要点？这将生成结构化的文章框架 (Y/n): n
🌐 创建双语版本？(Y/n): Y

✅ 已创建传统模板文章
```

## 功能特点

- ✅ 自动生成 slug（URL 友好的文件名）
- ✅ 自动填充当前日期
- ✅ 支持中英文双语创建
- ✅ 自动生成文章模板
- ✅ 检查文件是否已存在
- ✅ 友好的交互式命令行界面

## 文件命名规范

脚本会自动将标题转换为合适的文件名：

- 空格转换为连字符
- 移除特殊字符
- 全部小写
- 示例：`"AI 视频生成"` → `ai-video-generation.mdx`

## 生成的文章结构

```markdown
---
title: "文章标题"
description: "文章描述"
date: "2025-10-15"
author: "RemoveWM Team"
tags: ["标签1", "标签2"]
---

这是文章的开头段落...

## 第一部分

这里是内容...

### 子部分

详细内容...

## 第二部分

更多内容...

## 总结

总结内容...

## 相关文章

- [RemoveWM 快速入门指南](/blog/getting-started)
- [AI 视频水印去除技术详解](/blog/ai-watermark-removal)
- [Chrome 扩展使用教程](/blog/chrome-extension-guide)
```

## 注意事项

1. 确保在项目根目录执行命令
2. 文件会自动创建在 `content/blog/zh/` 和 `content/blog/en/` 目录
3. 如果文件已存在，脚本会报错并退出
4. 创建后可以直接编辑 MDX 文件添加内容
5. 保存后会自动在博客列表中显示
