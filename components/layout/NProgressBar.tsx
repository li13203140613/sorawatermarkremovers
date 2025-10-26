'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import NProgress from 'nprogress'

// 配置 NProgress
NProgress.configure({
  showSpinner: false, // 隐藏右上角的加载圆圈
  trickleSpeed: 200,  // 自动递增速度
  minimum: 0.08,      // 最小百分比
  easing: 'ease',     // 动画效果
  speed: 300,         // 动画速度
})

/**
 * 顶部进度条组件
 *
 * 功能：
 * - 路由跳转时自动显示进度条
 * - 页面加载完成后自动隐藏
 * - 提供即时的视觉反馈
 */
export function NProgressBar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // 当路由变化时，启动进度条
    NProgress.done()
  }, [pathname, searchParams])

  useEffect(() => {
    // 监听路由事件
    const handleRouteChangeStart = () => {
      NProgress.start()
    }

    const handleRouteChangeComplete = () => {
      NProgress.done()
    }

    // Next.js 15 使用浏览器原生事件
    window.addEventListener('beforeunload', handleRouteChangeStart)

    // 监听点击事件，当点击链接时启动进度条
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const anchor = target.closest('a')

      if (anchor && anchor.href && !anchor.href.startsWith('#')) {
        // 如果是内部链接且不是锚点
        const isInternal = anchor.href.startsWith(window.location.origin)
        const isDownload = anchor.hasAttribute('download')

        if (isInternal && !isDownload) {
          NProgress.start()
        }
      }
    }

    document.addEventListener('click', handleClick, true)

    return () => {
      window.removeEventListener('beforeunload', handleRouteChangeStart)
      document.removeEventListener('click', handleClick, true)
    }
  }, [])

  return null
}