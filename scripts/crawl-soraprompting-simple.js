/**
 * SoraPrompting.com 简化爬虫
 * 使用 axios + cheerio (无需浏览器)
 *
 * 适用于静态渲染的网站
 */

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

// 配置
const CONFIG = {
  baseUrl: 'https://www.soraprompting.com',
  outputDir: path.join(__dirname, '../data/soraprompting'),
  videosDir: path.join(__dirname, '../data/soraprompting/videos'),
  dataFile: path.join(__dirname, '../data/soraprompting/prompts.json'),
  downloadVideos: true,
  maxRetries: 3,
};

// 确保输出目录存在
function ensureDirectories() {
  if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true });
  }
  if (CONFIG.downloadVideos && !fs.existsSync(CONFIG.videosDir)) {
    fs.mkdirSync(CONFIG.videosDir, { recursive: true });
  }
}

// 延迟函数
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 下载视频
async function downloadVideo(url, filename) {
  try {
    console.log(`📥 下载视频: ${filename}`);
    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'stream',
      timeout: 60000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    const writer = fs.createWriteStream(path.join(CONFIG.videosDir, filename));
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => {
        console.log(`✅ 视频下载完成: ${filename}`);
        resolve();
      });
      writer.on('error', reject);
    });
  } catch (error) {
    console.error(`❌ 下载视频失败: ${filename}`, error.message);
    return null;
  }
}

// 爬取主函数
async function crawlSoraPrompting() {
  console.log('🚀 开始爬取 SoraPrompting.com...\n');
  ensureDirectories();

  try {
    console.log(`📖 访问主页: ${CONFIG.baseUrl}`);

    const response = await axios.get(CONFIG.baseUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      timeout: 30000,
    });

    console.log('✅ 页面加载成功');
    console.log(`📄 页面大小: ${(response.data.length / 1024).toFixed(2)} KB\n`);

    // 保存原始HTML（用于调试）
    const htmlFile = path.join(CONFIG.outputDir, 'page.html');
    fs.writeFileSync(htmlFile, response.data, 'utf-8');
    console.log(`💾 原始HTML已保存: ${htmlFile}\n`);

    const $ = cheerio.load(response.data);

    console.log('🔍 分析页面结构...');

    // 尝试多种可能的选择器
    const possibleSelectors = [
      'main article',
      '.prompt-card',
      '.video-card',
      '[class*="prompt"]',
      '[class*="card"]',
      'article',
      '.item',
      '.post',
      '[data-prompt]',
    ];

    let selectedSelector = null;
    let maxCount = 0;

    for (const selector of possibleSelectors) {
      const count = $(selector).length;
      if (count > 0) {
        console.log(`   找到 ${count} 个 "${selector}" 元素`);
        if (count > maxCount) {
          maxCount = count;
          selectedSelector = selector;
        }
      }
    }

    if (!selectedSelector || maxCount === 0) {
      console.error('\n❌ 未找到内容元素');
      console.log('\n💡 建议:');
      console.log('   1. 检查网站是否需要JavaScript渲染（如果是，请使用 Puppeteer 版本）');
      console.log('   2. 在浏览器中打开保存的 HTML 文件检查结构');
      console.log('   3. 手动检查网站的选择器');
      return;
    }

    console.log(`\n✨ 使用选择器: ${selectedSelector}`);
    const items = $(selectedSelector);
    console.log(`📊 找到 ${items.length} 个提示词项\n`);

    const prompts = [];
    let videoCount = 0;

    // 遍历每个项目
    for (let i = 0; i < items.length; i++) {
      const item = items.eq(i);

      try {
        // 提取文本内容
        const text = item.text().trim();

        // 提取标题
        const title = item.find('h1, h2, h3, h4, [class*="title"]').first().text().trim();

        // 提取描述/提示词
        const description = item.find('p, [class*="description"], [class*="prompt"]').first().text().trim();

        // 提取标签
        const tags = [];
        item.find('[class*="tag"], .tag, .category').each((j, tag) => {
          const tagText = $(tag).text().trim();
          if (tagText) tags.push(tagText);
        });

        // 提取视频URL
        let videoUrl = null;

        // 方法1: 查找 video 元素
        const videoElement = item.find('video source').first();
        if (videoElement.length) {
          videoUrl = videoElement.attr('src') || videoElement.attr('data-src');
        }

        // 方法2: 查找 video 标签
        if (!videoUrl) {
          const videoTag = item.find('video').first();
          if (videoTag.length) {
            videoUrl = videoTag.attr('src') || videoTag.attr('data-src') || videoTag.attr('poster');
          }
        }

        // 方法3: 查找包含 .mp4 的链接
        if (!videoUrl) {
          item.find('a, [href*=".mp4"], [src*=".mp4"]').each((j, el) => {
            const url = $(el).attr('href') || $(el).attr('src');
            if (url && url.includes('.mp4')) {
              videoUrl = url;
              return false; // break
            }
          });
        }

        if (!text && !videoUrl) {
          continue; // 跳过空项
        }

        const promptData = {
          id: i + 1,
          title: title || `Prompt ${i + 1}`,
          prompt: description || text.substring(0, 500),
          tags: tags.length > 0 ? tags : ['uncategorized'],
          videoUrl: videoUrl || null,
          videoFile: null,
          crawledAt: new Date().toISOString(),
        };

        // 下载视频
        if (CONFIG.downloadVideos && videoUrl) {
          try {
            const filename = `video_${String(i + 1).padStart(3, '0')}_${Date.now()}.mp4`;
            const fullVideoUrl = videoUrl.startsWith('http')
              ? videoUrl
              : videoUrl.startsWith('//')
              ? `https:${videoUrl}`
              : `${CONFIG.baseUrl}${videoUrl}`;

            await downloadVideo(fullVideoUrl, filename);
            promptData.videoFile = filename;
            videoCount++;

            // 下载间隔（避免过快请求）
            await delay(1000);
          } catch (error) {
            console.error(`   ⚠️  视频下载失败: ${error.message}`);
          }
        }

        prompts.push(promptData);
        console.log(`✅ [${i + 1}/${items.length}] ${promptData.title.substring(0, 50)}...`);

      } catch (error) {
        console.error(`❌ 处理项目 ${i + 1} 时出错:`, error.message);
      }
    }

    // 保存数据
    console.log('\n💾 保存数据...');
    const output = {
      source: CONFIG.baseUrl,
      crawledAt: new Date().toISOString(),
      totalPrompts: prompts.length,
      totalVideos: videoCount,
      prompts: prompts,
    };

    fs.writeFileSync(
      CONFIG.dataFile,
      JSON.stringify(output, null, 2),
      'utf-8'
    );

    console.log('\n✅ 爬取完成！');
    console.log(`📝 提示词数量: ${prompts.length}`);
    console.log(`🎬 视频数量: ${videoCount}`);
    console.log(`📁 数据文件: ${CONFIG.dataFile}`);
    if (CONFIG.downloadVideos) {
      console.log(`📁 视频目录: ${CONFIG.videosDir}`);
    }

    // 导出CSV
    exportToCSV(output);

  } catch (error) {
    console.error('❌ 爬取失败:', error.message);
    if (error.response) {
      console.error(`   HTTP 状态码: ${error.response.status}`);
    }
  }
}

