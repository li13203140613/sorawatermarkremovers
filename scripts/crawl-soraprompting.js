/**
 * SoraPrompting.com 爬虫
 * 下载网站的提示词文案和视频
 *
 * 依赖: npm install puppeteer axios cheerio
 */

const puppeteer = require('puppeteer');
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
  // 爬取配置
  maxPages: 10, // 最大爬取页数
  scrollDelay: 2000, // 滚动延迟（毫秒）
  downloadVideos: true, // 是否下载视频
  headless: false, // 是否无头模式（false 可以看到浏览器）
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

// 下载视频
async function downloadVideo(url, filename) {
  try {
    console.log(`📥 下载视频: ${filename}`);
    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'stream',
      timeout: 60000, // 60秒超时
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

// 提取视频URL
function extractVideoUrl(element) {
  // 尝试多种常见的视频元素
  const videoSelectors = [
    'video source',
    'video',
    'iframe',
    '[data-video-url]',
    '[data-src*=".mp4"]',
    '[src*=".mp4"]',
  ];

  for (const selector of videoSelectors) {
    const videoElement = element.querySelector(selector);
    if (videoElement) {
      const url = videoElement.getAttribute('src') ||
                  videoElement.getAttribute('data-src') ||
                  videoElement.getAttribute('data-video-url');
      if (url) return url;
    }
  }
  return null;
}

// 爬取主函数
async function crawlSoraPrompting() {
  console.log('🚀 开始爬取 SoraPrompting.com...\n');
  ensureDirectories();

  const browser = await puppeteer.launch({
    headless: CONFIG.headless,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  // 设置视口
  await page.setViewport({ width: 1920, height: 1080 });

  // 设置User-Agent
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  );

  try {
    console.log(`📖 访问主页: ${CONFIG.baseUrl}`);
    await page.goto(CONFIG.baseUrl, {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    // 等待页面加载
    await page.waitForTimeout(3000);

    // 滚动加载更多内容
    console.log('📜 滚动加载更多内容...');
    let previousHeight = 0;
    let scrollAttempts = 0;
    const maxScrolls = CONFIG.maxPages;

    while (scrollAttempts < maxScrolls) {
      // 滚动到底部
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });

      await page.waitForTimeout(CONFIG.scrollDelay);

      const currentHeight = await page.evaluate(() => document.body.scrollHeight);

      if (currentHeight === previousHeight) {
        console.log('✅ 已加载所有内容');
        break;
      }

      previousHeight = currentHeight;
      scrollAttempts++;
      console.log(`   已滚动 ${scrollAttempts}/${maxScrolls} 次`);
    }

    // 获取页面内容
    const content = await page.content();
    const $ = cheerio.load(content);

    console.log('\n🔍 解析页面内容...');

    const prompts = [];
    let videoCount = 0;

    // 尝试多种可能的选择器
    const possibleSelectors = [
      '.prompt-card',
      '.video-card',
      '[class*="prompt"]',
      '[class*="card"]',
      'article',
      '.item',
      '.post',
    ];

    let selectedSelector = null;
    for (const selector of possibleSelectors) {
      const count = $(selector).length;
      if (count > 0) {
        console.log(`   找到 ${count} 个 "${selector}" 元素`);
        if (!selectedSelector || count > $(selectedSelector).length) {
          selectedSelector = selector;
        }
      }
    }

    if (!selectedSelector) {
      console.error('❌ 未找到内容元素，请检查网站结构');
      await browser.close();
      return;
    }

    console.log(`\n✨ 使用选择器: ${selectedSelector}`);
    const items = $(selectedSelector);
    console.log(`📊 找到 ${items.length} 个提示词项\n`);

    // 遍历每个项目
    for (let i = 0; i < items.length; i++) {
      const item = items.eq(i);

      try {
        // 提取文本内容（提示词）
        const promptText = item.text().trim();

        // 提取视频URL
        let videoUrl = null;
        const videoElement = item.find('video source').first();
        if (videoElement.length) {
          videoUrl = videoElement.attr('src') || videoElement.attr('data-src');
        } else {
          const videoTag = item.find('video').first();
          if (videoTag.length) {
            videoUrl = videoTag.attr('src') || videoTag.attr('data-src');
          }
        }

        // 提取其他元数据
        const title = item.find('h1, h2, h3, h4, [class*="title"]').first().text().trim();
        const description = item.find('p, [class*="description"]').first().text().trim();
        const tags = [];
        item.find('[class*="tag"], .tag').each((j, tag) => {
          tags.push($(tag).text().trim());
        });

        if (!promptText && !videoUrl) {
          continue; // 跳过空项
        }

        const promptData = {
          id: i + 1,
          title: title || `Prompt ${i + 1}`,
          prompt: description || promptText.substring(0, 500),
          tags: tags.length > 0 ? tags : ['uncategorized'],
          videoUrl: videoUrl || null,
          videoFile: null,
          crawledAt: new Date().toISOString(),
        };

        // 下载视频
        if (CONFIG.downloadVideos && videoUrl) {
          try {
            const filename = `video_${i + 1}_${Date.now()}.mp4`;
            const fullVideoUrl = videoUrl.startsWith('http')
              ? videoUrl
              : `${CONFIG.baseUrl}${videoUrl}`;

            await downloadVideo(fullVideoUrl, filename);
            promptData.videoFile = filename;
            videoCount++;
          } catch (error) {
            console.error(`   ⚠️  视频下载失败: ${error.message}`);
          }
        }

        prompts.push(promptData);
        console.log(`✅ [${i + 1}/${items.length}] ${promptData.title}`);

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

  } catch (error) {
    console.error('❌ 爬取失败:', error);
  } finally {
    await browser.close();
  }
}

// 导出爬取的数据为 CSV
function exportToCSV() {
  if (!fs.existsSync(CONFIG.dataFile)) {
    console.error('❌ 数据文件不存在，请先运行爬虫');
    return;
  }

  const data = JSON.parse(fs.readFileSync(CONFIG.dataFile, 'utf-8'));
  const csvFile = path.join(CONFIG.outputDir, 'prompts.csv');

  const csvHeader = 'ID,Title,Prompt,Tags,Video URL,Video File,Crawled At\n';
  const csvRows = data.prompts.map(p => {
    return [
      p.id,
      `"${p.title.replace(/"/g, '""')}"`,
      `"${p.prompt.replace(/"/g, '""')}"`,
      `"${p.tags.join(', ')}"`,
      p.videoUrl || '',
      p.videoFile || '',
      p.crawledAt,
    ].join(',');
  }).join('\n');

  fs.writeFileSync(csvFile, csvHeader + csvRows, 'utf-8');
  console.log(`✅ CSV 导出完成: ${csvFile}`);
}

// 主函数
async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
SoraPrompting.com 爬虫工具

用法:
  node crawl-soraprompting.js [选项]

选项:
  --no-videos          不下载视频（仅保存文案）
  --max-pages <num>    最大滚动次数（默认: 10）
  --headless           无头模式（不显示浏览器）
  --export-csv         导出为 CSV 文件
  -h, --help           显示帮助

示例:
  node crawl-soraprompting.js                    # 完整爬取（含视频）
  node crawl-soraprompting.js --no-videos        # 仅爬取文案
  node crawl-soraprompting.js --max-pages 20     # 爬取更多页面
  node crawl-soraprompting.js --export-csv       # 导出 CSV
    `);
    return;
  }

  if (args.includes('--export-csv')) {
    exportToCSV();
    return;
  }

  if (args.includes('--no-videos')) {
    CONFIG.downloadVideos = false;
  }

  if (args.includes('--headless')) {
    CONFIG.headless = true;
  }

  const maxPagesIndex = args.indexOf('--max-pages');
  if (maxPagesIndex !== -1 && args[maxPagesIndex + 1]) {
    CONFIG.maxPages = parseInt(args[maxPagesIndex + 1], 10);
  }

  await crawlSoraPrompting();
}

// 运行
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { crawlSoraPrompting, exportToCSV };