const { createClient } = require('@supabase/supabase-js');

// Supabase 配置
const supabaseUrl = 'https://zjefhzapfbouslkgllah.supabase.co';
const supabaseServiceKey = 'sb_secret_b3pcfBBG03OBzoGqR6U6Lg_aiKOOIxm'; // 使用 service role key

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createUserProfile() {
  console.log('🔍 创建用户积分记录...\n');

  // 1. 先查询 auth.users 表找到用户 ID
  const { data: users, error: usersError } = await supabase.auth.admin.listUsers();

  if (usersError) {
    console.error('❌ 查询用户失败:', usersError);
    return;
  }

  const user = users.users.find(u => u.email === 'lixiaofei160@gmail.com');

  if (!user) {
    console.log('⚠️ 在 auth.users 中找不到用户 lixiaofei160@gmail.com');
    return;
  }

  console.log('✅ 找到用户 ID:', user.id);
  console.log('📧 邮箱:', user.email);

  // 2. 创建 user_profiles 记录
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .insert([
      {
        id: user.id,
        email: user.email,
        credits: 10, // 给 10 个初始积分
        full_name: user.user_metadata?.full_name || '李李李',
        avatar_url: user.user_metadata?.avatar_url
      }
    ])
    .select()
    .single();

  if (profileError) {
    if (profileError.code === '23505') {
      console.log('⚠️ 用户记录已存在，尝试更新积分...');

      // 更新积分
      const { data: updatedProfile, error: updateError } = await supabase
        .from('user_profiles')
        .update({ credits: 10 })
        .eq('id', user.id)
        .select()
        .single();

      if (updateError) {
        console.error('❌ 更新失败:', updateError);
      } else {
        console.log('✅ 积分已更新:', updatedProfile);
      }
    } else {
      console.error('❌ 创建失败:', profileError);
    }
  } else {
    console.log('✅ 用户记录创建成功:');
    console.log(JSON.stringify(profile, null, 2));
  }

  // 3. 验证创建结果
  console.log('\n📊 验证结果:');
  const { data: verifyProfile, error: verifyError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('email', 'lixiaofei160@gmail.com')
    .single();

  if (verifyProfile) {
    console.log('✅ 用户积分记录:');
    console.log(`  邮箱: ${verifyProfile.email}`);
    console.log(`  积分: ${verifyProfile.credits}`);
    console.log(`  ID: ${verifyProfile.id}`);
  }
}

// 运行创建
createUserProfile().catch(console.error);