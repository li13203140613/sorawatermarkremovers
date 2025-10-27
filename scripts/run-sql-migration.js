#!/usr/bin/env node
/**
 * 直接执行 SQL 迁移 - 使用 Supabase Management API
 */

const fs = require('fs')
const path = require('path')
const https = require('https')
const http = require('http')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceKey) {
  console.error('❌ 错误: 缺少环境变量')
  process.exit(1)
}

// 从 Supabase URL 提取项目 ref
const projectRef = supabaseUrl.match(/https:\/\/(.+?)\.supabase\.co/)[1]

async function executeSQL(sql) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ query: sql })

    const options = {
      hostname: `${projectRef}.supabase.co`,
      path: '/rest/v1/rpc/exec',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
      },
    }

    const req = https.request(options, (res) => {
      let data = ''

      res.on('data', (chunk) => {
        data += chunk
      })

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ success: true, data })
        } else {
          resolve({ success: false, error: data, statusCode: res.statusCode })
        }
      })
    })

    req.on('error', (error) => {
      reject(error)
    })

    req.write(postData)
    req.end()
  })
}

async function executeMigrationStatements(statements) {
  let successCount = 0
  let errorCount = 0

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i]
    const preview = statement.substring(0, 80).replace(/\n/g, ' ')

    console.log(`\n[${i + 1}/${statements.length}] 执行:`)
    console.log(`  ${preview}...`)

    try {
      const result = await executeSQL(statement)

      if (result.success) {
        console.log('  ✅ 成功')
        successCount++
      } else {
        console.log(`  ❌ 失败 (状态码: ${result.statusCode})`)
        console.log(`  错误: ${result.error}`)
        errorCount++

        // 如果错误是"已存在"，继续
        if (
          result.error &&
          (result.error.includes('already exists') ||
            result.error.includes('duplicate'))
        ) {
          console.log('  ℹ️  对象已存在，继续执行')
        }
      }
    } catch (error) {
      console.log(`  ❌ 异常: ${error.message}`)
      errorCount++
    }
  }

  return { successCount, errorCount }
}

async function main() {
  const migrationFile =
    process.argv[2] || '20250127000000_add_action_type.sql'

  console.log('╔═══════════════════════════════════════════════════════════╗')
  console.log('║         Supabase SQL 迁移执行工具                        ║')
  console.log('╚═══════════════════════════════════════════════════════════╝\n')

  // 读取 SQL 文件
  const migrationPath = path.join(
    __dirname,
    '..',
    'supabase',
    'migrations',
    migrationFile
  )

  if (!fs.existsSync(migrationPath)) {
    console.error(`❌ 找不到迁移文件: ${migrationPath}`)
    process.exit(1)
  }

  const sql = fs.readFileSync(migrationPath, 'utf-8')

  console.log(`📄 迁移文件: ${migrationFile}`)
  console.log(`📏 SQL 长度: ${sql.length} 字符`)
  console.log(`🔗 Supabase: ${supabaseUrl}`)
  console.log(`📦 Project: ${projectRef}\n`)

  // 分割 SQL 语句
  const statements = sql
    .split(/;\s*\n/)
    .map((s) => s.trim())
    .filter((s) => {
      if (!s) return false
      const lines = s.split('\n').filter((line) => {
        const trimmed = line.trim()
        return trimmed && !trimmed.startsWith('--')
      })
      return lines.length > 0
    })
    .map((s) => s + ';') // 添加回分号

  console.log(`📊 共 ${statements.length} 个 SQL 语句`)
  console.log('=' .repeat(60))

  const { successCount, errorCount } = await executeMigrationStatements(
    statements
  )

  console.log('\n' + '='.repeat(60))
  console.log('📈 执行结果:')
  console.log(`  ✅ 成功: ${successCount}`)
  console.log(`  ❌ 失败: ${errorCount}`)
  console.log(`  📊 总计: ${statements.length}`)

  if (errorCount === 0) {
    console.log('\n🎉 迁移完成！所有语句执行成功！\n')
  } else {
    console.log('\n⚠️  迁移完成，但有部分错误。\n')
    console.log('💡 如果错误是"function exec does not exist"，')
    console.log('   请使用 Supabase Dashboard 手动执行 SQL：')
    console.log('   https://supabase.com/dashboard/project/' + projectRef + '/sql/new\n')
  }
}

main().catch((error) => {
  console.error('❌ 执行失败:', error)
  process.exit(1)
})
