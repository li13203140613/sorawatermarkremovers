'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface NavLinkProps {
  href: string
  children: React.ReactNode
  className?: string
  activeClassName?: string
}

/**
 * 导航链接组件
 *
 * 功能：
 * - 自动检测当前路由并高亮
 * - 点击时立即显示激活状态
 * - 鼠标悬停时预加载目标页面
 * - 点击后禁用以防重复点击
 * - 提供即时视觉反馈
 */
export function NavLink({ href, children, className, activeClassName }: NavLinkProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isClicked, setIsClicked] = useState(false)
  const [isPrefetched, setIsPrefetched] = useState(false)

  // 检查是否是当前页面
  const isActive = pathname === href || pathname.startsWith(`${href}/`)

  // 当路由变化时重置点击状态
  useEffect(() => {
    setIsClicked(false)
  }, [pathname])

  const handleClick = () => {
    if (!isActive) {
      setIsClicked(true)
    }
  }

  // 鼠标悬停时预加载
  const handleMouseEnter = () => {
    if (!isPrefetched && !isActive) {
      router.prefetch(href)
      setIsPrefetched(true)
    }
  }

  const baseClassName = "font-medium transition-all duration-200"
  const defaultClassName = "text-gray-700 hover:text-indigo-600"
  const defaultActiveClassName = "text-indigo-600 font-semibold"

  // 合并 className
  const finalClassName = cn(
    baseClassName,
    isActive || isClicked ? (activeClassName || defaultActiveClassName) : (className || defaultClassName),
    isClicked && !isActive && "opacity-70 pointer-events-none" // 点击后临时禁用
  )

  return (
    <Link
      href={href}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      className={finalClassName}
      prefetch={true} // 启用默认预加载
    >
      {children}
    </Link>
  )
}
