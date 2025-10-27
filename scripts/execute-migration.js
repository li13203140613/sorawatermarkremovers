#!/usr/bin/env node
/**
 * 执行数据库迁移 - 使用原生 PostgreSQL 连接
 * 使用方法: node scripts/execute-migration.js [migration-file.sql]
 */

const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceKey) {
  console.error('❌ 错误: 缺少环境变量')
  console.error('需要: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

// 创建 Supabase 客户端
const supabase = createClient(supabaseUrl, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function executeSql(sql) {
  try {
    // 方法1: 尝试使用 from().select() 执行原始查询
    const { data, error } = await supabase.rpc('exec', { sql_query: sql })

    if (!error) {
      return { success: true, data }
    }

    // 方法2: 对于某些语句，可能需要使用不同的方法
    // 这里我们返回错误，让外部处理
    return { success: false, error: error.message }
  } catch (err) {
    return { success: false, error: err.message }
  }
}

async function main() {
  const migrationFile = process.argv[2] || '20250127000000_add_action_type.sql'

  console.log('╔═══════════════════════════════════════════════════════════╗')
  console.log('║         Supabase 数据库迁移工具                          ║')
  console.log('╚═══════════════════════════════════════════════════════════╝\n')

  // 读取 SQL 文件
  const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', migrationFile)

  if (!fs.existsSync(migrationPath)) {
    console.error(`❌ 找不到迁移文件: ${migrationPath}`)
    process.exit(1)
  }

  const sql = fs.readFileSync(migrationPath, 'utf-8')

  console.log(`📄 迁移文件: ${migrationFile}`)
  console.log(`📏 SQL 长度: ${sql.length} 字符`)
  console.log(`🔗 Supabase: ${supabaseUrl}\n`)

  console.log('=' .repeat(60))
  console.log('⚠️  重要提示:')
  console.log('=' .repeat(60))
  console.log('\n由于 Supabase JavaScript SDK 的限制，建议使用以下方法之一：\n')
  console.log('方法1️⃣  - 使用 Supabase Dashboard (推荐)')
  console.log('  1. 打开: https://supabase.com/dashboard/project/zjefhzapfbouslkgllah/sql/new')
  console.log('  2. 复制下面的 SQL 并粘贴到 SQL Editor')
  console.log('  3. 点击 "Run" 按钮执行\n')

  console.log('方法2️⃣  - 使用 Supabase CLI')
  console.log('  运行: supabase db push --db-url "YOUR_DATABASE_URL"\n')

  console.log('方法3️⃣  - 手动复制 SQL')
  console.log('  SQL 文件位置: ' + migrationPath + '\n')

  console.log('=' .repeat(60))
  console.log('📋 SQL 内容:')
  console.log('=' .repeat(60))
  console.log(sql)
  console.log('=' .repeat(60))

  console.log('\n✅ 请在 Supabase Dashboard 的 SQL Editor 中执行上述 SQL\n')
  console.log('📍 直达链接:')
  console.log('   https://supabase.com/dashboard/project/zjefhzapfbouslkgllah/sql/new\n')
}

main().catch(console.error)
