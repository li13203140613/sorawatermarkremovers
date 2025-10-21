import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { User } from '@supabase/supabase-js'

/**
 * CORS 配置
 */
const ALLOWED_ORIGINS = [
  'https://sora.com',
  'chrome-extension://njdkfjnpicmacjbflkcbbohkhmefffcp',
  process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
]

/**
 * 创建带 CORS 头的响应
 */
export function corsResponse(
  data: unknown,
  status = 200,
  origin?: string | null
): NextResponse {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }

  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin
    headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    headers['Access-Control-Max-Age'] = '86400'
  }

  return NextResponse.json(data, { status, headers })
}

/**
 * 处理 CORS 预检请求
 */
export function handleCorsPreflightRequest(request: NextRequest): NextResponse | null {
  const origin = request.headers.get('origin')

  if (request.method === 'OPTIONS') {
    const headers: HeadersInit = {}

    if (origin && ALLOWED_ORIGINS.includes(origin)) {
      headers['Access-Control-Allow-Origin'] = origin
      headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
      headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
      headers['Access-Control-Max-Age'] = '86400'
    }

    return new NextResponse(null, { status: 204, headers })
  }

  return null
}

/**
 * 认证检查结果
 */
export interface AuthCheckResult {
  user: User | null
  error: NextResponse | null
}

/**
 * 统一的用户认证检查
 * 支持 Cookie 认证和 Bearer Token 认证
 */
export async function requireAuth(request: NextRequest): Promise<AuthCheckResult> {
  const origin = request.headers.get('origin')
  const authHeader = request.headers.get('authorization')

  // Bearer Token 认证（Chrome 扩展）
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7)
    const supabase = await createClient()

    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      return {
        user: null,
        error: corsResponse({ error: 'Invalid token' }, 401, origin),
      }
    }

    return { user, error: null }
  }

  // Cookie 认证（Web）
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return {
      user: null,
      error: corsResponse({ error: 'Unauthorized' }, 401, origin),
    }
  }

  return { user, error: null }
}

/**
 * API 错误响应
 */
export interface ApiErrorOptions {
  message: string
  status?: number
  origin?: string | null
  details?: unknown
}

export function apiError(options: ApiErrorOptions): NextResponse {
  const { message, status = 400, origin, details } = options

  const errorData: { error: string; details?: unknown } = {
    error: message,
  }

  if (details !== undefined) {
    errorData.details = details
  }

  return corsResponse(errorData, status, origin)
}

/**
 * API 成功响应
 */
export interface ApiSuccessOptions<T = unknown> {
  data: T
  status?: number
  origin?: string | null
}

export function apiSuccess<T = unknown>(options: ApiSuccessOptions<T>): NextResponse {
  const { data, status = 200, origin } = options

  return corsResponse(data, status, origin)
}

/**
 * 客户端 API 调用工具
 */
export interface FetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  headers?: HeadersInit
  body?: unknown
  timeout?: number
}

export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
}

/**
 * 统一的客户端 API 调用函数
 */
export async function apiFetch<T = unknown>(
  url: string,
  options: FetchOptions = {}
): Promise<ApiResponse<T>> {
  const { method = 'GET', headers = {}, body, timeout = 30000 } = options

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    const data = await response.json()

    if (!response.ok) {
      return { error: data.error || `HTTP ${response.status}` }
    }

    return { data }
  } catch (err) {
    if (err instanceof Error) {
      if (err.name === 'AbortError') {
        return { error: 'Request timeout' }
      }
      return { error: err.message }
    }
    return { error: String(err) }
  }
}
