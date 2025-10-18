import createMiddleware from 'next-intl/middleware';
import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { locales, defaultLocale } from '@/i18n.config'

// 创建 next-intl middleware
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always' // 总是显示语言前缀，如 /en, /zh
});

export async function middleware(request: NextRequest) {
  // 跳过测试页面
  if (request.nextUrl.pathname.startsWith('/test-cookie')) {
    return NextResponse.next()
  }

  // 跳过 API 路由和静态资源
  if (
    request.nextUrl.pathname.startsWith('/api') ||
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.includes('.')
  ) {
    return await updateSession(request)
  }

  // 先处理国际化路由
  const intlResponse = intlMiddleware(request);

  // 如果是重定向，直接返回
  if (intlResponse.status === 307 || intlResponse.status === 308) {
    return intlResponse;
  }

  // 然后处理 Supabase session
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * 匹配所有请求路径，除了以下路径：
     * - _next/static (静态文件)
     * - _next/image (图片优化文件)
     * - favicon.ico (网站图标)
     * - 其他静态文件扩展名
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
