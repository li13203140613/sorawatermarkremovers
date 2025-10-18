/**
 * Best Sora Prompts 爬虫脚本
 * 爬取 https://bestsoraprompts.com/ 的 Sora 2 提示词数据
 *
 * 使用方法:
 * node scripts/crawl-sora-prompts.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// 配置
const CONFIG = {
  targetUrl: 'https://bestsoraprompts.com/',
  outputDir: 'data',
  outputFile: 'sora2-prompts.json',
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
};

/**
 * 发起 HTTPS 请求
 */
function fetchPage(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': CONFIG.userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7',
        'Cache-Control': 'no-cache'
      }
    };

    https.get(url, options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve(data);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * 提取视频 URL（从 iframe 中）
 */
function extractVideoUrl(iframeHtml) {
  // 提取 iframe src
  const srcMatch = iframeHtml.match(/src=["']([^"']+)["']/);
  if (!srcMatch) return null;

  const src = srcMatch[1];

  // 如果是 YouTube
  if (src.includes('youtube.com') || src.includes('youtu.be')) {
    const videoIdMatch = src.match(/embed\/([a-zA-Z0-9_-]+)/);
    if (videoIdMatch) {
      return {
        type: 'youtube',
        videoId: videoIdMatch[1],
        embedUrl: src,
        watchUrl: `https://www.youtube.com/watch?v=${videoIdMatch[1]}`,
        thumbnailUrl: `https://img.youtube.com/vi/${videoIdMatch[1]}/maxresdefault.jpg`
      };
    }
  }

  // 如果是 Vimeo
  if (src.includes('vimeo.com')) {
    const videoIdMatch = src.match(/video\/(\d+)/);
    if (videoIdMatch) {
      return {
        type: 'vimeo',
        videoId: videoIdMatch[1],
        embedUrl: src,
        watchUrl: `https://vimeo.com/${videoIdMatch[1]}`,
        thumbnailUrl: null // Vimeo 需要 API 获取缩略图
      };
    }
  }

  // 如果是直接视频链接
  if (src.match(/\.(mp4|webm|ogg)$/i)) {
    return {
      type: 'direct',
      videoUrl: src,
      embedUrl: src,
      watchUrl: src,
      thumbnailUrl: null
    };
  }

  // 其他情况
  return {
    type: 'unknown',
    embedUrl: src,
    watchUrl: src,
    thumbnailUrl: null
  };
}

/**
 * 解析 Sora 2 提示词
 */
function parseSora2Prompts(html) {
  const prompts = [];
  let currentVersion = null;

  try {
    // 按行分割
    const lines = html.split('\n');

    // 查找所有的提示词卡片
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // 检测版本标记
      if (line.includes('<p class="soratitle">')) {
        const versionMatch = line.match(/<p class="soratitle">(Sora \d+)<\/p>/);
        if (versionMatch) {
          currentVersion = versionMatch[1];
          console.log(`\n发现版本: ${currentVersion}`);
        }
      }

      // 只处理 Sora 2 的提示词
      if (currentVersion !== 'Sora 2') continue;

      // 查找提示词文本
      if (line.includes('<p class="prompt">') || line.includes('class="prompt"')) {
        // 提取提示词（可能跨多行）
        let promptText = '';
        let j = i;

        // 如果提示词在同一行
        if (line.includes('</p>')) {
          const match = line.match(/<p[^>]*class="prompt"[^>]*>(.*?)<\/p>/s);
          if (match) {
            promptText = match[1].trim();
          }
        } else {
          // 提示词跨多行
          while (j < lines.length) {
            const currentLine = lines[j].trim();
            promptText += ' ' + currentLine;
            if (currentLine.includes('</p>')) break;
            j++;
          }
          const match = promptText.match(/<p[^>]*class="prompt"[^>]*>(.*?)<\/p>/s);
          if (match) {
            promptText = match[1].trim();
          }
        }

        // 清理 HTML 标签
        promptText = promptText
          .replace(/<[^>]+>/g, '')
          .replace(/&nbsp;/g, ' ')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .trim();

        if (!promptText || promptText.length < 10) continue;

        // 查找对应的视频（在提示词之后）
        let videoInfo = null;
        for (let k = i; k < Math.min(i + 20, lines.length); k++) {
          const videoLine = lines[k].trim();
          if (videoLine.includes('<iframe') || videoLine.includes('embed-responsive-item')) {
            // 提取整个 iframe 标签
            let iframeHtml = '';
            let m = k;
            while (m < lines.length && !iframeHtml.includes('</iframe>')) {
              iframeHtml += ' ' + lines[m].trim();
              m++;
            }
            videoInfo = extractVideoUrl(iframeHtml);
            break;
          }
        }

        // 自动分类（基于关键词）
        const category = categorizePrompt(promptText);

        // 添加到结果
        prompts.push({
          id: `sora2-${prompts.length + 1}`,
          version: 'Sora 2',
          category: category.id,
          categoryLabel: category.label,
          categoryIcon: category.icon,
          prompt: promptText,
          video: videoInfo,
          thumbnailUrl: videoInfo?.thumbnailUrl || null,
          videoUrl: videoInfo?.watchUrl || null,
          embedUrl: videoInfo?.embedUrl || null,
        });

        console.log(`  ✓ 提取提示词 #${prompts.length}: ${promptText.substring(0, 50)}...`);
      }
    }

  } catch (error) {
    console.error('解析 HTML 时出错:', error.message);
  }

  return prompts;
}

