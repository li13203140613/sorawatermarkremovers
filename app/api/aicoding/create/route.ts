/**
 * AI Coding API - 创建任务（带积分扣除）
 * POST /api/aicoding/create
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const API_BASE = 'https://api.aicoding.sh/v1';

interface CreateTaskRequest {
  model: 'sora2' | 'sora2-unwm';
  prompt: string;
  images?: string[];
  creditsToConsume: number;
}

interface CreateTaskResponse {
  id: string;
  model: string;
  account_id: number;
  task_id: string;
  gen_id: string;
  uid: number;
  status: string;
  message: string;
  progress: {
    progress_pct: number;
  };
  created_at: string;
  updated_at: string;
}

export async function POST(request: NextRequest) {
  try {
    // 1. 用户认证
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: '请先登录后再使用' },
        { status: 401 }
      );
    }

    // 2. 解析请求参数
    const body: CreateTaskRequest = await request.json();

    if (!body.model || !body.prompt) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    if (!body.creditsToConsume || body.creditsToConsume <= 0) {
      return NextResponse.json(
        { error: '无效的积分数量' },
        { status: 400 }
      );
    }

    // 3. 查询用户当前积分
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('credits')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: '无法获取用户积分信息' },
        { status: 500 }
      );
    }

    // 4. 验证积分是否充足
    if (profile.credits < body.creditsToConsume) {
      return NextResponse.json(
        { error: `积分不足，当前剩余 ${profile.credits} 积分，需要 ${body.creditsToConsume} 积分` },
        { status: 403 }
      );
    }

    // 5. 调用 AI Coding API
    const apiKey = process.env.AICODING_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API 密钥未配置' },
        { status: 500 }
      );
    }

    const requestBody = {
      model: body.model,
      prompt: body.prompt,
      ...(body.images && body.images.length > 0 && { images: body.images })
    };

    const response = await fetch(`${API_BASE}/task/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('AI Coding API 错误:', errorData);
      return NextResponse.json(
        { error: errorData.message || 'AI Coding API 调用失败' },
        { status: response.status }
      );
    }

    const data: CreateTaskResponse = await response.json();

    // 6. API 调用成功，扣除积分
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ credits: profile.credits - body.creditsToConsume })
      .eq('id', user.id);

    if (updateError) {
      console.error('扣除积分失败:', updateError);
      // 任务已创建，但积分扣除失败 - 记录错误
    }

    // 7. 记录操作日志
    await supabase.from('usage_logs').insert({
      user_id: user.id,
      user_email: user.email,
      original_url: `aicoding:${body.model}:${body.prompt.substring(0, 50)}`,
      processed_url: `task:${data.id || data.task_id}`,
      credits_used: body.creditsToConsume,
      credits_remaining: profile.credits - body.creditsToConsume,
      status: 'success',
      platform: 'aicoding',
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown'
    });

    // 8. 返回成功结果
    return NextResponse.json({
      success: true,
      ...data
    });

  } catch (error) {
    console.error('API 错误:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '服务器错误' },
      { status: 500 }
    );
  }
}