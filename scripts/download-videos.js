/**
 * 视频下载器
 * 支持 YouTube, Vimeo, 直接 MP4 链接
 * 并发下载控制
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// 配置
const CONCURRENT_DOWNLOADS = 3; // 并发下载数
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const DOWNLOAD_DIR = path.join(__dirname, '..', 'downloads');
const VIDEO_DIR = path.join(DOWNLOAD_DIR, 'videos');
const INPUT_FILE = path.join(__dirname, '..', 'data', 'sora2-prompts-multi-source.json');

/**
 * 确保目录存在
 */
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * 下载直接 MP4 文件
 */
function downloadDirect(url, outputPath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    let totalSize = 0;
    let downloadedSize = 0;

    const file = fs.createWriteStream(outputPath);

    const req = protocol.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      }
    }, (res) => {
      // 处理重定向
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close();
        fs.unlinkSync(outputPath);
        return downloadDirect(res.headers.location, outputPath).then(resolve).catch(reject);
      }

      if (res.statusCode !== 200) {
        file.close();
        fs.unlinkSync(outputPath);
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }

      totalSize = parseInt(res.headers['content-length'] || '0', 10);

      // 检查文件大小
      if (totalSize > MAX_FILE_SIZE) {
        file.close();
        fs.unlinkSync(outputPath);
        reject(new Error(`File too large: ${(totalSize / 1024 / 1024).toFixed(2)}MB`));
        return;
      }

      res.on('data', (chunk) => {
        downloadedSize += chunk.length;
        file.write(chunk);

        // 进度
        if (totalSize > 0) {
          const percent = ((downloadedSize / totalSize) * 100).toFixed(1);
          process.stdout.write(`\r    下载进度: ${percent}% (${(downloadedSize / 1024 / 1024).toFixed(2)}MB / ${(totalSize / 1024 / 1024).toFixed(2)}MB)`);
        }
      });

      res.on('end', () => {
        file.end();
        process.stdout.write('\n');
        resolve({ path: outputPath, size: downloadedSize });
      });
    });

    req.on('error', (error) => {
      file.close();
      if (fs.existsSync(outputPath)) {
        fs.unlinkSync(outputPath);
      }
      reject(error);
    });

    req.setTimeout(60000, () => {
      req.destroy();
      file.close();
      if (fs.existsSync(outputPath)) {
        fs.unlinkSync(outputPath);
      }
      reject(new Error('Download timeout'));
    });
  });
}

/**
 * 使用 yt-dlp 下载 YouTube/Vimeo 视频
 * (注意: 需要系统安装 yt-dlp)
 */
function downloadWithYtDlp(url, outputPath) {
  return new Promise((resolve, reject) => {
    // 检查 yt-dlp 是否安装
    const checkYtDlp = spawn('yt-dlp', ['--version']);

    checkYtDlp.on('error', () => {
      reject(new Error('yt-dlp not installed. Please install it first: https://github.com/yt-dlp/yt-dlp'));
    });

    checkYtDlp.on('close', (code) => {
      if (code !== 0) {
        reject(new Error('yt-dlp not found'));
        return;
      }

      // 下载视频
      const ytDlp = spawn('yt-dlp', [
        '-f', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
        '--merge-output-format', 'mp4',
        '-o', outputPath,
        '--max-filesize', '100M',
        '--no-playlist',
        '--quiet',
        '--progress',
        url
      ]);

      let errorOutput = '';

      ytDlp.stderr.on('data', (data) => {
        const output = data.toString();
        errorOutput += output;

        // 解析进度
        const match = output.match(/(\d+\.\d+)%/);
        if (match) {
          process.stdout.write(`\r    下载进度: ${match[1]}%`);
        }
      });

      ytDlp.on('close', (code) => {
        process.stdout.write('\n');

        if (code === 0 && fs.existsSync(outputPath)) {
          const stats = fs.statSync(outputPath);
          resolve({ path: outputPath, size: stats.size });
        } else {
          if (fs.existsSync(outputPath)) {
            fs.unlinkSync(outputPath);
          }
          reject(new Error(`yt-dlp failed: ${errorOutput || 'Unknown error'}`));
        }
      });
    });
  });
}

/**
 * 下载单个视频
 */
