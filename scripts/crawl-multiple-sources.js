/**
 * 多来源 Sora 2 提示词爬虫
 * 从多个网站和平台收集 Sora 2 提示词、视频和图片
 *
 * 数据来源:
 * 1. bestsoraprompts.com - 主要来源
 * 2. OpenAI 官方示例 (需要时)
 * 3. Reddit r/OpenAI (可扩展)
 * 4. GitHub awesome-sora 列表 (可扩展)
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// 输出目录
const OUTPUT_DIR = path.join(__dirname, '..', 'data');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'sora2-prompts-multi-source.json');

// 分类关键词映射
const CATEGORY_KEYWORDS = {
  animal: ['cat', 'dog', 'bird', 'elephant', 'dolphin', 'fish', 'tiger', 'lion', 'panda', 'kangaroo', 'animal', 'pet', 'wildlife'],
  people: ['man', 'woman', 'person', 'people', 'human', 'child', 'athlete', 'dancer', 'figure skater', 'gymnast', 'paddleboard'],
  landscape: ['landscape', 'mountain', 'ocean', 'beach', 'forest', 'desert', 'river', 'sunset', 'sunrise', 'nature', 'villa', 'exterior'],
  tech: ['robot', 'ai', 'tech', 'computer', 'digital', 'cyber', 'futuristic', 'sci-fi', 'hologram', 'neon'],
  art: ['painting', 'art', 'artistic', 'sculpture', 'gallery', 'museum', 'brush', 'canvas', 'watercolor'],
  food: ['food', 'cooking', 'chef', 'restaurant', 'dish', 'meal', 'kitchen', 'recipe', 'burger', 'pizza'],
  architecture: ['building', 'architecture', 'house', 'tower', 'bridge', 'skyscraper', 'structure', 'monument'],
  abstract: ['abstract', 'surreal', 'dream', 'fantasy', 'imagination', 'cinematic', 'flip', 'balance beam'],
  action: ['action', 'fight', 'chase', 'explosion', 'battle', 'race', 'sport', 'jump', 'run', 'backflip'],
};

// 分类显示信息
const CATEGORY_INFO = {
  animal: { label: '动物', icon: '🐱' },
  people: { label: '人物', icon: '👤' },
  landscape: { label: '风景', icon: '🌄' },
  tech: { label: '科技', icon: '🚀' },
  art: { label: '艺术', icon: '🎨' },
  food: { label: '美食', icon: '🍕' },
  architecture: { label: '建筑', icon: '🏛️' },
  abstract: { label: '抽象', icon: '✨' },
  action: { label: '动作', icon: '🏃' },
};

/**
 * HTTP/HTTPS GET 请求封装
 */
function fetchUrl(url, options = {}) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const timeout = options.timeout || 15000;

    const req = protocol.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        ...options.headers
      }
    }, (res) => {
      // 处理重定向
      if (res.statusCode === 301 || res.statusCode === 302) {
        return fetchUrl(res.headers.location, options).then(resolve).catch(reject);
      }

      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }

      let data = '';
      res.setEncoding('utf8');
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });

    req.on('error', reject);
    req.setTimeout(timeout, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

/**
 * 从 bestsoraprompts.com 爬取
 */
async function crawlBestSoraPrompts() {
  console.log('\n[1/1] 爬取 bestsoraprompts.com...');

  try {
    const html = await fetchUrl('https://bestsoraprompts.com/', { timeout: 30000 });

    // 解析 Sora 2 提示词卡片
    const cardRegex = /<div class="col-lg-6">[\s\S]*?<iframe[^>]+src="([^"]+)"[\s\S]*?<span class="badge bg-info">Sora 2<\/span>[\s\S]*?<p[^>]*class="[^"]*prompt[^"]*"[^>]*>([\s\S]*?)<\/p>/g;

    const prompts = [];
    let match;
    let id = 1;

    while ((match = cardRegex.exec(html)) !== null) {
      const videoUrl = match[1].trim();
      let promptText = match[2].trim()
        .replace(/<[^>]+>/g, '')
        .replace(/Prompt:\s*/i, '')
        .trim();

      // 分类
      const category = categorizePrompt(promptText);
      const categoryInfo = CATEGORY_INFO[category];

      // 提取视频信息
      const videoInfo = extractVideoInfo(videoUrl);

      prompts.push({
        id: `sora2-${id++}`,
        source: 'bestsoraprompts.com',
        category,
        categoryLabel: categoryInfo.label,
        categoryIcon: categoryInfo.icon,
        prompt: promptText,
        video: videoInfo,
        thumbnailUrl: videoInfo.thumbnailUrl,
        videoUrl: videoInfo.directUrl || videoUrl,
        embedUrl: videoUrl,
        crawledAt: new Date().toISOString(),
      });
    }

    console.log(`  ✅ 成功提取 ${prompts.length} 条 Sora 2 提示词`);
    return prompts;
  } catch (error) {
    console.error(`  ❌ 爬取失败:`, error.message);
    return [];
  }
}

