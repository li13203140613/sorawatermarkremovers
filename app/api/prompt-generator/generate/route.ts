/**
 * Sora 提示词生成 API
 * POST /api/prompt-generator/generate
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateSoraPrompt, type SoraPromptInput } from '@/lib/prompt-generator/deepseek';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 验证必需字段
    if (!body.scene) {
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

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('[Prompt Generator API] Error:', error);

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
