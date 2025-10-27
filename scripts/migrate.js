/**
 * 执行数据库迁移
 * 使用 Supabase SQL API 直接执行迁移脚本
 */

const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env.local' })

async function executeMigration(migrationFile) {
  console.log('\n🚀 开始执行数据库迁移')
  console.log('='.repeat(60))

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceKey) {
    console.error('❌ 错误: 缺少环境变量')
    console.error('需要: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  // 读取 SQL 文件
  const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', migrationFile)

  if (!fs.existsSync(migrationPath)) {
    console.error(`❌ 错误: 找不到迁移文件: ${migrationPath}`)
    process.exit(1)
  }

  const sql = fs.readFileSync(migrationPath, 'utf-8')
  console.log(`📄 读取迁移文件: ${migrationFile}`)
  console.log(`📏 SQL 长度: ${sql.length} 字符\n`)

  // 分割 SQL 语句
  const statements = sql
    .split(/;\s*\n/)
    .map(s => s.trim())
    .filter(s => {
      if (!s) return false
      const lines = s.split('\n').filter(line => {
        const trimmed = line.trim()
        return trimmed && !trimmed.startsWith('--')
      })
      return lines.length > 0
    })

  console.log(`📊 共 ${statements.length} 个 SQL 语句\n`)

  // 使用 Supabase REST API 执行 SQL
  let successCount = 0
  let errorCount = 0

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i] + ';' // 添加回分号
    const preview = statement.substring(0, 80).replace(/\n/g, ' ')

    console.log(`\n[${i + 1}/${statements.length}] 执行:`)
    console.log(`  ${preview}...`)

    try {
      // 使用 PostgREST 的查询功能
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          query: statement
        })
      })

      if (response.ok) {
        console.log('  ✅ 成功')
        successCount++
      } else {
        const errorText = await response.text()
        console.log(`  ❌ 失败: ${errorText}`)
        errorCount++

        // 如果错误信息包含 "already exists"，则继续
        if (errorText.includes('already exists') || errorText.includes('duplicate')) {
          console.log('  ℹ️  对象已存在，继续执行')
        } else {
          console.log('  ⚠️  严重错误，继续尝试其他语句')
        }
      }
    } catch (error) {
      console.log(`  ❌ 异常: ${error.message}`)
      errorCount++
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('📈 执行结果:')
  console.log(`  ✅ 成功: ${successCount}`)
  console.log(`  ❌ 失败: ${errorCount}`)
  console.log(`  📊 总计: ${statements.length}`)

  if (errorCount === 0) {
    console.log('\n🎉 迁移完成！所有语句执行成功！\n')
  } else {
    console.log('\n⚠️  迁移完成，但有部分错误。请检查上面的日志。\n')
  }
}

// 执行迁移
const migrationFile = process.argv[2] || '20250127000000_add_action_type.sql'

console.log('╔═══════════════════════════════════════════════════════════╗')
console.log('║         Supabase 数据库迁移工具 (Direct SQL)             ║')
console.log('╚═══════════════════════════════════════════════════════════╝')

executeMigration(migrationFile)
  .then(() => {
    console.log('✅ 迁移脚本执行完毕')
  })
  .catch(error => {
    console.error('❌ 迁移失败:', error)
    process.exit(1)
  })
