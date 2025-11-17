/**
 * CSRF (Cross-Site Request Forgery) 防护工具
 *
 * 策略：
 * 1. Origin/Referer 头验证
 * 2. 允许白名单域名（主域/本地/扩展）
 * 3. 预留 Token 验证接口
 */

import { NextRequest } from 'next/server'

const PRIMARY_ORIGIN = process.env.NEXT_PUBLIC_APP_URL || 'https://www.sorawatermarkremovers.com'

const ALLOWED_ORIGINS = [
  PRIMARY_ORIGIN,
  PRIMARY_ORIGIN.replace('www.', ''), // 裸域
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  ...(process.env.CHROME_EXTENSION_ID
    ? [`chrome-extension://${process.env.CHROME_EXTENSION_ID}`]
    : []
  ),
]

export function validateRequestOrigin(request: NextRequest): {
  valid: boolean
  origin: string | null
  reason?: string
} {
  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')

  if (process.env.NODE_ENV === 'development') {
    return { valid: true, origin: origin || referer }
  }

  if (origin) {
    if (isOriginAllowed(origin)) return { valid: true, origin }
    return { valid: false, origin, reason: `Origin not allowed: ${origin}` }
  }

  if (referer) {
    const refererOrigin = extractOriginFromUrl(referer)
    if (refererOrigin && isOriginAllowed(refererOrigin)) {
      return { valid: true, origin: refererOrigin }
    }
    return { valid: false, origin: refererOrigin, reason: `Referer not allowed: ${referer}` }
  }

  if (['POST', 'PUT', 'DELETE'].includes(request.method)) {
    return { valid: false, origin: null, reason: 'Missing both Origin and Referer headers for state-changing request' }
  }

  return { valid: true, origin: null }
}

function isOriginAllowed(origin: string): boolean {
  if (ALLOWED_ORIGINS.includes(origin)) return true

  for (const allowed of ALLOWED_ORIGINS) {
    if (allowed.startsWith('*.')) {
      const domain = allowed.substring(2)
      if (origin.endsWith(domain)) return true
    }
  }
  return false
}

function extractOriginFromUrl(url: string): string | null {
  try {
    const parsed = new URL(url)
    return parsed.origin
  } catch {
    return null
  }
}

export function generateCsrfToken(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

export function validateCsrfToken(requestToken: string | null, storedToken: string | null): boolean {
  if (!requestToken || !storedToken) return false
  return requestToken === storedToken
}

export function verifyCsrfProtection(request: NextRequest) {
  return validateRequestOrigin(request)
}
