/**
 * Cookie 工具函数封装
 * 基于 js-cookie 库，提供类型安全的 Cookie 操作
 */

import Cookies from 'js-cookie'

/**
 * Cookie 配置类型
 */
type CookieAttributes = {
  path?: string
  domain?: string
  expires?: number | Date
  secure?: boolean
  sameSite?: 'strict' | 'lax' | 'none'
}

/**
 * 默认 Cookie 配置
 */
const DEFAULT_OPTIONS: CookieAttributes = {
  path: '/',
  sameSite: 'strict',
  secure: process.env.NODE_ENV === 'production', // 生产环境使用 HTTPS
}

/**
 * Cookie 工具类
 */
export class CookieManager {
  /**
   * 设置 Cookie
   * @param key Cookie 名称
   * @param value Cookie 值（自动序列化对象）
   * @param options Cookie 选项
   */
  static set<T = string>(
    key: string,
    value: T,
    options?: CookieAttributes
  ): void {
    const finalValue = typeof value === 'object' ? JSON.stringify(value) : String(value)
    Cookies.set(key, finalValue, { ...DEFAULT_OPTIONS, ...options })
  }

  /**
   * 获取 Cookie
   * @param key Cookie 名称
   * @param parseJSON 是否尝试解析为 JSON
   * @returns Cookie 值
   */
  static get<T = string>(key: string, parseJSON = false): T | undefined {
    const value = Cookies.get(key)

    if (!value) return undefined

    if (parseJSON) {
      try {
        return JSON.parse(value) as T
      } catch {
        return value as T
      }
    }

    return value as T
  }

  /**
   * 删除 Cookie
   * @param key Cookie 名称
   * @param options Cookie 选项（需与设置时一致）
   */
  static remove(key: string, options?: CookieAttributes): void {
    Cookies.remove(key, { ...DEFAULT_OPTIONS, ...options })
  }

  /**
   * 获取所有 Cookie
   * @returns 所有 Cookie 的键值对
   */
  static getAll(): Record<string, string> {
    return Cookies.get()
  }

  /**
   * 检查 Cookie 是否存在
   * @param key Cookie 名称
   * @returns 是否存在
   */
  static has(key: string): boolean {
    return Cookies.get(key) !== undefined
  }

  /**
   * 设置带过期时间的 Cookie（天数）
   * @param key Cookie 名称
   * @param value Cookie 值
   * @param days 过期天数
   */
  static setWithExpiry<T = string>(key: string, value: T, days: number): void {
    this.set(key, value, { expires: days })
  }

  /**
   * 设置 Session Cookie（浏览器关闭后失效）
   * @param key Cookie 名称
   * @param value Cookie 值
   */
  static setSession<T = string>(key: string, value: T): void {
    this.set(key, value, { expires: undefined })
  }

  /**
   * 批量设置 Cookie
   * @param cookies Cookie 键值对
   * @param options Cookie 选项
   */
  static setMultiple(
    cookies: Record<string, unknown>,
    options?: CookieAttributes
  ): void {
    Object.entries(cookies).forEach(([key, value]) => {
      this.set(key, value, options)
    })
  }

  /**
   * 批量删除 Cookie
   * @param keys Cookie 名称数组
   */
  static removeMultiple(keys: string[]): void {
    keys.forEach((key) => this.remove(key))
  }

  /**
   * 清空所有 Cookie（谨慎使用）
   */
  static clearAll(): void {
    const allCookies = this.getAll()
    Object.keys(allCookies).forEach((key) => this.remove(key))
  }
}

/**
 * 便捷导出函数
 */
export const cookieUtils = {
  set: CookieManager.set.bind(CookieManager),
  get: CookieManager.get.bind(CookieManager),
  remove: CookieManager.remove.bind(CookieManager),
  getAll: CookieManager.getAll.bind(CookieManager),
  has: CookieManager.has.bind(CookieManager),
  setWithExpiry: CookieManager.setWithExpiry.bind(CookieManager),
  setSession: CookieManager.setSession.bind(CookieManager),
  setMultiple: CookieManager.setMultiple.bind(CookieManager),
  removeMultiple: CookieManager.removeMultiple.bind(CookieManager),
  clearAll: CookieManager.clearAll.bind(CookieManager),
}

export default CookieManager