/**
 * 解析 Sora 2 提示词 - 修正版
 */
function parseSora2Prompts(html) {
  const prompts = [];

  try {
    // 使用正则表达式匹配 Sora 2 的卡片结构
    // 结构: <iframe src="..."> -> <span class="badge bg-info">Sora 2</span> -> <p class="...prompt...">Prompt: ...</p>

    const cardRegex = /<div class="col-lg-6">[\s\S]*?<iframe[^>]+src="([^"]+)"[\s\S]*?<span class="badge bg-info">Sora 2<\/span>[\s\S]*?<p[^>]*class="[^"]*prompt[^"]*"[^>]*>([\s\S]*?)<\/p>/g;

    let match;
    let count = 0;

    while ((match = cardRegex.exec(html)) !== null) {
      count++;
      const videoUrl = match[1].trim();
      let promptText = match[2].trim();

      // 清理 HTML 标签和实体
      promptText = promptText
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/Prompt:\s*/i, '')
        .trim();

      if (!promptText || promptText.length < 5) continue;

      // 提取视频信息
      const videoInfo = extractVideoUrl(`<iframe src="${videoUrl}"></iframe>`);

      // 自动分类
      const category = categorizePrompt(promptText);

      // 添加到结果
      prompts.push({
        id: `sora2-${prompts.length + 1}`,
        version: 'Sora 2',
        category: category.id,
        categoryLabel: category.label,
        categoryIcon: category.icon,
        prompt: promptText,
        video: videoInfo,
        thumbnailUrl: videoInfo?.thumbnailUrl || null,
        videoUrl: videoInfo?.watchUrl || videoUrl,
        embedUrl: videoInfo?.embedUrl || videoUrl,
      });

      console.log(`  ✓ 提取提示词 #${prompts.length}: ${promptText.substring(0, 60)}...`);
    }

    console.log(`\n📊 共发现 ${count} 个匹配，成功提取 ${prompts.length} 条提示词`);

  } catch (error) {
    console.error('解析 HTML 时出错:', error.message);
    console.error('错误堆栈:', error.stack);
  }

  return prompts;
}

/**
 * 根据提示词内容自动分类
 */
function categorizePrompt(prompt) {
  const lowerPrompt = prompt.toLowerCase();

  // 关键词映射
  const keywords = {
    animal: ['cat', 'dog', 'animal', 'bird', 'fish', 'pet', 'wildlife', 'tiger', 'lion', 'elephant', 'monkey', 'panda', '猫', '狗', '动物', '鸟', '鱼'],
    people: ['person', 'people', 'man', 'woman', 'child', 'human', 'face', 'portrait', 'character', '人', '人物', '男人', '女人', 'skater', 'guy', 'protagonists'],
    landscape: ['landscape', 'nature', 'mountain', 'ocean', 'beach', 'forest', 'desert', 'sunset', 'sunrise', 'sky', '风景', '山', '海', '森林'],
    tech: ['robot', 'technology', 'futuristic', 'sci-fi', 'spaceship', 'cyber', 'digital', 'computer', 'ai', '科技', '机器人', '未来'],
    art: ['art', 'painting', 'artistic', 'creative', 'design', '艺术', '绘画', 'anime', 'animation'],
    food: ['food', 'cooking', 'meal', 'restaurant', 'pizza', 'coffee', 'cake', '美食', '食物', '餐厅'],
    architecture: ['building', 'architecture', 'city', 'urban', 'house', 'structure', 'tower', '建筑', '城市', '房子', 'tokyo', 'town'],
    abstract: ['abstract', 'surreal', 'dream', 'fantasy', 'imagination', '抽象', '超现实', '梦幻'],
    action: ['action', 'sport', 'running', 'jumping', 'dancing', 'movement', 'fast', '运动', '动作', '跑步', 'backflip', 'axle', 'perform', 'fell'],
    abstract: ['abstract', 'surreal', 'dream', 'fantasy', 'imagination', '抽象', '超现实', '梦幻'],
    action: ['action', 'sport', 'running', 'jumping', 'dancing', 'movement', 'fast', '运动', '动作', '跑步'],
  };

  // 统计每个分类的匹配度
  const scores = {};
  for (const [category, words] of Object.entries(keywords)) {
    scores[category] = 0;
    for (const word of words) {
      if (lowerPrompt.includes(word)) {
        scores[category]++;
      }
    }
  }

  // 找到最高分的分类
  let bestCategory = 'abstract'; // 默认分类
  let maxScore = 0;
  for (const [category, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      bestCategory = category;
    }
  }

  // 返回分类信息
  const categoryMap = {
    animal: { id: 'animal', label: '动物', icon: '🐱' },
    people: { id: 'people', label: '人物', icon: '👤' },
    landscape: { id: 'landscape', label: '风景', icon: '🌄' },
    tech: { id: 'tech', label: '科技', icon: '🚀' },
    art: { id: 'art', label: '艺术', icon: '🎨' },
    food: { id: 'food', label: '美食', icon: '🍕' },
    architecture: { id: 'architecture', label: '建筑', icon: '🏛️' },
    abstract: { id: 'abstract', label: '抽象', icon: '✨' },
    action: { id: 'action', label: '动作', icon: '🏃' },
  };

  return categoryMap[bestCategory];
}

