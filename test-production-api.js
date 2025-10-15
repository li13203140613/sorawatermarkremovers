/**
 * 测试线上 API 是否正常工作
 */

const fetch = require('node-fetch');

// 测试不同类型的 Token
async function testProductionAPI() {
  console.log('🧪 测试线上 API\n');
  console.log('==================================\n');

  // 1. 测试用 Service Role Key（应该能工作）
  const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqZWZoemFwZmJvdXNsa2dsbGFoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTkxMzUyMSwiZXhwIjoyMDc1NDg5NTIxfQ.6LfQSEV454yvpZmI65qyhRzJ0trsFFMt0dcuL1K7eJE';

  console.log('📡 测试 1: 使用 Service Role Key\n');

  try {
    const response = await fetch('https://www.sora-prompt.io/api/user/profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'X-Extension-Request': 'true',
      },
    });

    console.log('📊 响应状态:', response.status, response.statusText);

    if (response.ok) {
      const data = await response.json();
      console.log('\n✅ API 调用成功！');
      console.log('返回数据:', JSON.stringify(data, null, 2));
    } else {
      const errorText = await response.text();
      console.log('\n❌ API 调用失败');
      console.log('错误内容:', errorText);
    }
  } catch (error) {
    console.error('❌ 请求异常:', error.message);
  }

  console.log('\n==================================\n');

  // 2. 测试用 Anon Key（应该失败）
  const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqZWZoemFwZmJvdXNsa2dsbGFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5MTM1MjEsImV4cCI6MjA3NTQ4OTUyMX0.49ix1bGrSrTqsS5qDXWgj6OOk-bj5UOaDTkNazqCdko';

  console.log('📡 测试 2: 使用 Anon Key\n');

  try {
    const response = await fetch('https://www.sora-prompt.io/api/user/profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${ANON_KEY}`,
        'X-Extension-Request': 'true',
      },
    });

    console.log('📊 响应状态:', response.status, response.statusText);

    if (response.ok) {
      const data = await response.json();
      console.log('\n✅ API 调用成功！');
      console.log('返回数据:', JSON.stringify(data, null, 2));
    } else {
      const errorText = await response.text();
      console.log('\n❌ API 调用失败（预期）');
      console.log('错误内容:', errorText);
    }
  } catch (error) {
    console.error('❌ 请求异常:', error.message);
  }

  console.log('\n==================================\n');

  // 3. 测试无 Token
  console.log('📡 测试 3: 不带 Token\n');

  try {
    const response = await fetch('https://www.sora-prompt.io/api/user/profile', {
      method: 'GET',
      headers: {
        'X-Extension-Request': 'true',
      },
    });

    console.log('📊 响应状态:', response.status, response.statusText);
    const errorText = await response.text();
    console.log('错误内容:', errorText);
  } catch (error) {
    console.error('❌ 请求异常:', error.message);
  }
}

// 运行测试
testProductionAPI().then(() => {
  console.log('\n✅ 测试完成');
}).catch(error => {
  console.error('\n❌ 测试失败:', error);
});