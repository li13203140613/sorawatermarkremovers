#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

function questionMultiline(prompt) {
  return new Promise((resolve) => {
    console.log(prompt);
    console.log('💡 提示: 每行输入一个要点，输入空行结束\n');
    const lines = [];

    const readLine = () => {
      rl.question('  - ', (answer) => {
        if (answer.trim() === '') {
          resolve(lines);
        } else {
          lines.push(answer.trim());
          readLine();
        }
      });
    };

    readLine();
  });
}

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // 空格转连字符
    .replace(/[^\w\-]+/g, '')    // 移除非字母数字字符
    .replace(/\-\-+/g, '-')      // 多个连字符变单个
    .replace(/^-+/, '')          // 去掉开头的连字符
    .replace(/-+$/, '');         // 去掉结尾的连字符
}

function getCurrentDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function generateMDXContent(lang, data) {
  const isZh = lang === 'zh';

  // 如果提供了内容要点，生成结构化的文章
  if (data.keyPoints && data.keyPoints.length > 0) {
    const sections = data.keyPoints.map((point, index) => {
      return `## ${point}

${isZh ? '【AI 提示：请在这里展开详细说明 "' + point + '"】' : '【AI Prompt: Please elaborate on "' + point + '" here】'}

${isZh ? '- 要点1：详细说明...' : '- Point 1: Details...'}
${isZh ? '- 要点2：详细说明...' : '- Point 2: Details...'}
${isZh ? '- 要点3：详细说明...' : '- Point 3: Details...'}
`;
    }).join('\n');

    return `---
title: "${data.title}"
description: "${data.description}"
date: "${data.date}"
author: "${data.author}"
tags: [${data.tags.map(tag => `"${tag}"`).join(', ')}]
---

${isZh ? '【AI 提示：请根据标题和描述生成引人入胜的开头段落，150-200字】' : '【AI Prompt: Generate an engaging opening paragraph based on the title and description, 150-200 words】'}

${sections}

## ${isZh ? '总结' : 'Summary'}

${isZh ? '【AI 提示：总结全文要点，给出行动建议】' : '【AI Prompt: Summarize key points and provide actionable advice】'}

## ${isZh ? '相关文章' : 'Related Articles'}

- [${isZh ? 'RemoveWM 快速入门指南' : 'RemoveWM Quick Start Guide'}](/blog/getting-started)
- [${isZh ? 'AI 视频水印去除技术详解' : 'AI Video Watermark Removal Technology Explained'}](/blog/ai-watermark-removal)
- [${isZh ? 'Chrome 扩展使用教程' : 'Chrome Extension Tutorial'}](/blog/chrome-extension-guide)
`;
  }

  // 默认模板
  return `---
title: "${data.title}"
description: "${data.description}"
date: "${data.date}"
author: "${data.author}"
tags: [${data.tags.map(tag => `"${tag}"`).join(', ')}]
---

${isZh ? '这是文章的开头段落...' : 'This is the opening paragraph...'}

## ${isZh ? '第一部分' : 'First Section'}

${isZh ? '这里是内容...' : 'Content goes here...'}

### ${isZh ? '子部分' : 'Subsection'}

${isZh ? '详细内容...' : 'Detailed content...'}

## ${isZh ? '第二部分' : 'Second Section'}

${isZh ? '更多内容...' : 'More content...'}

## ${isZh ? '总结' : 'Summary'}

${isZh ? '总结内容...' : 'Summary content...'}

## ${isZh ? '相关文章' : 'Related Articles'}

- [${isZh ? 'RemoveWM 快速入门指南' : 'RemoveWM Quick Start Guide'}](/blog/getting-started)
- [${isZh ? 'AI 视频水印去除技术详解' : 'AI Video Watermark Removal Technology Explained'}](/blog/ai-watermark-removal)
- [${isZh ? 'Chrome 扩展使用教程' : 'Chrome Extension Tutorial'}](/blog/chrome-extension-guide)
`;
}

