/**
 * SEO Canonical URL 工具函数
 * 用于生成标准链接，避免重复内容问题
 */

import { defaultLocale } from '@/i18n.config';

// 从环境变量获取网站基础 URL
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.sorawatermarkremovers.com';

/**
 * 生成 canonical URL
 *
 * @param pathname - 页面路径（不包含 locale）
 * @param locale - 当前语言（可选，默认使用 en）
 * @returns 完整的 canonical URL
 *
 * @example
 * getCanonicalUrl('/pricing', 'en') // => https://www.sora-prompt.io/en/pricing
 * getCanonicalUrl('/blog/my-post', 'zh') // => https://www.sora-prompt.io/zh/blog/my-post
 * getCanonicalUrl('/', 'en') // => https://www.sora-prompt.io/en
 */
export function getCanonicalUrl(pathname: string, locale: string = defaultLocale): string {
  // 移除开头的斜杠（如果有）
  const cleanPathname = pathname.startsWith('/') ? pathname.slice(1) : pathname;

  // 移除结尾的斜杠（如果有）
  const normalizedPathname = cleanPathname.endsWith('/')
    ? cleanPathname.slice(0, -1)
    : cleanPathname;

  // 构建完整的 canonical URL
  // 格式：https://www.sora-prompt.io/{locale}/{pathname}
  const path = normalizedPathname ? `${locale}/${normalizedPathname}` : locale;

  return `${BASE_URL}/${path}`;
}

/**
 * 从完整的路径中提取不含 locale 的路径
 *
 * @param fullPath - 完整路径（包含 locale）
 * @returns 不含 locale 的路径
 *
 * @example
 * extractPathnameWithoutLocale('/en/pricing') // => '/pricing'
 * extractPathnameWithoutLocale('/zh/blog/my-post') // => '/blog/my-post'
 * extractPathnameWithoutLocale('/en') // => '/'
 */
export function extractPathnameWithoutLocale(fullPath: string): string {
  // 支持的语言列表
  const locales = ['en', 'zh', 'ja', 'de', 'zh-hant'];

  // 移除开头的斜杠
  const cleanPath = fullPath.startsWith('/') ? fullPath.slice(1) : fullPath;

  // 检查是否以某个 locale 开头
  for (const locale of locales) {
    if (cleanPath === locale) {
      return '/';
    }
    if (cleanPath.startsWith(`${locale}/`)) {
      return '/' + cleanPath.slice(locale.length + 1);
    }
  }

  // 如果没有 locale 前缀，返回原路径
  return '/' + cleanPath;
}

/**
 * 生成多语言 alternate links（hreflang）
 * 用于告诉搜索引擎不同语言版本的页面
 *
 * @param pathname - 页面路径（不包含 locale）
 * @param locales - 支持的语言列表
 * @returns alternate links 数组
 *
 * @example
 * getAlternateLinks('/pricing', ['en', 'zh'])
 * // => [
 * //   { hreflang: 'en', href: 'https://www.sora-prompt.io/en/pricing' },
 * //   { hreflang: 'zh', href: 'https://www.sora-prompt.io/zh/pricing' },
 * //   { hreflang: 'x-default', href: 'https://www.sora-prompt.io/en/pricing' }
 * // ]
 */
export function getAlternateLinks(
  pathname: string,
  locales: string[] = ['en', 'zh', 'ja', 'de', 'zh-hant']
): Array<{ hreflang: string; href: string }> {
  const links = locales.map(locale => ({
    hreflang: locale,
    href: getCanonicalUrl(pathname, locale)
  }));

  // 添加 x-default（默认语言版本）
  links.push({
    hreflang: 'x-default',
    href: getCanonicalUrl(pathname, defaultLocale)
  });

  return links;
}
