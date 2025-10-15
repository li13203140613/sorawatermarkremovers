/**
 * 测试线上 API 使用真实用户 Token
 */

const fetch = require('node-fetch');

// 配置
const ONLINE_API = 'https://www.sora-prompt.io/api/user/profile';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqZWZoemFwZmJvdXNsa2dsbGFoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTkxMzUyMSwiZXhwIjoyMDc1NDg5NTIxfQ.6LfQSEV454yvpZmI65qyhRzJ0trsFFMt0dcuL1K7eJE';

// 如果你有用户的 access_token，请填写在这里
// 可以从插件的控制台日志中获取（登录后会显示 "Token 已获取: ..."）
const USER_ACCESS_TOKEN = ''; // 请填写真实的用户 token

async function testAPI() {
  console.log('🧪 测试线上 API\n');
  console.log('📍 API 地址:', ONLINE_API);
  console.log('==================================\n');

  // 测试 1: 使用 Service Role Key
  console.log('📡 测试 1: 使用 Service Role Key 作为 Bearer Token');
  try {
    const response1 = await fetch(ONLINE_API, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'X-Extension-Request': 'true',
        'Content-Type': 'application/json',
      }
    });

    console.log('   状态:', response1.status);
    const text1 = await response1.text();
    console.log('   响应:', text1);

    if (response1.ok) {
      const data = JSON.parse(text1);
      console.log('\n✅ 成功获取用户信息:');
      console.log('   ID:', data.id);
      console.log('   邮箱:', data.email);
      console.log('   积分:', data.credits);
    } else {
      console.log('\n❌ API 返回错误');
      console.log('   可能原因:');
      console.log('   1. 线上代码未更新');
      console.log('   2. 环境变量配置有误');
    }
  } catch (error) {
    console.error('❌ 请求失败:', error.message);
  }

  console.log('\n==================================\n');

  // 测试 2: 使用用户的 Access Token（如果有）
  if (USER_ACCESS_TOKEN) {
    console.log('📡 测试 2: 使用用户的 Access Token');
    try {
      const response2 = await fetch(ONLINE_API, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${USER_ACCESS_TOKEN}`,
          'X-Extension-Request': 'true',
          'Content-Type': 'application/json',
        }
      });

      console.log('   状态:', response2.status);
      const text2 = await response2.text();
      console.log('   响应:', text2);

      if (response2.ok) {
        const data = JSON.parse(text2);
        console.log('\n✅ 成功获取用户信息:');
        console.log('   ID:', data.id);
        console.log('   邮箱:', data.email);
        console.log('   积分:', data.credits);
      }
    } catch (error) {
      console.error('❌ 请求失败:', error.message);
    }
  } else {
    console.log('⚠️ 测试 2: 跳过（需要提供用户 Token）');
    console.log('   获取方法: 从插件控制台复制登录后的 token');
  }

  console.log('\n==================================\n');

  // 测试 3: 直接查询数据库（验证 Service Role Key 有效性）
  console.log('📡 测试 3: 直接使用 Service Role Key 查询数据库');
  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      'https://zjefhzapfbouslkgllah.supabase.co',
      SERVICE_ROLE_KEY
    );

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', 'lixiaofei160@gmail.com')
      .single();

    if (error) {
      console.log('❌ 查询失败:', error.message);
    } else {
      console.log('✅ 数据库查询成功:');
      console.log('   用户 ID:', data.id);
      console.log('   邮箱:', data.email);
      console.log('   积分:', data.credits);
      console.log('\n📝 Service Role Key 有效，可以查询数据库');
    }
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
  }

  console.log('\n📋 结论:');
  console.log('   如果测试 1 失败但测试 3 成功，说明:');
  console.log('   → Service Role Key 是正确的');
  console.log('   → 问题在于线上 API 代码未更新或环境变量未配置');
  console.log('   → 需要部署最新代码到 Vercel');
}

testAPI();