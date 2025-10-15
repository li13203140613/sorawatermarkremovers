/**
 * 详细测试线上 API
 */

const fetch = require('node-fetch');

// 测试数据
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqZWZoemFwZmJvdXNsa2dsbGFoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTkxMzUyMSwiZXhwIjoyMDc1NDg5NTIxfQ.6LfQSEV454yvpZmI65qyhRzJ0trsFFMt0dcuL1K7eJE';

// 这是从插件日志中看到的真实 access_token（lixiaofei160@gmail.com 登录后的）
// 需要你提供一个真实的 token，或者我们模拟一个
const REAL_USER_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test'; // 这个需要替换为真实的

async function testOnlineAPI() {
  console.log('🧪 详细测试线上 API\n');
  console.log('==================================\n');

  // 测试 1: 直接调用线上 API（不带任何 token）
  console.log('📡 测试 1: 不带 Token 调用');
  try {
    const response = await fetch('https://www.sora-prompt.io/api/user/profile', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    console.log('   状态:', response.status, response.statusText);
    const text = await response.text();
    console.log('   响应:', text);
  } catch (error) {
    console.error('   错误:', error.message);
  }

  console.log('\n==================================\n');

  // 测试 2: 使用 Service Role Key 作为 Bearer Token
  console.log('📡 测试 2: 使用 Service Role Key 作为 Bearer Token');
  console.log('   说明: API 代码会用这个 token 创建 Supabase 客户端');

  try {
    const response = await fetch('https://www.sora-prompt.io/api/user/profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'X-Extension-Request': 'true',
        'Content-Type': 'application/json',
      }
    });

    console.log('   状态:', response.status, response.statusText);
    const text = await response.text();
    console.log('   响应:', text);

    // 如果返回 401，说明线上的 SUPABASE_SERVICE_ROLE_KEY 环境变量可能不对
    if (response.status === 401) {
      console.log('\n   ⚠️ 分析: 返回 401 可能原因：');
      console.log('      1. 线上环境变量 SUPABASE_SERVICE_ROLE_KEY 未配置');
      console.log('      2. 或者配置的值不正确');
      console.log('      3. 或者 API 代码逻辑有问题');
    }
  } catch (error) {
    console.error('   错误:', error.message);
  }

  console.log('\n==================================\n');

  // 测试 3: 模拟插件的请求（使用真实用户 token）
  console.log('📡 测试 3: 模拟插件请求（需要真实的用户 access_token）');
  console.log('   说明: 这是插件登录后实际发送的请求');

  if (REAL_USER_TOKEN === 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test') {
    console.log('   ⚠️ 需要真实的用户 access_token 才能测试');
    console.log('   获取方法: 从插件控制台日志中复制 "Token 已获取" 后面的 token');
  } else {
    try {
      const response = await fetch('https://www.sora-prompt.io/api/user/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${REAL_USER_TOKEN}`,
          'X-Extension-Request': 'true',
          'Content-Type': 'application/json',
        }
      });

      console.log('   状态:', response.status, response.statusText);
      const text = await response.text();
      console.log('   响应:', text);
    } catch (error) {
      console.error('   错误:', error.message);
    }
  }

  console.log('\n==================================\n');

  // 测试 4: 测试本地 API（对比）
  console.log('📡 测试 4: 本地 API 对比测试');

  try {
    const response = await fetch('http://localhost:3000/api/user/profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'X-Extension-Request': 'true',
        'Content-Type': 'application/json',
      }
    });

    console.log('   状态:', response.status, response.statusText);
    if (response.ok) {
      const data = await response.json();
      console.log('   响应:', JSON.stringify(data, null, 2));
    } else {
      const text = await response.text();
      console.log('   响应:', text);
    }
  } catch (error) {
    console.error('   错误: 本地服务器可能未运行');
  }
}

// 运行测试
testOnlineAPI().then(() => {
  console.log('\n✅ 测试完成');
  console.log('\n📋 结论:');
  console.log('   1. Service Role Key 本身是有效的（可以查询数据库）');
  console.log('   2. 但线上 API 返回 401，说明环境变量可能有问题');
  console.log('   3. 需要检查 Vercel 的环境变量配置');
}).catch(error => {
  console.error('\n❌ 测试失败:', error);
});