/**
 * 测试本地 API 返回积分
 * 模拟插件使用 Bearer Token 调用
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase 配置
const SUPABASE_URL = 'https://zjefhzapfbouslkgllah.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqZWZoemFwZmJvdXNsa2dsbGFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5MTM1MjEsImV4cCI6MjA3NTQ4OTUyMX0.49ix1bGrSrTqsS5qDXWgj6OOk-bj5UOaDTkNazqCdko';

async function testLocalAPI() {
  console.log('🧪 测试本地 API 获取积分\n');
  console.log('==================================\n');

  // Step 1: 使用 Google OAuth 登录获取 token
  console.log('📧 测试账号: lixiaofei160@gmail.com\n');

  // 创建 Supabase 客户端
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // 模拟登录（这里需要一个有效的 session）
  console.log('⚠️  注意：这个测试需要有效的 access_token');
  console.log('    你需要先通过插件登录获取 token\n');

  // Step 2: 使用一个模拟 token 调用本地 API
  const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test'; // 这是一个模拟 token

  console.log('📡 调用本地 API: http://localhost:3000/api/user/profile');
  console.log('🔑 使用 Bearer Token (模拟)\n');

  try {
    const response = await fetch('http://localhost:3000/api/user/profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${testToken}`,
        'X-Extension-Request': 'true',
        'Content-Type': 'application/json',
        'Origin': 'chrome-extension://test'
      },
    });

    console.log('📊 响应状态:', response.status, response.statusText);

    const data = await response.json();
    console.log('\n📦 API 返回数据:');
    console.log(JSON.stringify(data, null, 2));

    if (response.ok && data.credits !== undefined) {
      console.log('\n✅ 成功获取积分:', data.credits);
      if (data.credits === 1) {
        console.log('✅ 积分正确！应该是 1');
      } else if (data.credits === 0) {
        console.log('❌ 积分错误！返回了 0，应该是 1');
      } else if (data.credits === null) {
        console.log('⚠️  积分为 null，可能数据库查询失败');
      }
    } else {
      console.log('\n❌ API 调用失败或未返回积分');
    }

  } catch (error) {
    console.error('❌ 请求失败:', error.message);
    console.log('\n💡 提示：确保本地开发服务器正在运行（npm run dev）');
  }
}

// 直接测试使用 Service Role Key 查询数据库
async function directDatabaseTest() {
  console.log('\n\n==================================');
  console.log('📊 直接数据库查询测试\n');

  const SUPABASE_SERVICE_ROLE_KEY = 'sb_secret_b3pcfBBG03OBzoGqR6U6Lg_aiKOOIxm';
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    // 查询 user_profiles 表
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', 'lixiaofei160@gmail.com')
      .single();

    if (error) {
      console.error('❌ 数据库查询失败:', error);
      return;
    }

    if (data) {
      console.log('✅ 数据库查询成功！');
      console.log('   ID:', data.id);
      console.log('   邮箱:', data.email);
      console.log('   积分:', data.credits);
      console.log('   用户名:', data.full_name || '未设置');
      console.log('   更新时间:', data.updated_at);
    } else {
      console.log('⚠️  未找到用户记录');
    }

  } catch (error) {
    console.error('❌ 查询异常:', error);
  }
}

// 运行测试
async function runTests() {
  await testLocalAPI();
  await directDatabaseTest();
  console.log('\n✅ 所有测试完成！');
}

runTests().catch(error => {
  console.error('\n❌ 测试失败:', error);
  process.exit(1);
});