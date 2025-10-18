/**
 * R2 批量上传器
 * 将视频和缩略图上传到 Cloudflare R2
 */

const { S3Client, PutObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// 配置
const CONCURRENT_UPLOADS = 3;
const DOWNLOAD_DIR = path.join(__dirname, '..', 'downloads');
const INPUT_FILE = path.join(DOWNLOAD_DIR, 'thumbnail-results.json');
const FINAL_OUTPUT_FILE = path.join(__dirname, '..', 'data', 'sora2-prompts-final.json');

/**
 * 创建 R2 客户端
 */
function createR2Client() {
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const endpoint = process.env.R2_ENDPOINT;

  if (!accessKeyId || !secretAccessKey || !endpoint) {
    throw new Error('R2 配置不完整，请检查 .env.local 文件');
  }

  return new S3Client({
    region: 'auto',
    endpoint,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

/**
 * 获取 MIME 类型
 */
function getContentType(filename) {
  const ext = path.extname(filename).toLowerCase();
  const types = {
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.mov': 'video/quicktime',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
  };
  return types[ext] || 'application/octet-stream';
}

/**
 * 检查文件是否已上传
 */
async function fileExists(client, bucketName, key) {
  try {
    const command = new HeadObjectCommand({
      Bucket: bucketName,
      Key: key,
    });
    await client.send(command);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * 上传单个文件到 R2
 */
async function uploadFile(client, bucketName, localPath, r2Key) {
  const fileBuffer = fs.readFileSync(localPath);
  const contentType = getContentType(localPath);

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: r2Key,
    Body: fileBuffer,
    ContentType: contentType,
  });

  await client.send(command);

  // 返回公开 URL
  const publicUrl = process.env.R2_PUBLIC_URL || '';
  const cleanKey = r2Key.startsWith('/') ? r2Key.slice(1) : r2Key;
  const baseUrl = publicUrl.endsWith('/') ? publicUrl : `${publicUrl}/`;
  return `${baseUrl}${cleanKey}`;
}

/**
 * 处理单个提示词的上传
 */
async function processPrompt(client, bucketName, result, index, total) {
  const { id, category, categoryLabel, localVideoPath, localThumbnailPath } = result;

  console.log(`\n[${index}/${total}] ${categoryLabel} - ${id}`);

  const uploads = [];
  let videoUrl = null;
  let thumbnailUrl = null;

  // 上传视频
  if (localVideoPath && fs.existsSync(localVideoPath)) {
    const videoKey = `sora2/videos/${category}/${path.basename(localVideoPath)}`;

    // 检查是否已上传
    const exists = await fileExists(client, bucketName, videoKey);
    if (exists) {
      console.log(`  ⏭️  视频已存在，跳过上传`);
      videoUrl = `${process.env.R2_PUBLIC_URL}/${videoKey}`;
    } else {
      try {
        const stats = fs.statSync(localVideoPath);
        process.stdout.write(`  上传视频 (${(stats.size / 1024 / 1024).toFixed(2)}MB)...`);
        videoUrl = await uploadFile(client, bucketName, localVideoPath, videoKey);
        console.log(` ✅`);
      } catch (error) {
        console.log(` ❌ ${error.message}`);
      }
    }
  }

  // 上传缩略图
  if (localThumbnailPath && fs.existsSync(localThumbnailPath)) {
    const thumbnailKey = `sora2/thumbnails/${category}/${path.basename(localThumbnailPath)}`;

    // 检查是否已上传
    const exists = await fileExists(client, bucketName, thumbnailKey);
    if (exists) {
      console.log(`  ⏭️  缩略图已存在，跳过上传`);
      thumbnailUrl = `${process.env.R2_PUBLIC_URL}/${thumbnailKey}`;
    } else {
      try {
        const stats = fs.statSync(localThumbnailPath);
        process.stdout.write(`  上传缩略图 (${(stats.size / 1024).toFixed(2)}KB)...`);
        thumbnailUrl = await uploadFile(client, bucketName, localThumbnailPath, thumbnailKey);
        console.log(` ✅`);
      } catch (error) {
        console.log(` ❌ ${error.message}`);
      }
    }
  }

  return {
    ...result,
    r2VideoUrl: videoUrl,
    r2ThumbnailUrl: thumbnailUrl,
    uploadStatus: (videoUrl || thumbnailUrl) ? 'success' : 'failed',
  };
}

/**
 * 并发上传控制
 */
async function uploadAll(client, bucketName, results) {
  const processed = [];
  const queue = [...results];
  let index = 0;

  while (queue.length > 0) {
    const batch = queue.splice(0, CONCURRENT_UPLOADS);
    const promises = batch.map((result) => {
      index++;
      return processPrompt(client, bucketName, result, index, results.length);
    });

    const batchResults = await Promise.all(promises);
    processed.push(...batchResults);
  }

  return processed;
}

/**
 * 生成最终数据文件（供前端使用）
 */
function generateFinalData(results) {
  const prompts = results
    .filter(r => r.uploadStatus === 'success')
    .map(r => ({
      id: r.id,
      category: r.category,
      categoryLabel: r.categoryLabel,
      categoryIcon: r.categoryIcon,
      prompt: r.prompt,
      thumbnailUrl: r.r2ThumbnailUrl || r.thumbnailUrl,
      videoUrl: r.r2VideoUrl || r.videoUrl,
      source: r.source,
    }));

  // 统计
  const stats = {
    totalCount: prompts.length,
    categories: {},
  };

  prompts.forEach(p => {
    stats.categories[p.categoryLabel] = (stats.categories[p.categoryLabel] || 0) + 1;
  });

  const output = {
    source: 'Multiple sources (crawled, downloaded, uploaded to R2)',
    lastUpdate: new Date().toISOString(),
    stats,
    prompts,
  };

  // 确保目录存在
  const dir = path.dirname(FINAL_OUTPUT_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(FINAL_OUTPUT_FILE, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`\n✅ 最终数据已保存: ${FINAL_OUTPUT_FILE}`);

  return stats;
}

/**
 * 保存上传结果
 */
function saveUploadResults(results) {
  const outputFile = path.join(DOWNLOAD_DIR, 'upload-results.json');

  const stats = {
    total: results.length,
    success: results.filter(r => r.uploadStatus === 'success').length,
    failed: results.filter(r => r.uploadStatus === 'failed').length,
  };

  const output = {
    uploadTime: new Date().toISOString(),
    stats,
    results,
  };

  fs.writeFileSync(outputFile, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`✅ 上传结果已保存: ${outputFile}`);

  return stats;
}

/**
 * 主函数
 */
async function main() {
  console.log('='.repeat(70));
  console.log('R2 批量上传器');
  console.log('='.repeat(70));

  // 读取缩略图生成结果
  if (!fs.existsSync(INPUT_FILE)) {
    console.error(`\n❌ 找不到缩略图结果文件: ${INPUT_FILE}`);
    console.error('请先运行: node scripts/generate-thumbnails.js\n');
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf-8'));
  const results = data.results;

  console.log(`\n找到 ${results.length} 个项目待上传`);
  console.log(`R2 Bucket: ${process.env.R2_BUCKET_NAME}`);
  console.log(`公开 URL: ${process.env.R2_PUBLIC_URL}`);
  console.log(`并发数: ${CONCURRENT_UPLOADS}\n`);

  // 创建 R2 客户端
  console.log('创建 R2 客户端...');
  const client = createR2Client();
  const bucketName = process.env.R2_BUCKET_NAME;
  console.log('✅ R2 客户端创建成功\n');

  // 开始上传
  console.log('开始上传到 R2...');
  const processed = await uploadAll(client, bucketName, results);

  // 保存上传结果
  const uploadStats = saveUploadResults(processed);

  // 生成最终数据文件
  console.log('\n生成最终数据文件...');
  const finalStats = generateFinalData(processed);

  // 显示统计
  console.log('\n' + '='.repeat(70));
  console.log('上传统计:');
  console.log('='.repeat(70));
  console.log(`  总数: ${uploadStats.total}`);
  console.log(`  成功: ${uploadStats.success}`);
  console.log(`  失败: ${uploadStats.failed}`);
  console.log('\n最终数据统计:');
  console.log(`  总数: ${finalStats.totalCount}`);
  console.log(`  分类分布:`);
  Object.entries(finalStats.categories).forEach(([cat, count]) => {
    console.log(`    - ${cat}: ${count} 条`);
  });
  console.log('\n✅ 全部完成！');
  console.log('\n下一步:');
  console.log('  1. 查看最终数据: cat data/sora2-prompts-final.json');
  console.log('  2. 更新页面数据源为: sora2-prompts-final.json\n');
}

// 运行上传器
main().catch(error => {
  console.error('\n❌ 上传器运行出错:', error);
  process.exit(1);
});
