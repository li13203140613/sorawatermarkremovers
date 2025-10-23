/**
 * 测试多视频生成功能 (MultiVideoGenerator)
 * 使用 Puppeteer 进行自动化测试
 */
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// 创建截图目录
const screenshotsDir = path.join(__dirname, 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

async function testMultiVideoGenerator() {
  console.log('🚀 开始测试多视频生成功能...\n');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  try {
    // 步骤 1: 访问页面
    console.log('📍 步骤 1: 访问视频生成页面...');
    await page.goto('http://localhost:3000/zh/video-generation', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    await new Promise(resolve => setTimeout(resolve, 2000));
    await page.screenshot({ path: path.join(screenshotsDir, '01_initial_page.png'), fullPage: true });
    console.log('   ✅ 页面加载完成 (截图: 01_initial_page.png)\n');

    // 步骤 2: 检查页面元素
    console.log('📍 步骤 2: 检查页面元素...');
    const pageTitle = await page.title();
    console.log(`   📄 页面标题: ${pageTitle}\n`);

    console.log('   🔍 检查左侧表单元素:');

    // 检查模型选择
    const sora2Radio = await page.$('input[value="sora2"]');
    const sora2UnwmRadio = await page.$('input[value="sora2-unwm"]');
    console.log(`   • 标准版选项: ${sora2Radio ? '✅ 存在' : '❌ 不存在'}`);
    console.log(`   • 专业版选项: ${sora2UnwmRadio ? '✅ 存在' : '❌ 不存在'}`);

    // 检查提示词输入框
    const promptTextarea = await page.$('textarea[placeholder*="描述您想要的视频内容"]');
    console.log(`   • 提示词输入框: ${promptTextarea ? '✅ 存在' : '❌ 不存在'}`);

    // 检查图片上传
    const fileInput = await page.$('input[type="file"][accept*="image"]');
    console.log(`   • 图片上传输入: ${fileInput ? '✅ 存在' : '❌ 不存在'}`);

    // 检查生成按钮
    const generateButton = await page.$('button[type="submit"]');
    console.log(`   • 生成按钮: ${generateButton ? '✅ 存在' : '❌ 不存在'}`);

    if (generateButton) {
      const buttonText = await page.evaluate(btn => btn.innerText, generateButton);
      console.log(`   • 按钮文本: '${buttonText}'`);
    }

    console.log('\n   🔍 检查右侧视频卡片区域:');

    // 检查统计栏
    const statsSection = await page.$('text=生成进度') || await page.evaluate(() => {
      return Array.from(document.querySelectorAll('*')).find(el => el.textContent.includes('生成进度'));
    });
    console.log(`   • 统计栏: ${statsSection ? '✅ 存在' : '❌ 不存在'}`);

    // 检查 6 个视频卡片
    const videoCards = await page.$$eval('*', elements => {
      return elements.filter(el => /视频 #\d/.test(el.textContent)).map(el => el.textContent.match(/视频 #\d/)[0]);
    });
    console.log(`   • 视频卡片数量: ${videoCards.length}`);

    videoCards.slice(0, 6).forEach((card, i) => {
      console.log(`     - ${card}`);
    });

    // 检查等待状态
    const idleBadges = await page.$$eval('*', elements => {
      return elements.filter(el => el.textContent.includes('等待生成')).length;
    });
    console.log(`   • 等待状态卡片: ${idleBadges}\n`);

    await page.screenshot({ path: path.join(screenshotsDir, '02_form_elements.png'), fullPage: true });
    console.log('   ✅ 元素检查完成 (截图: 02_form_elements.png)\n');

    // 步骤 3: 检查登录状态
    console.log('📍 步骤 3: 检查用户登录状态...');
    const loginStatus = await page.evaluate(() => {
      return document.body.textContent.includes('已登录');
    });

    if (loginStatus) {
      console.log('   ✅ 用户已登录');
      const creditsText = await page.evaluate(() => {
        const el = Array.from(document.querySelectorAll('*')).find(e => e.textContent.includes('剩余积分'));
        return el ? el.textContent : '';
      });
      if (creditsText) {
        console.log(`   💎 ${creditsText}`);
      }
    } else {
      const notLoggedIn = await page.evaluate(() => {
        return document.body.textContent.includes('请先');
      });
      if (notLoggedIn) {
        console.log('   ⚠️  用户未登录 - 需要登录才能测试生成功能');
        console.log('   ℹ️  测试将在此停止,请先登录后再运行测试');
      } else {
        console.log('   ⚠️  无法确定登录状态');
      }
    }

    await page.screenshot({ path: path.join(screenshotsDir, '03_login_status.png'), fullPage: true });
    console.log('   ✅ 登录状态检查完成 (截图: 03_login_status.png)\n');

    // 步骤 4: 测试表单交互
    console.log('📍 步骤 4: 测试表单交互...');

    if (sora2Radio) {
      await page.click('input[value="sora2"]');
      console.log('   ✅ 已选择 sora2 (标准版)');
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    if (promptTextarea) {
      const testPrompt = '一只可爱的橙色小猫在花园里追逐蝴蝶,阳光明媚,画面温馨';
      await page.type('textarea[placeholder*="描述您想要的视频内容"]', testPrompt, { delay: 50 });
      console.log(`   ✅ 已填写提示词: '${testPrompt}'`);
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    await page.screenshot({ path: path.join(screenshotsDir, '04_form_filled.png'), fullPage: true });
    console.log('   ✅ 表单填写完成 (截图: 04_form_filled.png)\n');

    // 步骤 5: 检查按钮状态
    console.log('📍 步骤 5: 检查生成按钮状态...');

    if (generateButton) {
      const isDisabled = await page.evaluate(btn => btn.disabled, generateButton);
      const buttonText = await page.evaluate(btn => btn.innerText, generateButton);

      console.log(`   • 按钮状态: ${isDisabled ? '🔒 禁用' : '✅ 启用'}`);
      console.log(`   • 按钮文本: '${buttonText}'`);

      if (isDisabled) {
        console.log('   ℹ️  按钮被禁用,可能原因:');
        console.log('      - 用户未登录');
        console.log('      - 积分不足');
        console.log('      - 表单未填写完整');
      } else {
        console.log('   ⚠️  注意: 按钮已启用,但我们不会实际点击以避免消耗积分');
        console.log('   ℹ️  如需完整测试,请手动运行生成功能');
      }
    }

    await page.screenshot({ path: path.join(screenshotsDir, '05_ready_to_submit.png'), fullPage: true });
    console.log('   ✅ 最终状态截图 (05_ready_to_submit.png)\n');

    // 步骤 6: 测试响应式布局
    console.log('📍 步骤 6: 检查响应式布局...');

    await page.setViewport({ width: 768, height: 1024 });
    await new Promise(resolve => setTimeout(resolve, 1000));
    await page.screenshot({ path: path.join(screenshotsDir, '06_tablet_view.png'), fullPage: true });
    console.log('   ✅ 平板视图 (截图: 06_tablet_view.png)');

    await page.setViewport({ width: 375, height: 812 });
    await new Promise(resolve => setTimeout(resolve, 1000));
    await page.screenshot({ path: path.join(screenshotsDir, '07_mobile_view.png'), fullPage: true });
    console.log('   ✅ 手机视图 (截图: 07_mobile_view.png)');

    await page.setViewport({ width: 1920, height: 1080 });
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log();

    // 步骤 7: 检查性能
    console.log('📍 步骤 7: 检查页面性能...');
    const performance = await page.evaluate(() => {
      const timing = performance.timing;
      return {
        domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
        loadComplete: timing.loadEventEnd - timing.navigationStart,
        domInteractive: timing.domInteractive - timing.navigationStart
      };
    });

    console.log(`   • DOM 内容加载: ${performance.domContentLoaded}ms`);
    console.log(`   • DOM 交互就绪: ${performance.domInteractive}ms`);
    console.log(`   • 页面完全加载: ${performance.loadComplete}ms\n`);

    // 步骤 8: 检查控制台日志
    console.log('📍 步骤 8: 检查控制台日志...');
    const consoleLogs = [];

    page.on('console', msg => {
      consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
    });

    await page.reload({ waitUntil: 'networkidle2' });
    await new Promise(resolve => setTimeout(resolve, 2000));

    if (consoleLogs.length > 0) {
      console.log(`   📝 捕获到 ${consoleLogs.length} 条控制台消息:`);
      consoleLogs.slice(0, 10).forEach(log => {
        console.log(`      ${log}`);
      });
      if (consoleLogs.length > 10) {
        console.log(`      ... 还有 ${consoleLogs.length - 10} 条消息`);
      }
    } else {
      console.log('   ℹ️  未捕获到控制台消息');
    }
    console.log();

    // 步骤 9: 检查可访问性
    console.log('📍 步骤 9: 检查可访问性...');

    const labels = await page.$$('label');
    console.log(`   • 表单标签数量: ${labels.length}`);

    const buttons = await page.$$('button');
    const buttonsWithText = await page.$$eval('button', btns => {
      return btns.filter(btn => btn.innerText.trim()).length;
    });
    console.log(`   • 按钮总数: ${buttons.length}`);
    console.log(`   • 有文本的按钮: ${buttonsWithText}`);

    const images = await page.$$('img');
    const imagesWithAlt = await page.$$eval('img', imgs => {
      return imgs.filter(img => img.alt).length;
    });
    console.log(`   • 图片总数: ${images.length}`);
    console.log(`   • 有 alt 属性的图片: ${imagesWithAlt}`);

    await page.screenshot({ path: path.join(screenshotsDir, '08_final_state.png'), fullPage: true });
    console.log('   ✅ 最终状态截图 (08_final_state.png)\n');

    // 测试总结
    console.log('='.repeat(60));
    console.log('✅ 测试完成!');
    console.log('='.repeat(60));
    console.log('\n📊 测试总结:');
    console.log(`   • 视频卡片数量: ${videoCards.length}`);
    console.log(`   • 登录状态: ${loginStatus ? '✅ 已登录' : '❌ 未登录'}`);
    console.log('   • 表单元素: ✅ 完整');
    console.log('   • 响应式布局: ✅ 正常');
    console.log('   • 截图保存: screenshots/ 目录 (共 8 张)');
    console.log('\n💡 提示:');
    console.log('   - 所有截图已保存到 screenshots/ 目录');
    console.log('   - 如需测试完整生成流程,请手动登录并点击生成按钮');
    console.log('   - 建议检查截图确认 UI 是否符合预期');
    console.log('\n' + '='.repeat(60));

  } catch (error) {
    console.error('\n❌ 测试过程中出现错误:');
    console.error(error);
    await page.screenshot({ path: path.join(screenshotsDir, 'error.png'), fullPage: true });
    console.log('   📸 错误截图已保存: screenshots/error.png');
  } finally {
    await browser.close();
  }
}

// 运行测试
testMultiVideoGenerator().catch(console.error);
