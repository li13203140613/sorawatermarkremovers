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
  creditsToConsume: number; // 每个视频的积分
  count?: number; // 生成数量（1 或 6），默认为 1
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
    console.log('[AI Coding] 📥 收到创建任务请求');

    // 1. 用户认证
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('[AI Coding] ❌ 用户未登录');
      return NextResponse.json(
        { error: '请先登录后再使用' },
        { status: 401 }
      );
    }

    console.log('[AI Coding] ✅ 用户认证成功');
    console.log('[AI Coding] 用户 ID:', user.id);
    console.log('[AI Coding] 用户 Email:', user.email);

    // 2. 解析请求参数
    const body: CreateTaskRequest = await request.json();
    const videoCount = body.count || 1; // 默认生成 1 个视频
    const totalCredits = body.creditsToConsume * videoCount; // 总共需要的积分

    console.log('[AI Coding] 📋 收到的请求参数:', {
      model: body.model,
      promptLength: body.prompt?.length || 0,
      hasImages: !!(body.images && body.images.length > 0),
      imagesCount: body.images?.length || 0,
      creditsPerVideo: body.creditsToConsume,
      videoCount: videoCount,
      totalCredits: totalCredits
    });

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
    if (profile.credits < totalCredits) {
      console.error('[AI Coding] ❌ 积分不足');
      console.error('[AI Coding] 当前积分:', profile.credits);
      console.error('[AI Coding] 需要积分:', totalCredits);
      return NextResponse.json(
        { error: `积分不足，生成 ${videoCount} 个视频需要 ${totalCredits} 积分，当前剩余 ${profile.credits} 积分` },
        { status: 403 }
      );
    }

    console.log('[AI Coding] ✅ 积分验证通过');
    console.log('[AI Coding] 当前积分:', profile.credits);
    console.log('[AI Coding] 将消耗:', totalCredits);
    console.log('[AI Coding] 生成数量:', videoCount);

    // 5. 调用 AI Coding API（多次调用）
    const apiKey = process.env.AICODING_API_KEY;
    if (!apiKey) {
      console.error('[AI Coding] ❌ API 密钥未配置');
      return NextResponse.json(
        { error: 'API 密钥未配置' },
        { status: 500 }
      );
    }

    const requestBody = {
      model: body.model,
      input: {
        prompt: body.prompt,
        ...(body.images && body.images.length > 0 && { images: body.images })
      }
    };

    console.log('[AI Coding] 🚀 准备调用 AI Coding API');
    console.log('[AI Coding] API URL:', `${API_BASE}/task/create`);
    console.log('[AI Coding] 生成数量:', videoCount);
    console.log('[AI Coding] 请求体:', JSON.stringify(requestBody, null, 2));

    // 循环调用 API，生成 videoCount 个视频
    const results: CreateTaskResponse[] = [];
    const maxRetries = 2;

    for (let i = 0; i < videoCount; i++) {
      console.log(`[AI Coding] 🎬 开始生成第 ${i + 1}/${videoCount} 个视频`);

      let response: Response | undefined;
      let retryCount = 0;

      while (retryCount <= maxRetries) {
        try {
          console.log(`[AI Coding] 🔄 尝试调用 API (第 ${retryCount + 1} 次)`);

          response = await fetch(`${API_BASE}/task/create`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(requestBody),
            // 添加 30 秒超时
            signal: AbortSignal.timeout(30000)
          });

          console.log('[AI Coding] 📡 收到 AI Coding API 响应');
          console.log('[AI Coding] 响应状态码:', response.status);
          console.log('[AI Coding] 响应状态文本:', response.statusText);
          break; // 成功则跳出循环

        } catch (fetchError) {
          console.error(`[AI Coding] ⚠️ API 调用失败 (尝试 ${retryCount + 1}/${maxRetries + 1}):`, fetchError);

          if (retryCount >= maxRetries) {
            // 已达最大重试次数
            console.error('[AI Coding] ❌ 达到最大重试次数，放弃请求');
            const errorMessage = fetchError instanceof Error ? fetchError.message : '未知错误';

            if (errorMessage.includes('ECONNRESET') || errorMessage.includes('network')) {
              return NextResponse.json(
                { error: '无法连接到 AI Coding 服务器，请检查网络连接或稍后再试' },
                { status: 503 }
              );
            }

            return NextResponse.json(
              { error: `API 调用失败: ${errorMessage}` },
              { status: 500 }
            );
          }

          retryCount++;
          // 等待 1 秒后重试
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      if (!response) {
        console.error('[AI Coding] ❌ 无法获取 API 响应');
        return NextResponse.json(
          { error: 'API 调用失败，无法获取响应' },
          { status: 500 }
        );
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('[AI Coding] ❌ AI Coding API 调用失败');
        console.error('[AI Coding] 状态码:', response.status);
        console.error('[AI Coding] 错误详情:', JSON.stringify(errorData, null, 2));
        console.error('[AI Coding] 发送的请求体:', JSON.stringify(requestBody, null, 2));
        return NextResponse.json(
          { error: errorData.error?.message || errorData.message || 'AI Coding API 调用失败' },
          { status: response.status }
        );
      }

      const data: CreateTaskResponse = await response.json();
      console.log(`[AI Coding] ✅ 第 ${i + 1} 个视频任务创建成功`);
      console.log('[AI Coding] 任务 ID:', data.task_id || data.id);
      console.log('[AI Coding] 任务状态:', data.status);

      results.push(data);
    }

    console.log(`[AI Coding] 🎉 所有视频任务创建完成，共 ${videoCount} 个`);

    // 6. API 调用成功，扣除积分
    console.log('[AI Coding] 💳 开始扣除积分');
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ credits: profile.credits - totalCredits })
      .eq('id', user.id);

    if (updateError) {
      console.error('[AI Coding] ❌ 扣除积分失败:', updateError);
      // 任务已创建，但积分扣除失败 - 记录错误
    } else {
      console.log('[AI Coding] ✅ 积分扣除成功');
      console.log('[AI Coding] 剩余积分:', profile.credits - totalCredits);
    }

    // 7. 记录操作日志
    console.log('[AI Coding] 📝 记录操作日志');
    const taskIds = results.map(r => r.id || r.task_id).join(',');
    await supabase.from('usage_logs').insert({
      user_id: user.id,
      user_email: user.email,
      original_url: `aicoding:${body.model}:${body.prompt.substring(0, 50)}`,
      processed_url: `tasks:${taskIds}`,
      credits_used: totalCredits,
      credits_remaining: profile.credits - totalCredits,
      status: 'success',
      platform: 'aicoding',
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown'
    });

    // 8. 返回成功结果（返回所有任务）
    console.log('[AI Coding] 🎉 请求处理完成，返回成功响应');
    return NextResponse.json({
      success: true,
      tasks: results,
      count: videoCount
    });

  } catch (error) {
    console.error('[AI Coding] ❌ 服务器错误:', error);
    console.error('[AI Coding] 错误堆栈:', error instanceof Error ? error.stack : 'N/A');
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '服务器错误' },
      { status: 500 }
    );
  }
}