async function downloadVideo(prompt, index, total) {
  const { id, video, categoryLabel } = prompt;
  const categoryDir = path.join(VIDEO_DIR, prompt.category);
  ensureDir(categoryDir);

  console.log(`\n[${index}/${total}] ${categoryLabel} - ${id}`);
  console.log(`  提示词: ${prompt.prompt.substring(0, 60)}...`);
  console.log(`  视频类型: ${video.type}`);

  // 生成文件名
  const ext = video.type === 'direct' ? '.mp4' : '.mp4';
  const filename = `${id}${ext}`;
  const outputPath = path.join(categoryDir, filename);

  // 检查是否已下载
  if (fs.existsSync(outputPath)) {
    const stats = fs.statSync(outputPath);
    console.log(`  ⏭️  已存在，跳过 (${(stats.size / 1024 / 1024).toFixed(2)}MB)`);
    return {
      ...prompt,
      localVideoPath: outputPath,
      videoFileSize: stats.size,
      downloadStatus: 'skipped',
    };
  }

  try {
    let result;

    if (video.type === 'direct') {
      // 直接 MP4 下载
      result = await downloadDirect(video.directUrl, outputPath);
    } else if (video.type === 'youtube' || video.type === 'vimeo') {
      // 使用 yt-dlp 下载
      result = await downloadWithYtDlp(video.directUrl, outputPath);
    } else {
      throw new Error(`Unsupported video type: ${video.type}`);
    }

    console.log(`  ✅ 下载成功 (${(result.size / 1024 / 1024).toFixed(2)}MB)`);

    return {
      ...prompt,
      localVideoPath: result.path,
      videoFileSize: result.size,
      downloadStatus: 'success',
    };
  } catch (error) {
    console.log(`  ❌ 下载失败: ${error.message}`);

    return {
      ...prompt,
      localVideoPath: null,
      downloadStatus: 'failed',
      downloadError: error.message,
    };
  }
}

/**
 * 并发下载控制
 */
async function downloadAll(prompts) {
  const results = [];
  const queue = [...prompts];
  let index = 0;

  while (queue.length > 0) {
    const batch = queue.splice(0, CONCURRENT_DOWNLOADS);
    const promises = batch.map((prompt) => {
      index++;
      return downloadVideo(prompt, index, prompts.length);
    });

    const batchResults = await Promise.all(promises);
    results.push(...batchResults);

    // 短暂延迟，避免请求过快
    if (queue.length > 0) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return results;
}

/**
 * 保存下载结果
 */
function saveResults(results) {
  const outputFile = path.join(DOWNLOAD_DIR, 'download-results.json');

  const stats = {
    total: results.length,
    success: results.filter(r => r.downloadStatus === 'success').length,
    failed: results.filter(r => r.downloadStatus === 'failed').length,
    skipped: results.filter(r => r.downloadStatus === 'skipped').length,
    totalSize: results
      .filter(r => r.videoFileSize)
      .reduce((sum, r) => sum + r.videoFileSize, 0),
  };

  const output = {
    downloadTime: new Date().toISOString(),
    stats,
    results,
  };

  fs.writeFileSync(outputFile, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`\n✅ 下载结果已保存: ${outputFile}`);

  return stats;
}

/**
 * 主函数
 */
async function main() {
  console.log('='.repeat(70));
  console.log('Sora 2 视频下载器');
  console.log('='.repeat(70));

  // 读取爬取的数据
  if (!fs.existsSync(INPUT_FILE)) {
    console.error(`\n❌ 找不到数据文件: ${INPUT_FILE}`);
    console.error('请先运行: node scripts/crawl-multiple-sources.js\n');
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf-8'));
  const prompts = data.prompts;

  console.log(`\n找到 ${prompts.length} 个视频待下载`);
  console.log(`并发数: ${CONCURRENT_DOWNLOADS}`);
  console.log(`最大文件大小: ${MAX_FILE_SIZE / 1024 / 1024}MB`);
  console.log(`下载目录: ${VIDEO_DIR}\n`);

  // 确保目录存在
  ensureDir(DOWNLOAD_DIR);
  ensureDir(VIDEO_DIR);

  // 开始下载
  console.log('开始下载...');
  const results = await downloadAll(prompts);

  // 保存结果
  const stats = saveResults(results);

  // 显示统计
  console.log('\n' + '='.repeat(70));
  console.log('下载统计:');
  console.log('='.repeat(70));
  console.log(`  总数: ${stats.total}`);
  console.log(`  成功: ${stats.success}`);
  console.log(`  失败: ${stats.failed}`);
  console.log(`  跳过: ${stats.skipped}`);
  console.log(`  总大小: ${(stats.totalSize / 1024 / 1024).toFixed(2)}MB`);
  console.log('\n下一步:');
  console.log('  1. 生成缩略图: node scripts/generate-thumbnails.js');
  console.log('  2. 上传到 R2: node scripts/upload-to-r2.js\n');
}

// 运行下载器
main().catch(error => {
  console.error('\n❌ 下载器运行出错:', error);
  process.exit(1);
});
