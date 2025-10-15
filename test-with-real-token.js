/**
 * 使用真实 token 测试 API
 * 需要先从 Supabase 获取有效的 access token
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://zjefhzapfbouslkgllah.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'sb_secret_b3pcfBBG03OBzoGqR6U6Lg_aiKOOIxm';

async function testWithRealToken() {
  console.log('🧪 使用 Service Role Key 测试 API\n');

  // 创建 Supabase 客户端（使用 Service Role Key）
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // 1. 先获取用户信息
  const { data: profiles, error: profileError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('email', 'lixiaofei160@gmail.com')
    .single();

  if (profileError) {
    console.error('❌ 查询用户失败:', profileError);
    return;
  }

  const userId = profiles.id;
  console.log('✅ 找到用户 ID:', userId);
  console.log('   邮箱:', profiles.email);
  console.log('   数据库积分:', profiles.credits);

  // 2. 为该用户创建一个访问 token（这需要特殊处理）
  // 注意：这只是为了测试，实际应该通过 OAuth 流程获取
  console.log('\n📡 调用本地 API...');

  // 3. 使用 Service Role Key 直接调用 API
  try {
    const response = await fetch('http://localhost:3000/api/user/profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'X-Extension-Request': 'true',
        'Content-Type': 'application/json',
      },
    });

    console.log('📊 响应状态:', response.status, response.statusText);

    const data = await response.json();
    console.log('\n📦 API 返回数据:');
    console.log(JSON.stringify(data, null, 2));

    if (data.credits !== undefined) {
      console.log('\n🎯 API 返回的积分:', data.credits);
      if (data.credits === 1) {
        console.log('✅ 积分正确！返回了 1');
      } else if (data.credits === 0) {
        console.log('❌ 积分错误！返回了 0，应该是 1');
      } else if (data.credits === null) {
        console.log('⚠️  积分为 null');
      }
    }

  } catch (error) {
    console.error('❌ 请求失败:', error.message);
  }
}

// 测试：模拟插件创建用户 profile
async function testCreateProfile() {
  console.log('\n\n==================================');
  console.log('🧪 测试自动创建 profile 功能\n');

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // 测试一个新用户 ID
  const testUserId = 'test-user-' + Date.now();
  const testEmail = `test${Date.now()}@example.com`;

  console.log('📝 创建测试用户 profile...');
  console.log('   ID:', testUserId);
  console.log('   邮箱:', testEmail);

  const { data, error } = await supabase
    .from('user_profiles')
    .insert({
      id: testUserId,
      email: testEmail,
      credits: 0,
      full_name: 'Test User',
    })
    .select()
    .single();

  if (error) {
    console.error('❌ 创建失败:', error);
  } else {
    console.log('✅ 创建成功！');
    console.log('   积分:', data.credits);

    // 清理测试数据
    await supabase
      .from('user_profiles')
      .delete()
      .eq('id', testUserId);

    console.log('🧹 测试数据已清理');
  }
}

// 运行所有测试
async function runAllTests() {
  await testWithRealToken();
  await testCreateProfile();
  console.log('\n✅ 所有测试完成！');
}

runAllTests().catch(error => {
  console.error('\n❌ 测试失败:', error);
  process.exit(1);
});