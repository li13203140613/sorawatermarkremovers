/**
 * Sora 提示词生成 API
 * POST /api/prompt-generator/generate
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateSoraPrompt, type SoraPromptInput } from '@/lib/prompt-generator/deepseek';
import { createUsageLog, getClientIp, getUserAgent } from '@/lib/admin/logger';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  let userId: string | null = null;
  let userEmail: string | null = null;

  try {
    // 获取用户信息（如果已登录）
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      userId = user.id;
      userEmail = user.email || null;
    }

    const body = await request.json();

    // 验证必需字段
    if (!body.scene) {
      // 记录失败日志
      await createUsageLog({
        userId,
        userEmail,
        originalUrl: 'prompt_generation',
        status: 'failed',
        errorMessage: 'Scene description is required',
        ipAddress: getClientIp(request),
        userAgent: getUserAgent(request),
        actionType: 'prompt_generation',
        creditsUsed: 0,
      });

      return NextResponse.json(
        { error: 'Scene description is required' },
        { status: 400 }
      );
    }

    // 构建输入参数
    const input: SoraPromptInput = {
      scene: body.scene,
      style: body.style,
      duration: body.duration,
      mood: body.mood,
      language: body.language || 'en'
    };

    // 生成提示词
    const result = await generateSoraPrompt(input);

    // 记录成功日志
    await createUsageLog({
      userId,
      userEmail,
      originalUrl: body.scene?.substring(0, 200) || 'prompt_generation', // 保存用户输入的场景描述（限制长度）
      processedUrl: result.prompt?.substring(0, 500) || null, // 保存生成的提示词（限制长度）
      status: 'success',
      ipAddress: getClientIp(request),
      userAgent: getUserAgent(request),
      actionType: 'prompt_generation',
      creditsUsed: 0, // 提示词生成不消耗积分
    });

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('[Prompt Generator API] Error:', error);

    // 记录失败日志
    await createUsageLog({
      userId,
      userEmail,
      originalUrl: 'prompt_generation',
      status: 'failed',
      errorMessage: error instanceof Error ? error.message : 'Failed to generate prompt',
      ipAddress: getClientIp(request),
      userAgent: getUserAgent(request),
      actionType: 'prompt_generation',
      creditsUsed: 0,
    });

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate prompt'
      },
      { status: 500 }
    );
  }
}

// 支持 OPTIONS 请求（CORS）
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
