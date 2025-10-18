/**
 * 视频缩略图生成器
 * 使用 ffmpeg 从视频中提取帧作为缩略图
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// 配置
const THUMBNAIL_WIDTH = 640;
const THUMBNAIL_HEIGHT = 360;
const THUMBNAIL_FORMAT = 'jpg'; // jpg 或 webp
const THUMBNAIL_QUALITY = 85; // 1-100
const CONCURRENT_GENERATION = 3;
const DOWNLOAD_DIR = path.join(__dirname, '..', 'downloads');
const THUMBNAIL_DIR = path.join(DOWNLOAD_DIR, 'thumbnails');
const INPUT_FILE = path.join(DOWNLOAD_DIR, 'download-results.json');

/**
 * 确保目录存在
 */
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * 检查 ffmpeg 是否安装
 */
function checkFfmpeg() {
  return new Promise((resolve, reject) => {
    const ffmpeg = spawn('ffmpeg', ['-version']);

    ffmpeg.on('error', () => {
      reject(new Error('ffmpeg not installed'));
    });

    ffmpeg.on('close', (code) => {
      if (code === 0) {
        resolve(true);
      } else {
        reject(new Error('ffmpeg not found'));
      }
    });
  });
}

/**
 * 生成单个缩略图
 */
function generateThumbnail(videoPath, outputPath) {
  return new Promise((resolve, reject) => {
    // ffmpeg 命令:
    // -i: 输入文件
    // -ss 1: 从第1秒开始截取
    // -vframes 1: 只截取1帧
    // -vf scale: 缩放到指定尺寸
    // -q:v: 质量 (2-31, 数字越小质量越高)
    const quality = Math.round((100 - THUMBNAIL_QUALITY) / 4) + 2; // 转换为 ffmpeg 的 q:v 值

    const args = [
      '-i', videoPath,
      '-ss', '1', // 截取第1秒的帧
      '-vframes', '1',
      '-vf', `scale=${THUMBNAIL_WIDTH}:${THUMBNAIL_HEIGHT}:force_original_aspect_ratio=decrease,pad=${THUMBNAIL_WIDTH}:${THUMBNAIL_HEIGHT}:(ow-iw)/2:(oh-ih)/2`,
      '-q:v', String(quality),
      '-y', // 覆盖已存在的文件
      outputPath
    ];

    const ffmpeg = spawn('ffmpeg', args, {
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let errorOutput = '';

    ffmpeg.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    ffmpeg.on('close', (code) => {
      if (code === 0 && fs.existsSync(outputPath)) {
        const stats = fs.statSync(outputPath);
        resolve({ path: outputPath, size: stats.size });
      } else {
        if (fs.existsSync(outputPath)) {
          fs.unlinkSync(outputPath);
        }
        reject(new Error(`ffmpeg failed: ${errorOutput || 'Unknown error'}`));
      }
    });

    ffmpeg.on('error', (error) => {
      reject(error);
    });
  });
}

/**
 * 处理单个视频
 */
async function processVideo(result, index, total) {
  const { id, category, categoryLabel, localVideoPath, downloadStatus } = result;

  console.log(`\n[${index}/${total}] ${categoryLabel} - ${id}`);

  // 跳过下载失败的视频
  if (downloadStatus === 'failed' || !localVideoPath) {
    console.log(`  ⏭️  跳过 (视频下载失败)`);
    return {
      ...result,
      thumbnailStatus: 'skipped',
    };
  }

  // 检查视频文件是否存在
  if (!fs.existsSync(localVideoPath)) {
    console.log(`  ⏭️  跳过 (视频文件不存在)`);
    return {
      ...result,
      thumbnailStatus: 'skipped',
    };
  }

  // 创建分类目录
  const categoryDir = path.join(THUMBNAIL_DIR, category);
  ensureDir(categoryDir);

  // 生成缩略图文件名
  const thumbnailFilename = `${id}.${THUMBNAIL_FORMAT}`;
  const thumbnailPath = path.join(categoryDir, thumbnailFilename);

  // 检查是否已生成
  if (fs.existsSync(thumbnailPath)) {
    const stats = fs.statSync(thumbnailPath);
    console.log(`  ⏭️  已存在，跳过 (${(stats.size / 1024).toFixed(2)}KB)`);
    return {
      ...result,
      localThumbnailPath: thumbnailPath,
      thumbnailFileSize: stats.size,
      thumbnailStatus: 'skipped',
    };
  }

  try {
    console.log(`  正在生成缩略图...`);
    const thumbnail = await generateThumbnail(localVideoPath, thumbnailPath);
    console.log(`  ✅ 生成成功 (${(thumbnail.size / 1024).toFixed(2)}KB)`);

    return {
      ...result,
      localThumbnailPath: thumbnail.path,
      thumbnailFileSize: thumbnail.size,
      thumbnailStatus: 'success',
    };
  } catch (error) {
    console.log(`  ❌ 生成失败: ${error.message}`);

    return {
      ...result,
      thumbnailStatus: 'failed',
      thumbnailError: error.message,
    };
  }
}

/**
 * 并发生成控制
 */
async function generateAll(results) {
  const processed = [];
  const queue = [...results];
  let index = 0;

  while (queue.length > 0) {
    const batch = queue.splice(0, CONCURRENT_GENERATION);
    const promises = batch.map((result) => {
      index++;
      return processVideo(result, index, results.length);
    });

    const batchResults = await Promise.all(promises);
    processed.push(...batchResults);
  }

  return processed;
}

/**
 * 保存结果
 */
function saveResults(results) {
  const outputFile = path.join(DOWNLOAD_DIR, 'thumbnail-results.json');

  const stats = {
    total: results.length,
    success: results.filter(r => r.thumbnailStatus === 'success').length,
    failed: results.filter(r => r.thumbnailStatus === 'failed').length,
    skipped: results.filter(r => r.thumbnailStatus === 'skipped').length,
    totalSize: results
      .filter(r => r.thumbnailFileSize)
      .reduce((sum, r) => sum + r.thumbnailFileSize, 0),
  };

  const output = {
    generationTime: new Date().toISOString(),
    stats,
    results,
  };

  fs.writeFileSync(outputFile, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`\n✅ 生成结果已保存: ${outputFile}`);

  return stats;
}

/**
 * 主函数
 */
async function main() {
  console.log('='.repeat(70));
  console.log('视频缩略图生成器');
  console.log('='.repeat(70));

  // 检查 ffmpeg
  console.log('\n检查 ffmpeg...');
  try {
    await checkFfmpeg();
    console.log('✅ ffmpeg 已安装\n');
  } catch (error) {
    console.error('❌ ffmpeg 未安装');
    console.error('\n请安装 ffmpeg:');
    console.error('  Windows: https://www.gyan.dev/ffmpeg/builds/');
    console.error('  Mac: brew install ffmpeg');
    console.error('  Linux: sudo apt install ffmpeg\n');
    process.exit(1);
  }

  // 读取下载结果
  if (!fs.existsSync(INPUT_FILE)) {
    console.error(`\n❌ 找不到下载结果文件: ${INPUT_FILE}`);
    console.error('请先运行: node scripts/download-videos.js\n');
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf-8'));
  const results = data.results;

  console.log(`找到 ${results.length} 个视频`);
  console.log(`缩略图尺寸: ${THUMBNAIL_WIDTH}x${THUMBNAIL_HEIGHT}`);
  console.log(`格式: ${THUMBNAIL_FORMAT.toUpperCase()}`);
  console.log(`质量: ${THUMBNAIL_QUALITY}%`);
  console.log(`并发数: ${CONCURRENT_GENERATION}`);
  console.log(`输出目录: ${THUMBNAIL_DIR}\n`);

  // 确保目录存在
  ensureDir(THUMBNAIL_DIR);

  // 开始生成
  console.log('开始生成缩略图...');
  const processed = await generateAll(results);

  // 保存结果
  const stats = saveResults(processed);

  // 显示统计
  console.log('\n' + '='.repeat(70));
  console.log('生成统计:');
  console.log('='.repeat(70));
  console.log(`  总数: ${stats.total}`);
  console.log(`  成功: ${stats.success}`);
  console.log(`  失败: ${stats.failed}`);
  console.log(`  跳过: ${stats.skipped}`);
  console.log(`  总大小: ${(stats.totalSize / 1024).toFixed(2)}KB`);
  console.log('\n下一步:');
  console.log('  1. 上传到 R2: node scripts/upload-to-r2.js\n');
}

// 运行生成器
main().catch(error => {
  console.error('\n❌ 生成器运行出错:', error);
  process.exit(1);
});