/**
 * 保存数据到文件
 */
function saveData(data) {
  // 确保输出目录存在
  const outputDir = path.join(__dirname, '..', CONFIG.outputDir);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, CONFIG.outputFile);

  const output = {
    source: CONFIG.targetUrl,
    crawlTime: new Date().toISOString(),
    totalCount: data.length,
    version: 'Sora 2',
    categories: getCategoryStats(data),
    prompts: data
  };

  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`\n✅ 数据已保存到: ${outputPath}`);
  console.log(`📊 共获取 ${data.length} 条 Sora 2 提示词`);

  // 显示分类统计
  console.log('\n📋 分类统计:');
  for (const [category, count] of Object.entries(output.categories)) {
    console.log(`   ${category}: ${count} 条`);
  }
}

/**
 * 获取分类统计
 */
function getCategoryStats(prompts) {
  const stats = {};
  for (const prompt of prompts) {
    const category = prompt.categoryLabel || '未分类';
    stats[category] = (stats[category] || 0) + 1;
  }
  return stats;
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 开始爬取 Best Sora Prompts 数据...');
  console.log(`🌐 目标网站: ${CONFIG.targetUrl}\n`);

  try {
    // 1. 获取页面 HTML
    console.log('📥 正在获取页面内容...');
    const html = await fetchPage(CONFIG.targetUrl);
    console.log(`✅ 页面大小: ${(html.length / 1024).toFixed(2)} KB\n`);

    // 2. 保存原始 HTML（用于调试）
    const htmlPath = path.join(__dirname, '..', CONFIG.outputDir, 'sora-prompts-page.html');
    if (!fs.existsSync(path.dirname(htmlPath))) {
      fs.mkdirSync(path.dirname(htmlPath), { recursive: true });
    }
    fs.writeFileSync(htmlPath, html, 'utf-8');
    console.log(`💾 原始 HTML 已保存到: ${htmlPath}\n`);

    // 3. 解析 Sora 2 提示词
    console.log('🔍 正在解析 Sora 2 提示词...');
    const prompts = parseSora2Prompts(html);

    if (prompts.length > 0) {
      // 4. 保存数据
      saveData(prompts);

      // 5. 显示示例数据
      console.log('\n📝 示例数据（前3条）:');
      prompts.slice(0, 3).forEach((prompt, index) => {
        console.log(`\n--- 示例 ${index + 1} ---`);
        console.log(`分类: ${prompt.categoryIcon} ${prompt.categoryLabel}`);
        console.log(`提示词: ${prompt.prompt.substring(0, 100)}...`);
        console.log(`视频: ${prompt.videoUrl || '无'}`);
      });

      console.log('\n\n🎉 爬取完成！');
    } else {
      console.log('\n⚠️ 未能提取到 Sora 2 提示词');
      console.log('💡 提示: 请检查网站结构是否发生变化');
    }

  } catch (error) {
    console.error('\n❌ 爬取失败:', error.message);
    console.error('详细错误:', error);
    process.exit(1);
  }
}

// 运行主函数
if (require.main === module) {
  main();
}

module.exports = { parseSora2Prompts, categorizePrompt };
