/**
 * 执行数据库迁移脚本
 * 使用 Supabase Admin Client 直接执行 SQL
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// 从环境变量获取 Supabase 配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 错误: 缺少 Supabase 配置')
  console.error('请确保 .env.local 中包含:')
  console.error('  - NEXT_PUBLIC_SUPABASE_URL')
  console.error('  - SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

// 创建 Supabase Admin Client
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function runMigration(migrationFile: string) {
  console.log(`\n🚀 开始执行迁移: ${migrationFile}`)
  console.log('=' .repeat(60))

  try {
    // 读取 SQL 文件
    const migrationPath = path.join(
      process.cwd(),
      'supabase',
      'migrations',
      migrationFile
    )

    if (!fs.existsSync(migrationPath)) {
      throw new Error(`迁移文件不存在: ${migrationPath}`)
    }

    const sql = fs.readFileSync(migrationPath, 'utf-8')

    console.log(`📄 读取 SQL 文件: ${migrationPath}`)
    console.log(`📏 SQL 长度: ${sql.length} 字符\n`)

    // 将 SQL 分割成多个语句（按分号分割，但忽略注释中的分号）
    const statements = sql
      .split(/;\s*\n/)
      .map((stmt) => stmt.trim())
      .filter((stmt) => {
        // 过滤掉空语句和纯注释
        if (!stmt) return false
        const lines = stmt.split('\n').filter((line) => {
          const trimmed = line.trim()
          return trimmed && !trimmed.startsWith('--')
        })
        return lines.length > 0
      })

    console.log(`📊 共 ${statements.length} 个 SQL 语句\n`)

    // 逐个执行 SQL 语句
    let successCount = 0
    let errorCount = 0

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      const preview = statement.substring(0, 100).replace(/\n/g, ' ')

      console.log(`[${i + 1}/${statements.length}] 执行: ${preview}...`)

      try {
        const { error } = await supabase.rpc('exec_sql', { sql_query: statement })

        if (error) {
          // 尝试直接使用 from().select() 执行（某些语句可能不支持 RPC）
          // 对于 DDL 语句，我们需要使用不同的方法
          console.log(`⚠️  RPC 失败，尝试其他方法...`)

          // 使用 PostgreSQL REST API 直接执行
          const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              apikey: supabaseServiceKey,
              Authorization: `Bearer ${supabaseServiceKey}`,
            },
            body: JSON.stringify({ sql_query: statement }),
          })

          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`HTTP ${response.status}: ${errorText}`)
          }

          console.log(`✅ 成功 (使用 HTTP API)`)
          successCount++
        } else {
          console.log(`✅ 成功`)
          successCount++
        }
      } catch (err) {
        console.error(`❌ 失败: ${err instanceof Error ? err.message : String(err)}`)
        errorCount++

        // 如果是关键错误，停止执行
        if (
          err instanceof Error &&
          !err.message.includes('already exists') &&
          !err.message.includes('duplicate')
        ) {
          console.error('\n⚠️  遇到严重错误，停止执行')
          break
        }
      }

      console.log('') // 空行
    }

    console.log('=' .repeat(60))
    console.log(`\n📈 执行结果:`)
    console.log(`  ✅ 成功: ${successCount}`)
    console.log(`  ❌ 失败: ${errorCount}`)
    console.log(`  📊 总计: ${statements.length}`)

    if (errorCount === 0) {
      console.log(`\n🎉 迁移完成！所有语句执行成功！`)
      return true
    } else if (successCount > 0) {
      console.log(`\n⚠️  迁移部分完成，有 ${errorCount} 个错误`)
      return false
    } else {
      console.log(`\n❌ 迁移失败！`)
      return false
    }
  } catch (error) {
    console.error('\n❌ 迁移执行失败:')
    console.error(error)
    return false
  }
}

// 主函数
async function main() {
  const migrationFile = process.argv[2] || '20250127000000_add_action_type.sql'

  console.log('╔═══════════════════════════════════════════════════════════╗')
  console.log('║         Supabase 数据库迁移工具                          ║')
  console.log('╚═══════════════════════════════════════════════════════════╝')
  console.log(`\n📍 Supabase URL: ${supabaseUrl}`)
  console.log(`📦 迁移文件: ${migrationFile}\n`)

  const success = await runMigration(migrationFile)

  process.exit(success ? 0 : 1)
}

main()
