/**
 * AI Coding API - 查询任务状态
 * GET /api/aicoding/status/[taskId]
 */

import { NextRequest, NextResponse } from 'next/server';

const API_BASE = 'https://api.aicoding.sh/v1';

interface TaskStatusResponse {
  id: number;
  model: string;
  account_id: number;
  task_id: string;
  gen_id: string;
  uid: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  message: string;
  progress: {
    progress_pct: number;
  };
  created_at: string;
  updated_at: string;
  result?: {
    output_url: string;
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params;

    // 获取 API Key（从环境变量或请求头）
    const apiKey = process.env.AICODING_API_KEY || request.headers.get('x-api-key');

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API Key is required' },
        { status: 401 }
      );
    }

    if (!taskId) {
      return NextResponse.json(
        { error: 'taskId is required' },
        { status: 400 }
      );
    }

    // 调用 AI Coding API
    const response = await fetch(`${API_BASE}/task/${taskId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    const data: TaskStatusResponse = await response.json();

    if (!response.ok) {
      console.error('AI Coding API Error:', data);
      return NextResponse.json(
        {
          error: 'Failed to get task status',
          details: data
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('Error getting task status:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}