/**
 * 根据关键词自动分类
 */
function categorizePrompt(prompt) {
  const lowerPrompt = prompt.toLowerCase();

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(keyword => lowerPrompt.includes(keyword))) {
      return category;
    }
  }

  return 'abstract'; // 默认分类
}

/**
 * 提取视频信息 (Vimeo, YouTube, 直接链接)
 */
function extractVideoInfo(url) {
  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch) {
    return {
      type: 'vimeo',
      videoId: vimeoMatch[1],
      thumbnailUrl: `https://vumbnail.com/${vimeoMatch[1]}.jpg`,
      directUrl: `https://vimeo.com/${vimeoMatch[1]}`,
    };
  }

  // YouTube
  const youtubeMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (youtubeMatch) {
    return {
      type: 'youtube',
      videoId: youtubeMatch[1],
      thumbnailUrl: `https://img.youtube.com/vi/${youtubeMatch[1]}/maxresdefault.jpg`,
      directUrl: `https://www.youtube.com/watch?v=${youtubeMatch[1]}`,
    };
  }

  // 直接 MP4 链接
  if (url.endsWith('.mp4') || url.includes('.mp4?')) {
    return {
      type: 'direct',
      directUrl: url,
      thumbnailUrl: null, // 需要后续生成
    };
  }

  // 未知类型
  return {
    type: 'unknown',
    directUrl: url,
    thumbnailUrl: null,
  };
}

/**
 * 合并去重
 */
function deduplicatePrompts(prompts) {
  const seen = new Set();
  const unique = [];

  for (const prompt of prompts) {
    // 使用提示词文本的前100个字符作为去重键
    const key = prompt.prompt.substring(0, 100).toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(prompt);
    }
  }

  return unique;
}

/**
 * 统计分类
 */
function generateStats(prompts) {
  const stats = {
    totalCount: prompts.length,
    categories: {},
    videoTypes: {},
    sources: {},
  };

  prompts.forEach(p => {
    // 分类统计
    stats.categories[p.categoryLabel] = (stats.categories[p.categoryLabel] || 0) + 1;

    // 视频类型统计
    stats.videoTypes[p.video.type] = (stats.videoTypes[p.video.type] || 0) + 1;

    // 来源统计
    stats.sources[p.source] = (stats.sources[p.source] || 0) + 1;
  });

  return stats;
}

/**
 * 保存结果
 */
function saveResults(prompts) {
  // 确保输出目录存在
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const stats = generateStats(prompts);

  const output = {
    crawlTime: new Date().toISOString(),
    sources: ['bestsoraprompts.com'],
    stats,
    prompts,
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`\n✅ 数据已保存到: ${OUTPUT_FILE}`);
}

/**
 * 主函数
 */
async function main() {
  console.log('='.repeat(70));
  console.log('多来源 Sora 2 提示词爬虫');
  console.log('='.repeat(70));

  const allPrompts = [];

  // 1. bestsoraprompts.com
  const bestSoraPrompts = await crawlBestSoraPrompts();
  allPrompts.push(...bestSoraPrompts);

  // 未来可扩展:
  // 2. OpenAI 官方示例
  // const openaiPrompts = await crawlOpenAIExamples();
  // allPrompts.push(...openaiPrompts);

  // 3. Reddit
  // const redditPrompts = await crawlReddit();
  // allPrompts.push(...redditPrompts);

  // 去重
  console.log('\n正在去重...');
  const uniquePrompts = deduplicatePrompts(allPrompts);
  console.log(`  去重前: ${allPrompts.length} 条`);
  console.log(`  去重后: ${uniquePrompts.length} 条`);

  if (uniquePrompts.length === 0) {
    console.log('\n❌ 未能提取到任何提示词');
    process.exit(1);
  }

  // 统计
  console.log('\n数据统计:');
  const stats = generateStats(uniquePrompts);
  console.log(`  总数: ${stats.totalCount} 条`);
  console.log(`  分类分布:`);
  Object.entries(stats.categories).forEach(([cat, count]) => {
    console.log(`    - ${cat}: ${count} 条`);
  });
  console.log(`  视频类型:`);
  Object.entries(stats.videoTypes).forEach(([type, count]) => {
    console.log(`    - ${type}: ${count} 条`);
  });

  // 保存
  saveResults(uniquePrompts);

  console.log('\n' + '='.repeat(70));
  console.log('✅ 爬取完成！');
  console.log('='.repeat(70));
  console.log('\n下一步:');
  console.log('  1. 运行视频下载器: node scripts/download-videos.js');
  console.log('  2. 生成缩略图: node scripts/generate-thumbnails.js');
  console.log('  3. 上传到 R2: node scripts/upload-to-r2.js\n');
}

// 运行爬虫
main().catch(error => {
  console.error('\n❌ 爬虫运行出错:', error);
  process.exit(1);
});