// 导出CSV
function exportToCSV(data) {
  const csvFile = path.join(CONFIG.outputDir, 'prompts.csv');

  const csvHeader = 'ID,Title,Prompt,Tags,Video URL,Video File,Crawled At\n';
  const csvRows = data.prompts.map(p => {
    return [
      p.id,
      `"${(p.title || '').replace(/"/g, '""')}"`,
      `"${(p.prompt || '').replace(/"/g, '""').substring(0, 200)}"`,
      `"${(p.tags || []).join(', ')}"`,
      p.videoUrl || '',
      p.videoFile || '',
      p.crawledAt,
    ].join(',');
  }).join('\n');

  fs.writeFileSync(csvFile, csvHeader + csvRows, 'utf-8');
  console.log(`📊 CSV 导出完成: ${csvFile}`);
}

// 主函数
async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
SoraPrompting.com 简化爬虫工具 (无需浏览器)

用法:
  node crawl-soraprompting-simple.js [选项]

选项:
  --no-videos          不下载视频（仅保存文案）
  -h, --help           显示帮助

示例:
  node crawl-soraprompting-simple.js                # 完整爬取（含视频）
  node crawl-soraprompting-simple.js --no-videos    # 仅爬取文案
    `);
    return;
  }

  if (args.includes('--no-videos')) {
    CONFIG.downloadVideos = false;
  }

  await crawlSoraPrompting();
}

// 运行
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { crawlSoraPrompting, exportToCSV };