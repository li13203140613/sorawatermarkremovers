/**
 * 测试 Cloudflare R2 连接
 * 验证配置是否正确，能否成功上传和访问文件
 */

const { S3Client, PutObjectCommand, HeadObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const https = require('https');
require('dotenv').config({ path: '.env.local' });

// 配置检查
function checkConfig() {
  const required = [
    'R2_ACCESS_KEY_ID',
    'R2_SECRET_ACCESS_KEY',
    'R2_ENDPOINT',
    'R2_BUCKET_NAME',
    'R2_PUBLIC_URL'
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.error('❌ 缺少必要的环境变量:');
    missing.forEach(key => console.error(`   - ${key}`));
    process.exit(1);
  }

  console.log('✅ 环境变量配置完整\n');
  console.log('配置信息:');
  console.log(`  Endpoint: ${process.env.R2_ENDPOINT}`);
  console.log(`  Bucket: ${process.env.R2_BUCKET_NAME}`);
  console.log(`  Public URL: ${process.env.R2_PUBLIC_URL}\n`);
}

// 创建 R2 客户端
function createR2Client() {
  return new S3Client({
    region: 'auto',
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
  });
}

// 测试上传文件
async function testUpload(client) {
  const testContent = `R2 连接测试
测试时间: ${new Date().toISOString()}
Bucket: ${process.env.R2_BUCKET_NAME}

如果你能看到这个文件，说明 R2 配置成功！`;

  const testKey = 'test/r2-connection-test.txt';

  try {
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: testKey,
      Body: Buffer.from(testContent, 'utf-8'),
      ContentType: 'text/plain; charset=utf-8',
    });

    await client.send(command);
    console.log('✅ 文件上传成功');
    return testKey;
  } catch (error) {
    console.error('❌ 文件上传失败:', error.message);
    throw error;
  }
}

// 测试文件是否存在
async function testFileExists(client, key) {
  try {
    const command = new HeadObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
    });

    const response = await client.send(command);
    console.log('✅ 文件在 R2 存储桶中可访问');
    console.log(`  文件大小: ${response.ContentLength} bytes`);
    console.log(`  Content-Type: ${response.ContentType}`);
    return true;
  } catch (error) {
    console.error('❌ 文件不存在或无法访问:', error.message);
    throw error;
  }
}

// 测试公开 URL 访问
async function testPublicUrl(key) {
  const cleanKey = key.startsWith('/') ? key.slice(1) : key;
  const baseUrl = process.env.R2_PUBLIC_URL.endsWith('/')
    ? process.env.R2_PUBLIC_URL
    : `${process.env.R2_PUBLIC_URL}/`;
  const publicUrl = `${baseUrl}${cleanKey}`;

  console.log(`\n测试公开 URL: ${publicUrl}`);

  return new Promise((resolve, reject) => {
    https.get(publicUrl, (res) => {
      if (res.statusCode === 200) {
        console.log('✅ 公开 URL 可访问');
        console.log(`  HTTP 状态码: ${res.statusCode}`);

        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          console.log(`  内容预览: ${data.substring(0, 100)}...`);
          resolve(true);
        });
      } else {
        console.error(`❌ 公开 URL 无法访问 (HTTP ${res.statusCode})`);
        console.error(`  可能原因:`);
        console.error(`    1. 存储桶未配置公开访问`);
        console.error(`    2. R2_PUBLIC_URL 配置错误`);
        console.error(`    3. 自定义域名未正确设置`);
        reject(new Error(`HTTP ${res.statusCode}`));
      }
    }).on('error', (error) => {
      console.error('❌ 网络请求失败:', error.message);
      reject(error);
    });
  });
}

// 清理测试文件
async function cleanup(client, key) {
  try {
    const command = new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
    });

    await client.send(command);
    console.log('\n✅ 测试文件已清理');
  } catch (error) {
    console.error('\n⚠️  清理测试文件失败 (不影响测试结果):', error.message);
  }
}

// 主测试流程
async function main() {
  console.log('='.repeat(60));
  console.log('Cloudflare R2 连接测试');
  console.log('='.repeat(60));
  console.log();

  try {
    // 1. 检查配置
    checkConfig();

    // 2. 创建客户端
    console.log('正在创建 R2 客户端...');
    const client = createR2Client();
    console.log('✅ R2 客户端创建成功\n');

    // 3. 测试上传
    console.log('测试 1: 上传文件到 R2');
    const testKey = await testUpload(client);
    console.log();

    // 4. 测试文件存在性
    console.log('测试 2: 检查文件是否在存储桶中');
    await testFileExists(client, testKey);
    console.log();

    // 5. 测试公开访问
    console.log('测试 3: 测试公开 URL 访问');
    await testPublicUrl(testKey);

    // 6. 清理
    await cleanup(client, testKey);

    // 成功总结
    console.log('\n' + '='.repeat(60));
    console.log('✅ 所有测试通过！R2 配置正确');
    console.log('='.repeat(60));
    console.log('\n你现在可以：');
    console.log('  1. 开始上传视频和图片到 R2');
    console.log('  2. 运行自动化内容收集脚本');
    console.log('  3. 使用 R2 公开 URL 在页面上展示内容\n');

  } catch (error) {
    console.log('\n' + '='.repeat(60));
    console.log('❌ 测试失败');
    console.log('='.repeat(60));
    console.log('\n请检查：');
    console.log('  1. .env.local 文件中的 R2 配置是否正确');
    console.log('  2. R2 API Token 是否有 Object Read & Write 权限');
    console.log('  3. 存储桶是否存在并已配置公开访问');
    console.log('  4. 自定义域名 DNS 是否正确配置\n');
    console.log('详细错误:', error.message);
    process.exit(1);
  }
}

// 运行测试
main();
