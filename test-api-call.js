/**
 * 测试模拟插件调用 /api/user/profile API
 */

const fetch = require('node-fetch');

// 模拟一个 access_token（需要真实的 token）
const TEST_TOKEN = 'YOUR_ACTUAL_TOKEN_HERE'; // 你需要从插件的 console.log 中获取真实的 token

async function testAPICall() {
  console.log('🧪 测试 API 调用...\n');

  const apiUrl = 'http://localhost:3000/api/user/profile';

  console.log('📡 调用 API:', apiUrl);
  console.log('🔑 使用 Bearer Token:', TEST_TOKEN.substring(0, 20) + '...\n');

  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'X-Extension-Request': 'true',
        'Content-Type': 'application/json',
      },
    });

    console.log('📊 响应状态:', response.status, response.statusText);

    const data = await response.json();

    if (response.ok) {
      console.log('\n✅ API 调用成功！\n');
      console.log('📦 返回数据:');
      console.log('   ID:', data.id);
      console.log('   邮箱:', data.email);
      console.log('   用户名:', data.name);
      console.log('   积分:', data.credits);
      console.log('   头像:', data.avatar_url);
    } else {
      console.log('\n❌ API 调用失败！\n');
      console.log('错误信息:', data);
    }

  } catch (error) {
    console.error('❌ 请求失败:', error.message);
  }
}

// 检查是否提供了 token
if (TEST_TOKEN === 'YOUR_ACTUAL_TOKEN_HERE') {
  console.log('⚠️  请先设置真实的 access_token！');
  console.log('');
  console.log('获取方法：');
  console.log('1. 打开插件 popup');
  console.log('2. 打开浏览器控制台（F12）');
  console.log('3. 点击登录按钮');
  console.log('4. 在控制台中找到 "Token 已获取" 的日志');
  console.log('5. 复制 access_token 并替换上面的 TEST_TOKEN');
  console.log('');
  console.log('或者运行以下命令直接测试（无需 token）：');
  console.log('node test-api-call-no-auth.js');
  process.exit(1);
} else {
  testAPICall().then(() => {
    console.log('\n✅ 测试完成');
    process.exit(0);
  }).catch(error => {
    console.error('\n❌ 测试失败:', error);
    process.exit(1);
  });
}
