'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface BreadcrumbItem {
  label: string;
  href: string;
}

export default function Breadcrumbs() {
  const pathname = usePathname();
  const t = useTranslations('breadcrumbs');

  // 解析路径生成面包屑
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    // 移除语言前缀 (如 /zh, /en)
    const pathWithoutLocale = pathname.replace(/^\/(zh|en|ja|de|zh-hant)/, '') || '/';

    // 首页特殊处理
    if (pathWithoutLocale === '/') {
      return [];
    }

    const paths = pathWithoutLocale.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    // 添加首页
    breadcrumbs.push({
      label: t('home'),
      href: '/',
    });

    // 生成路径面包屑
    let currentPath = '';
    paths.forEach((path, index) => {
      currentPath += `/${path}`;

      // 获取页面名称（使用翻译或 fallback 到路径本身）
      const pageName = t(path, { default: path });

      breadcrumbs.push({
        label: pageName,
        href: currentPath,
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // 首页不显示面包屑
  if (breadcrumbs.length === 0) {
    return null;
  }

  // 生成 Schema.org 结构化数据（对 SEO 重要）
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': breadcrumbs.map((item, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'name': item.label,
      'item': `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.sorawatermarkremovers.com'}${item.href}`,
    })),
  };

  return (
    <>
      {/* Schema.org 结构化数据 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />

      {/* 面包屑 UI */}
      <nav
        aria-label="Breadcrumb"
        className="bg-gray-50 border-b border-gray-200 py-3 px-4"
      >
        <div className="max-w-7xl mx-auto">
          <ol className="flex items-center gap-2 text-sm flex-wrap">
            {breadcrumbs.map((item, index) => {
              const isLast = index === breadcrumbs.length - 1;

              return (
                <li key={item.href} className="flex items-center gap-2">
                  {index > 0 && (
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  )}

                  {isLast ? (
                    // 当前页面（不可点击）
                    <span
                      className="text-gray-900 font-medium flex items-center gap-1"
                      aria-current="page"
                    >
                      {index === 0 && <Home className="w-4 h-4" />}
                      {item.label}
                    </span>
                  ) : (
                    // 可点击的链接
                    <Link
                      href={item.href}
                      className="text-gray-600 hover:text-primary transition-colors flex items-center gap-1"
                    >
                      {index === 0 && <Home className="w-4 h-4" />}
                      {item.label}
                    </Link>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </nav>
    </>
  );
}
