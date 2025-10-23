/**
 * 上传 SoraPrompting 爬取的数据到 Cloudflare R2
 * 包括视频文件和提示词 JSON 数据
 */

const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// R2 配置
const R2_CONFIG = {
  accessKeyId: process.env.R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  endpoint: process.env.R2_ENDPOINT,
  bucketName: process.env.R2_BUCKET_NAME,
  publicUrl: process.env.R2_PUBLIC_URL,
};

// 本地路径
const LOCAL_PATHS = {
  videos: path.join(__dirname, '../data/soraprompting/videos'),
  json: path.join(__dirname, '../data/soraprompting/prompts.json'),
};

// R2 路径前缀
const R2_PREFIX = 'soraprompting';

// 创建 S3 客户端
function createR2Client() {
  if (!R2_CONFIG.accessKeyId || !R2_CONFIG.secretAccessKey || !R2_CONFIG.endpoint) {
    throw new Error('R2 配置不完整，请检查环境变量');
  }

  return new S3Client({
    region: 'auto',
    endpoint: R2_CONFIG.endpoint,
    credentials: {
      accessKeyId: R2_CONFIG.accessKeyId,
      secretAccessKey: R2_CONFIG.secretAccessKey,
    },
  });
}

// 上传单个文件
async function uploadFile(client, localPath, r2Key, contentType) {
  try {
    const fileBuffer = fs.readFileSync(localPath);
    const fileSize = (fileBuffer.length / 1024 / 1024).toFixed(2); // MB

    console.log(`📤 上传: ${path.basename(localPath)} (${fileSize} MB)`);

    const command = new PutObjectCommand({
      Bucket: R2_CONFIG.bucketName,
      Key: r2Key,
      Body: fileBuffer,
      ContentType: contentType,
    });

    await client.send(command);

    const publicUrl = `${R2_CONFIG.publicUrl}/${r2Key}`;
    console.log(`✅ 完成: ${publicUrl}`);

    return { success: true, url: publicUrl, r2Key };
  } catch (error) {
    console.error(`❌ 失败: ${r2Key}`, error.message);
    return { success: false, error: error.message, r2Key };
  }
}

// 上传所有视频
async function uploadVideos(client) {
  console.log('\n📹 开始上传视频...\n');

  const videosDir = LOCAL_PATHS.videos;
  if (!fs.existsSync(videosDir)) {
    console.error(`❌ 视频目录不存在: ${videosDir}`);
    return [];
  }

  const videoFiles = fs.readdirSync(videosDir).filter(f => f.endsWith('.mp4'));
  console.log(`找到 ${videoFiles.length} 个视频文件\n`);

  const results = [];

  // 串行上传（避免并发过多）
  for (let i = 0; i < videoFiles.length; i++) {
    const filename = videoFiles[i];
    const localPath = path.join(videosDir, filename);
    const r2Key = `${R2_PREFIX}/videos/${filename}`;

    console.log(`[${i + 1}/${videoFiles.length}]`);
    const result = await uploadFile(client, localPath, r2Key, 'video/mp4');
    results.push(result);

    // 每次上传后等待1秒
    if (i < videoFiles.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  const successCount = results.filter(r => r.success).length;
  console.log(`\n✅ 视频上传完成: ${successCount}/${videoFiles.length}`);

  return results;
}

// 上传 JSON 数据
async function uploadJSON(client, videoResults) {
  console.log('\n📄 开始上传 JSON 数据...\n');

  const jsonPath = LOCAL_PATHS.json;
  if (!fs.existsSync(jsonPath)) {
    console.error(`❌ JSON 文件不存在: ${jsonPath}`);
    return null;
  }

  // 读取原始 JSON
  const originalData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

  // 更新 videoUrl 和 videoFile 为 R2 URL
  const videoUrlMap = {};
  videoResults.forEach(result => {
    if (result.success && result.r2Key) {
      const filename = path.basename(result.r2Key);
      videoUrlMap[filename] = result.url;
    }
  });

  // 更新提示词数据
  const updatedPrompts = originalData.prompts.map(prompt => {
    if (prompt.videoFile && videoUrlMap[prompt.videoFile]) {
      return {
        ...prompt,
        videoUrl: videoUrlMap[prompt.videoFile],
        r2VideoUrl: videoUrlMap[prompt.videoFile], // 新增 R2 URL
      };
    }
    return prompt;
  });

  const updatedData = {
    ...originalData,
    prompts: updatedPrompts,
    uploadedToR2: true,
    r2UploadDate: new Date().toISOString(),
  };

  // 上传 JSON
  const r2Key = `${R2_PREFIX}/prompts.json`;
  const result = await uploadFile(
    client,
    jsonPath,
    r2Key,
    'application/json'
  );

  if (result.success) {
    // 同时保存更新后的 JSON 到本地
    const updatedJsonPath = path.join(__dirname, '../data/soraprompting/prompts-with-r2-urls.json');
    fs.writeFileSync(updatedJsonPath, JSON.stringify(updatedData, null, 2), 'utf-8');
    console.log(`\n💾 已保存更新后的 JSON: ${updatedJsonPath}`);
  }

  return result;
}

// 生成上传报告
function generateReport(videoResults, jsonResult) {
  console.log('\n' + '='.repeat(60));
  console.log('📊 上传报告');
  console.log('='.repeat(60));

  // 视频统计
  const totalVideos = videoResults.length;
  const successVideos = videoResults.filter(r => r.success).length;
  const failedVideos = totalVideos - successVideos;

  console.log(`\n视频上传:`);
  console.log(`  总数: ${totalVideos}`);
  console.log(`  成功: ${successVideos}`);
  console.log(`  失败: ${failedVideos}`);

  if (failedVideos > 0) {
    console.log(`\n失败的视频:`);
    videoResults
      .filter(r => !r.success)
      .forEach(r => console.log(`  - ${r.r2Key}: ${r.error}`));
  }

  // JSON 统计
  console.log(`\nJSON 数据:`);
  if (jsonResult && jsonResult.success) {
    console.log(`  ✅ 上传成功`);
    console.log(`  URL: ${jsonResult.url}`);
  } else {
    console.log(`  ❌ 上传失败`);
  }

  // R2 访问信息
  console.log(`\n🔗 R2 公开访问:`);
  console.log(`  JSON: ${R2_CONFIG.publicUrl}/${R2_PREFIX}/prompts.json`);
  console.log(`  视频: ${R2_CONFIG.publicUrl}/${R2_PREFIX}/videos/`);

  console.log('\n' + '='.repeat(60));
}

// 主函数
async function main() {
  try {
    console.log('🚀 开始上传 SoraPrompting 数据到 Cloudflare R2...\n');

    // 检查配置
    if (!R2_CONFIG.publicUrl || !R2_CONFIG.bucketName) {
      throw new Error('R2_PUBLIC_URL 和 R2_BUCKET_NAME 必须配置');
    }

    // 创建客户端
    const client = createR2Client();

    // 上传视频
    const videoResults = await uploadVideos(client);

    // 上传 JSON
    const jsonResult = await uploadJSON(client, videoResults);

    // 生成报告
    generateReport(videoResults, jsonResult);

    console.log('\n✅ 所有上传任务完成！');
  } catch (error) {
    console.error('\n❌ 上传失败:', error);
    process.exit(1);
  }
}

// 运行
if (require.main === module) {
  main();
}

module.exports = { uploadVideos, uploadJSON };