async function main() {
  console.log('\n🚀 RemoveWM 博客文章创建工具（AI 增强版）\n');

  // 获取文章信息（英文优先）
  const titleEn = await question('📝 文章标题（英文）: ');
  const descriptionEn = await question('📄 文章描述（英文）: ');
  const author = await question('👤 作者名（默认: RemoveWM Team）: ') || 'RemoveWM Team';
  const tagsInput = await question('🏷️  标签（用逗号分隔，例如: AI,Video Processing,Tutorial）: ');
  const tags = tagsInput.split(',').map(tag => tag.trim()).filter(Boolean);

  // 询问是否需要中文翻译
  const needZh = await question('🌐 是否生成中文版本？(Y/n): ');
  const shouldCreateZh = !needZh || needZh.toLowerCase() === 'y';

  let titleZh = '';
  let descriptionZh = '';

  if (shouldCreateZh) {
    console.log('\n🤖 准备中文翻译...');
    console.log('💡 提示: 您可以让 AI 助手帮您翻译英文为中文\n');
    console.log('='.repeat(50));
    console.log('请翻译以下英文为中文:');
    console.log(`标题: ${titleEn}`);
    console.log('='.repeat(50));
    titleZh = await question('\n✍️  请输入翻译后的中文标题（留空则不创建中文版）: ');

    if (titleZh) {
      console.log('\n' + '='.repeat(50));
      console.log('请翻译以下英文为中文:');
      console.log(`描述: ${descriptionEn}`);
      console.log('='.repeat(50));
      descriptionZh = await question('\n✍️  请输入翻译后的中文描述: ');
    }
  }

  // 询问是否添加内容要点
  const addKeyPoints = await question('\n✨ 添加文章核心要点？这将生成结构化的文章框架 (Y/n): ');
  let keyPoints = [];

  if (!addKeyPoints || addKeyPoints.toLowerCase() === 'y') {
    keyPoints = await questionMultiline('📌 请输入文章的核心要点（英文，每行一个）:');
    console.log(`\n✅ 已添加 ${keyPoints.length} 个核心要点\n`);
  }

  rl.close();

  // 生成 slug
  const slug = slugify(titleEn);
  const date = getCurrentDate();

  console.log(`\n📦 生成 slug: ${slug}`);
  console.log(`📅 日期: ${date}\n`);

  // 准备文件路径
  const contentDir = path.join(process.cwd(), 'content', 'blog');
  const zhPath = path.join(contentDir, 'zh', `${slug}.mdx`);
  const enPath = path.join(contentDir, 'en', `${slug}.mdx`);

  // 检查文件是否已存在
  if (fs.existsSync(enPath)) {
    console.error('❌ 错误: 英文文件已存在！');
    console.error(`   ${enPath}`);
    process.exit(1);
  }

  if (shouldCreateZh && titleZh && fs.existsSync(zhPath)) {
    console.error('❌ 错误: 中文文件已存在！');
    console.error(`   ${zhPath}`);
    process.exit(1);
  }

  // 创建英文文章（优先）
  const enData = {
    title: titleEn,
    description: descriptionEn,
    date,
    author,
    tags,
    keyPoints
  };
  const enContent = generateMDXContent('en', enData);
  fs.writeFileSync(enPath, enContent, 'utf8');
  console.log(`✅ 已创建: ${enPath}`);

  // 创建中文文章（如果需要）
  if (shouldCreateZh && titleZh && descriptionZh) {
    const zhData = {
      title: titleZh,
      description: descriptionZh,
      date,
      author,
      tags,
      keyPoints
    };
    const zhContent = generateMDXContent('zh', zhData);
    fs.writeFileSync(zhPath, zhContent, 'utf8');
    console.log(`✅ 已创建: ${zhPath}`);
  }

  console.log('\n🎉 博客文章创建成功！\n');

  if (keyPoints.length > 0) {
    console.log('📋 生成的文章结构:');
    console.log('   - Opening paragraph (with AI prompt)');
    keyPoints.forEach((point, index) => {
      console.log(`   - Section ${index + 1}: ${point}`);
    });
    console.log('   - Summary section');
    console.log('   - Related articles links\n');
    console.log('💡 AI Tip: The article contains 【AI Prompt】 markers, you can:');
    console.log('   1. Use Claude Code or other AI tools to auto-fill content');
    console.log('   2. Manually edit and replace AI prompt markers');
    console.log('   3. Keep the framework and gradually improve content\n');
  }

  console.log('📖 访问地址:');
  console.log(`   英文: http://localhost:3000/blog/${slug}?lang=en`);
  if (shouldCreateZh && titleZh) {
    console.log(`   中文: http://localhost:3000/blog/${slug}`);
  }
  console.log('\n📝 编辑文件:');
  console.log(`   code ${enPath}`);
  if (shouldCreateZh && titleZh) {
    console.log(`   code ${zhPath}`);
  }
  console.log('\n✨ Tip: Use AI assistant to quickly generate complete content!\n');
}

main().catch(error => {
  console.error('❌ 错误:', error.message);
  process.exit(1);
});
