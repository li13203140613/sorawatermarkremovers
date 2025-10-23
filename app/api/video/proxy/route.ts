/**
 * 视频代理 API - 添加强缓存头,利用 Vercel CDN 加速
 * GET /api/video/proxy?url=<video_url>
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCacheControlHeader, getCDNCacheControlHeader } from '@/lib/video/cache-config';

// 注意: Edge Runtime 最大响应 4MB,视频通常超过此限制
// 因此使用 Node.js Runtime 以支持大文件
// export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const videoUrl = request.nextUrl.searchParams.get('url');

    if (!videoUrl) {
      return NextResponse.json(
        { error: 'Missing url parameter' },
        { status: 400 }
      );
    }

    // 验证 URL 格式
    try {
      new URL(videoUrl);
    } catch {
      return NextResponse.json(
        { error: 'Invalid url format' },
        { status: 400 }
      );
    }

    console.log('[Video Proxy] Fetching video:', videoUrl);

    // 从源服务器获取视频
    const response = await fetch(videoUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'video/*'
      }
    });

    if (!response.ok) {
      console.error('[Video Proxy] Fetch failed:', response.status, response.statusText);
      return NextResponse.json(
        { error: `Failed to fetch video: ${response.statusText}` },
        { status: response.status }
      );
    }

    // 获取视频内容
    const videoBlob = await response.blob();
    console.log('[Video Proxy] Video fetched successfully, size:', videoBlob.size);

    // 返回视频 + 强缓存头
    return new NextResponse(videoBlob, {
      status: 200,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'video/mp4',
        'Content-Length': videoBlob.size.toString(),

        // 🚀 强缓存头 - 浏览器缓存1年
        'Cache-Control': getCacheControlHeader(),

        // 🚀 Vercel CDN 缓存头 - CDN 缓存1年
        'CDN-Cache-Control': getCDNCacheControlHeader(),

        // 🚀 允许跨域访问
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Range',

        // 🚀 支持断点续传
        'Accept-Ranges': 'bytes',

        // 其他优化头
        'X-Content-Type-Options': 'nosniff',
        'X-Cache-Status': 'MISS' // 首次访问为 MISS,后续为 HIT
      }
    });

  } catch (error) {
    console.error('[Video Proxy] Error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// 处理 OPTIONS 预检请求
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Range'
    }
  });
}
