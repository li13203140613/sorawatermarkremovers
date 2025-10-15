/**
 * 测试使用 Service Role Key 能否成功查询数据库
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://zjefhzapfbouslkgllah.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqZWZoemFwZmJvdXNsa2dsbGFoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTkxMzUyMSwiZXhwIjoyMDc1NDg5NTIxfQ.6LfQSEV454yvpZmI65qyhRzJ0trsFFMt0dcuL1K7eJE';

async function testServiceRoleKey() {
  console.log('🧪 测试 Service Role Key 是否有效\n');
  console.log('==================================\n');

  // 1. 使用 Service Role Key 创建 Supabase 客户端
  console.log('📡 步骤 1: 创建 Supabase 客户端');
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  console.log('✅ 客户端创建成功\n');

  // 2. 直接查询 user_profiles 表（Service Role Key 可以绕过 RLS）
  console.log('📡 步骤 2: 查询 user_profiles 表');
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', 'lixiaofei160@gmail.com')
      .single();

    if (error) {
      console.error('❌ 查询失败:', error);
      return;
    }

    console.log('✅ 查询成功！');
    console.log('📊 用户数据:');
    console.log('   ID:', data.id);
    console.log('   邮箱:', data.email);
    console.log('   积分:', data.credits);
    console.log('   更新时间:', data.updated_at);
  } catch (error) {
    console.error('❌ 异常:', error);
  }

  console.log('\n==================================\n');

  // 3. 测试 auth.getUser() 方法（需要用户的 access_token）
  console.log('📡 步骤 3: 测试 auth.getUser() 方法');
  console.log('⚠️  注意: 这个方法需要有效的用户 access_token');

  // 模拟一个用户的 access_token（这个不会成功，只是为了测试）
  const fakeUserToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test';

  const supabaseWithToken = createClient(
    SUPABASE_URL,
    SERVICE_ROLE_KEY,
    {
      global: {
        headers: {
          Authorization: `Bearer ${fakeUserToken}`
        }
      }
    }
  );

  try {
    const { data, error } = await supabaseWithToken.auth.getUser();
    if (error) {
      console.log('❌ getUser 失败（预期）:', error.message);
    } else {
      console.log('✅ getUser 成功:', data);
    }
  } catch (error) {
    console.error('❌ 异常:', error.message);
  }

  console.log('\n==================================\n');

  // 4. 测试从 Supabase 获取 admin auth（Service Role 专用）
  console.log('📡 步骤 4: 测试 Service Role 权限');
  try {
    const { data, error } = await supabase.auth.admin.listUsers();
    if (error) {
      console.error('❌ 列出用户失败:', error);
    } else {
      console.log('✅ Service Role Key 有效！可以列出用户');
      console.log(`   找到 ${data.users.length} 个用户`);

      // 查找特定用户
      const user = data.users.find(u => u.email === 'lixiaofei160@gmail.com');
      if (user) {
        console.log('\n📧 找到用户 lixiaofei160@gmail.com:');
        console.log('   ID:', user.id);
        console.log('   邮箱:', user.email);
        console.log('   创建时间:', user.created_at);
      }
    }
  } catch (error) {
    console.error('❌ 异常:', error.message);
  }
}

// 运行测试
testServiceRoleKey().then(() => {
  console.log('\n✅ 测试完成');
}).catch(error => {
  console.error('\n❌ 测试失败:', error);
});