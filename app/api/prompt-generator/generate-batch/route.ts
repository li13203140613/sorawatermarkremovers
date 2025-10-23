import { NextRequest, NextResponse } from 'next/server';
import { generateSoraPrompt, SoraPromptInput } from '@/lib/prompt-generator/deepseek';
import { getCategoryByKey } from '@/lib/prompt-generator/categories';

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await request.json();

    // 🎬 日志：API 请求开始
    console.log('\n' + '═'.repeat(60));
    console.log('🎬 [批量生成 API] 收到请求');
    console.log('═'.repeat(60));
    console.log('📝 请求参数:');
    console.log(JSON.stringify(body, null, 2));
    console.log('═'.repeat(60) + '\n');

    // 验证必填字段
    if (!body.scene) {
      console.error('❌ 验证失败: 缺少场景描述');
      return NextResponse.json(
        { error: 'Scene description is required' },
        { status: 400 }
      );
    }

    // 验证生成数量
    const count = body.count || 1;
    if (![1, 3, 5].includes(count)) {
      console.error(`❌ 验证失败: 无效的数量 ${count}`);
      return NextResponse.json(
        { error: 'Count must be 1, 3, or 5' },
        { status: 400 }
      );
    }

    // 获取分类配置
    let categoryStyle = '';
    let categoryMood = '';
    if (body.category) {
      const categoryConfig = getCategoryByKey(body.category);
      if (categoryConfig) {
        categoryStyle = categoryConfig.style;
        categoryMood = categoryConfig.defaultMood;
        console.log(`✅ 使用分类: ${categoryConfig.label} (${body.category})`);
        console.log(`   风格: ${categoryStyle}`);
        console.log(`   氛围: ${categoryMood}\n`);
      }
    }

    // 构建基础输入参数
    const baseInput: SoraPromptInput = {
      scene: body.scene,
      style: body.style || categoryStyle || undefined,
      duration: body.duration,
      mood: body.mood || categoryMood || undefined,
      language: body.language || 'zh'
    };

    // 温度值设置（用于生成多样性）
    const temperatures = count === 1
      ? [0.8]
      : count === 3
        ? [0.7, 0.8, 0.9]
        : [0.7, 0.75, 0.8, 0.85, 0.9];

    console.log(`🎲 温度设置: [${temperatures.slice(0, count).join(', ')}]`);
    console.log(`🚀 开始生成 ${count} 个提示词...\n`);

    // 批量生成提示词
    const generatePromises = temperatures.slice(0, count).map(async (temperature, index) => {
      console.log(`⏳ [提示词 #${index + 1}] 开始生成 (温度: ${temperature})...`);

      try {
        const result = await generateSoraPrompt({
          ...baseInput,
          temperature
        });

        console.log(`✅ [提示词 #${index + 1}] 生成成功! (${result.usage.totalTokens} tokens, ¥${result.cost.totalCost.toFixed(6)})`);

        return {
          success: true,
          index: index + 1,
          temperature,
          ...result
        };
      } catch (error: any) {
        console.error(`❌ [提示词 #${index + 1}] 生成失败:`, error.message);

        return {
          success: false,
          index: index + 1,
          temperature,
          error: error.message || 'Generation failed',
          prompt: '',
          usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
          cost: { inputCost: 0, outputCost: 0, totalCost: 0 }
        };
      }
    });

    // 并发执行所有生成请求（最多同时3个）
    const results = [];
    for (let i = 0; i < generatePromises.length; i += 3) {
      const batch = generatePromises.slice(i, i + 3);
      const batchResults = await Promise.all(batch);
      results.push(...batchResults);
    }

    // 计算总成本
    const totalCost = results.reduce((sum, r) => sum + (r.cost?.totalCost || 0), 0);
    const totalTokens = results.reduce((sum, r) => sum + (r.usage?.totalTokens || 0), 0);
    const successCount = results.filter(r => r.success).length;
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    // 📊 日志：汇总结果
    console.log('\n' + '═'.repeat(60));
    console.log('📊 [批量生成 API] 完成汇总');
    console.log('═'.repeat(60));
    console.log(`✨ 总数: ${count} 个`);
    console.log(`✅ 成功: ${successCount} 个`);
    console.log(`❌ 失败: ${count - successCount} 个`);
    console.log(`📊 总Token: ${totalTokens}`);
    console.log(`💰 总成本: ¥${totalCost.toFixed(6)} (${(totalCost * 100).toFixed(4)}分)`);
    console.log(`💰 平均成本: ¥${(totalCost / count).toFixed(6)}/个`);
    console.log(`⏱️ 总耗时: ${duration}秒`);
    console.log('═'.repeat(60) + '\n');

    return NextResponse.json({
      success: true,
      data: {
        prompts: results,
        summary: {
          total: count,
          successful: successCount,
          failed: count - successCount,
          totalTokens,
          totalCost,
          averageCost: totalCost / count
        }
      }
    });

  } catch (error: any) {
    console.error('\n' + '═'.repeat(60));
    console.error('❌ [批量生成 API] 发生错误');
    console.error('═'.repeat(60));
    console.error('错误信息:', error);
    console.error('错误堆栈:', error.stack);
    console.error('═'.repeat(60) + '\n');

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Internal server error'
      },
      { status: 500 }
    );
  }
}
