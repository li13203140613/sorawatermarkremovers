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

    // 验证生成数量（循环次数，1-5次）
    const count = body.count || 1;
    if (count < 1 || count > 5) {
      console.error(`❌ 验证失败: 无效的数量 ${count}，必须在 1-5 之间`);
      return NextResponse.json(
        { error: 'Count must be between 1 and 5' },
        { status: 400 }
      );
    }
    console.log(`✅ 生成数量: ${count} 个（将调用 ${count} 次 DeepSeek API）\n`);

    // 使用前端传来的风格名称（优先）或从配置获取
    let styleName = body.style || '';

    if (!styleName && body.category) {
      const categoryConfig = getCategoryByKey(body.category);
      if (categoryConfig) {
        styleName = categoryConfig.label;
      }
    }

    if (styleName) {
      console.log(`✅ 使用风格: ${styleName} (${body.category || '未指定'})\n`);
    }

    // 构建结构化的prompt
    const structuredPrompt = styleName
      ? `风格：${styleName}\n写入提示词是：${body.scene}`
      : `写入提示词是：${body.scene}`;

    // 构建基础输入参数
    const baseInput: SoraPromptInput = {
      scene: structuredPrompt,
      style: undefined,
      duration: body.duration,
      mood: undefined,
      language: body.language || 'zh'
    };

    // 温度值设置（用于生成多样性）
    // 为每次生成设置不同的温度，增加结果多样性
    const baseTemperature = body.temperature || 0.8;
    const temperatures: number[] = [];

    for (let i = 0; i < count; i++) {
      // 在基础温度附近浮动 ±0.1
      const variation = (i - Math.floor(count / 2)) * 0.05;
      temperatures.push(Math.max(0.1, Math.min(1.0, baseTemperature + variation)));
    }

    console.log(`🎲 温度设置: [${temperatures.join(', ')}]`);

    // 📤 显示发送给DeepSeek的完整内容
    console.log('\n📤 发送给DeepSeek的完整内容:');
    console.log('─'.repeat(50));
    console.log(structuredPrompt);
    console.log('─'.repeat(50));

    console.log(`\n🚀 开始生成 ${count} 个提示词（每次独立调用 DeepSeek API）...\n`);

    // 批量生成提示词 - 每次独立调用
    const generatePromises = temperatures.map(async (temperature, index) => {
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
