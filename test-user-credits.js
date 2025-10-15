const { createClient } = require('@supabase/supabase-js');

// Supabase 配置
const supabaseUrl = 'https://zjefhzapfbouslkgllah.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqZWZoemFwZmJvdXNsa2dsbGFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5MTM1MjEsImV4cCI6MjA3NTQ4OTUyMX0.49ix1bGrSrTqsS5qDXWgj6OOk-bj5UOaDTkNazqCdko';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUserCredits() {
  console.log('🔍 查询用户积分...\n');

  // 1. 查询所有用户的积分
  const { data: allProfiles, error: allError } = await supabase
    .from('user_profiles')
    .select('id, email, credits, created_at')
    .order('created_at', { ascending: false });

  if (allError) {
    console.error('❌ 查询失败:', allError);
    return;
  }

  console.log('📊 所有用户积分情况:');
  console.log('================================');

  if (!allProfiles || allProfiles.length === 0) {
    console.log('⚠️ 数据库中没有用户记录！');
  } else {
    allProfiles.forEach(profile => {
      console.log(`📧 邮箱: ${profile.email}`);
      console.log(`💰 积分: ${profile.credits}`);
      console.log(`🆔 ID: ${profile.id}`);
      console.log(`📅 创建时间: ${profile.created_at}`);
      console.log('---');
    });
  }

  // 2. 专门查询 lixiaofei160@gmail.com
  console.log('\n🎯 查询特定用户: lixiaofei160@gmail.com');
  console.log('================================');

  const { data: specificUser, error: specificError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('email', 'lixiaofei160@gmail.com')
    .single();

  if (specificError) {
    if (specificError.code === 'PGRST116') {
      console.log('⚠️ 用户 lixiaofei160@gmail.com 在数据库中不存在！');
      console.log('📝 需要创建用户记录');
    } else {
      console.error('❌ 查询失败:', specificError);
    }
  } else if (specificUser) {
    console.log('✅ 找到用户:');
    console.log(JSON.stringify(specificUser, null, 2));
  }
}

// 运行查询
checkUserCredits().catch(console.error);