/**
 * 测试查询用户积分
 */

const { createClient } = require('@supabase/supabase-js');

// 从 .env.local 读取配置
const SUPABASE_URL = 'https://zjefhzapfbouslkgllah.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'sb_secret_b3pcfBBG03OBzoGqR6U6Lg_aiKOOIxm';

async function testCreditsQuery() {
  console.log('🔍 开始测试积分查询...\n');

  // 创建 Supabase 客户端（使用 Service Role Key）
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // 测试查询 lixiaofei160@gmail.com 的积分
  console.log('📧 查询用户: lixiaofei160@gmail.com');

  try {
    // 1. 先从 auth.users 获取用户 ID
    const { data: users, error: usersError } = await supabase
      .from('auth.users')
      .select('id, email')
      .eq('email', 'lixiaofei160@gmail.com')
      .limit(1);

    if (usersError) {
      console.error('❌ 查询 auth.users 失败:', usersError);

      // 尝试直接查询 user_profiles
      console.log('\n🔄 尝试直接查询 user_profiles...');
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('email', 'lixiaofei160@gmail.com');

      if (profilesError) {
        console.error('❌ 查询 user_profiles 失败:', profilesError);
        return;
      }

      if (profiles && profiles.length > 0) {
        console.log('✅ 找到用户 profile:');
        console.log('   ID:', profiles[0].id);
        console.log('   邮箱:', profiles[0].email);
        console.log('   积分:', profiles[0].credits);
        console.log('   用户名:', profiles[0].full_name);
      } else {
        console.log('⚠️ 未找到该用户的 profile 记录');
      }
      return;
    }

    if (!users || users.length === 0) {
      console.log('⚠️ 未找到该用户');
      return;
    }

    const userId = users[0].id;
    console.log('✅ 找到用户 ID:', userId);

    // 2. 查询 user_profiles
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('❌ 查询 user_profiles 失败:', profileError);
      return;
    }

    if (!profile) {
      console.log('⚠️ 未找到该用户的 profile 记录');
      return;
    }

    console.log('\n✅ 用户 profile 信息:');
    console.log('   ID:', profile.id);
    console.log('   邮箱:', profile.email);
    console.log('   积分:', profile.credits);
    console.log('   用户名:', profile.full_name);
    console.log('   头像:', profile.avatar_url);
    console.log('   创建时间:', profile.created_at);
    console.log('   更新时间:', profile.updated_at);

  } catch (error) {
    console.error('❌ 查询失败:', error);
  }

  // 查询所有用户的积分
  console.log('\n\n📊 查询所有用户的积分:');
  try {
    const { data: allProfiles, error } = await supabase
      .from('user_profiles')
      .select('email, credits, full_name, id')
      .order('credits', { ascending: false });

    if (error) {
      console.error('❌ 查询失败:', error);
      return;
    }

    if (allProfiles && allProfiles.length > 0) {
      console.log(`\n找到 ${allProfiles.length} 个用户:\n`);
      allProfiles.forEach((p, i) => {
        console.log(`${i + 1}. ${p.email}`);
        console.log(`   积分: ${p.credits}`);
        console.log(`   用户名: ${p.full_name || '未设置'}`);
        console.log(`   ID: ${p.id}`);
        console.log('');
      });
    } else {
      console.log('⚠️ user_profiles 表中没有数据');
    }
  } catch (error) {
    console.error('❌ 查询失败:', error);
  }
}

// 运行测试
testCreditsQuery().then(() => {
  console.log('\n✅ 测试完成');
  process.exit(0);
}).catch(error => {
  console.error('\n❌ 测试失败:', error);
  process.exit(1);
});
