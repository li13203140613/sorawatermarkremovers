/**
 * 一键式自动化内容收集脚本
 *
 * 完整流程:
 * 1. 爬取多个来源的 Sora 2 提示词
 * 2. 下载视频文件
 * 3. 生成视频缩略图
 * 4. 上传到 Cloudflare R2
 * 5. 生成最终数据文件
 *
 * 使用方法:
 *   node scripts/collect-all-content.js
 */

const { spawn } = require('child_process');
const path = require('path');

// 脚本路径
const SCRIPTS = {
  crawl: 'scripts/crawl-multiple-sources.js',
  download: 'scripts/download-videos.js',
  thumbnail: 'scripts/generate-thumbnails.js',
  upload: 'scripts/upload-to-r2.js',
};

/**
 * 执行单个脚本
 */
function runScript(scriptPath, scriptName) {
  return new Promise((resolve, reject) => {
    console.log('\n' + '='.repeat(70));
    console.log(`执行: ${scriptName}`);
    console.log('='.repeat(70));

    const child = spawn('node', [scriptPath], {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..'),
    });

    child.on('close', (code) => {
      if (code === 0) {
        console.log(`\n✅ ${scriptName} 完成`);
        resolve();
      } else {
        console.error(`\n❌ ${scriptName} 失败 (退出码: ${code})`);
        reject(new Error(`${scriptName} failed with code ${code}`));
      }
    });

    child.on('error', (error) => {
      console.error(`\n❌ 无法执行 ${scriptName}:`, error.message);
      reject(error);
    });
  });
}

/**
 * 显示进度
 */
function showProgress(current, total, stepName) {
  const percent = ((current / total) * 100).toFixed(0);
  const bar = '█'.repeat(Math.floor(current / total * 30)) + '░'.repeat(30 - Math.floor(current / total * 30));
  console.log(`\n进度: [${bar}] ${percent}% (${current}/${total})`);
  console.log(`当前步骤: ${stepName}\n`);
}

/**
 * 主流程
 */
async function main() {
  const startTime = Date.now();

  console.log('╔' + '═'.repeat(68) + '╗');
  console.log('║' + ' '.repeat(20) + 'Sora 2 内容自动收集系统' + ' '.repeat(22) + '║');
  console.log('╚' + '═'.repeat(68) + '╝');

  console.log('\n📋 流程概览:');
  console.log('  1. 爬取提示词 (多来源)');
  console.log('  2. 下载视频文件');
  console.log('  3. 生成视频缩略图 (需要 ffmpeg)');
  console.log('  4. 上传到 Cloudflare R2');
  console.log('  5. 生成最终数据\n');

  console.log('⚙️  配置检查:');
  console.log('  ✓ 并发下载: 3 个');
  console.log('  ✓ 并发上传: 3 个');
  console.log('  ✓ 缩略图尺寸: 640x360');
  console.log('  ✓ 视频质量: 1080p 优先\n');

  console.log('⏱️  预计时间: 10-30 分钟（取决于视频数量和网络速度）\n');

  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const answer = await new Promise(resolve => {
    readline.question('是否开始执行？(y/n): ', resolve);
  });
  readline.close();

  if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
    console.log('\n已取消操作');
    process.exit(0);
  }

  try {
    // 步骤 1: 爬取提示词
    showProgress(1, 4, '爬取提示词');
    await runScript(SCRIPTS.crawl, '步骤 1: 爬取提示词');

    // 步骤 2: 下载视频
    showProgress(2, 4, '下载视频');
    await runScript(SCRIPTS.download, '步骤 2: 下载视频');

    // 步骤 3: 生成缩略图
    showProgress(3, 4, '生成缩略图');
    await runScript(SCRIPTS.thumbnail, '步骤 3: 生成缩略图');

    // 步骤 4: 上传到 R2
    showProgress(4, 4, '上传到 R2');
    await runScript(SCRIPTS.upload, '步骤 4: 上传到 R2');

    // 完成
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000 / 60).toFixed(1);

    console.log('\n' + '╔' + '═'.repeat(68) + '╗');
    console.log('║' + ' '.repeat(28) + '✅ 全部完成！' + ' '.repeat(27) + '║');
    console.log('╚' + '═'.repeat(68) + '╝');

    console.log(`\n⏱️  总耗时: ${duration} 分钟`);
    console.log('\n📊 结果文件:');
    console.log('  1. 原始爬取数据: data/sora2-prompts-multi-source.json');
    console.log('  2. 下载结果: downloads/download-results.json');
    console.log('  3. 缩略图结果: downloads/thumbnail-results.json');
    console.log('  4. 上传结果: downloads/upload-results.json');
    console.log('  5. 最终数据 (供前端使用): data/sora2-prompts-final.json');

    console.log('\n📁 本地文件:');
    console.log('  - 视频: downloads/videos/[category]/');
    console.log('  - 缩略图: downloads/thumbnails/[category]/');

    console.log('\n☁️  R2 存储:');
    console.log('  - 视频: sora2/videos/[category]/');
    console.log('  - 缩略图: sora2/thumbnails/[category]/');

    console.log('\n🎯 下一步:');
    console.log('  1. 更新页面数据源:');
    console.log('     在 app/sora2prompt/page.tsx 中:');
    console.log('     import promptsData from \'@/data/sora2-prompts-final.json\';');
    console.log('\n  2. 重启开发服务器:');
    console.log('     npm run dev');
    console.log('\n  3. 访问页面查看效果:');
    console.log('     http://localhost:3000/sora2prompt');

    console.log('\n💡 提示:');
    console.log('  - 定期运行此脚本以更新内容');
    console.log('  - 可以设置 cron job 实现自动更新');
    console.log('  - 所有视频和图片都已托管在 R2 CDN 上\n');

  } catch (error) {
    console.error('\n' + '╔' + '═'.repeat(68) + '╗');
    console.error('║' + ' '.repeat(29) + '❌ 执行失败' + ' '.repeat(28) + '║');
    console.error('╚' + '═'.repeat(68) + '╝');
    console.error(`\n错误: ${error.message}`);
    console.error('\n请检查:');
    console.error('  1. 网络连接是否正常');
    console.error('  2. R2 配置是否正确 (.env.local)');
    console.error('  3. ffmpeg 是否已安装 (用于缩略图生成)');
    console.error('  4. yt-dlp 是否已安装 (用于 YouTube/Vimeo 下载，可选)\n');
    process.exit(1);
  }
}

// 运行主流程
main().catch(error => {
  console.error('未捕获的错误:', error);
  process.exit(1);
});
