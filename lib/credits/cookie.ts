/**
 * Cookie 积分管理核心模块
 * 用于管理未登录用户的临时积分（30天有效期）
 */

import Cookies from 'js-cookie'
import { v4 as uuidv4 } from 'uuid'
import { VisitorCredits, ConsumeResult } from './types'

/**
 * Cookie 配置常量
 */
const COOKIE_NAME = 'visitor_credits'
const COOKIE_EXPIRY_DAYS = 30
const INITIAL_CREDITS = 1

/**
 * Cookie 积分管理器
 */
export class CookieCreditsManager {
  /**
   * 获取或初始化访客积分
   * 如果 Cookie 不存在，自动创建新的访客记录
   */
  static getCredits(): VisitorCredits {
    const cookieValue = Cookies.get(COOKIE_NAME)

    if (cookieValue) {
      try {
        const data = JSON.parse(cookieValue) as VisitorCredits

        // 验证数据完整性
        if (this.isValidCreditsData(data)) {
          return data
        }
      } catch (error) {
        console.error('解析 Cookie 积分失败:', error)
      }
    }

    // Cookie 不存在或数据损坏 → 创建新访客
    return this.initializeNewVisitor()
  }

  /**
   * 初始化新访客
   */
  static initializeNewVisitor(): VisitorCredits {
    const now = new Date()
    const expiryDate = new Date(now)
    expiryDate.setDate(expiryDate.getDate() + COOKIE_EXPIRY_DAYS)

    const credits: VisitorCredits = {
      visitorId: uuidv4(),
      credits: INITIAL_CREDITS,
      createdAt: now.toISOString(),
      expiresAt: expiryDate.toISOString(),
    }

    this.saveCredits(credits)
    return credits
  }

  /**
   * 保存积分到 Cookie
   */
  static saveCredits(credits: VisitorCredits): void {
    Cookies.set(COOKIE_NAME, JSON.stringify(credits), {
      expires: COOKIE_EXPIRY_DAYS,
      path: '/',
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    })
  }

  /**
   * 消费 1 个积分
   */
  static consumeCredit(): ConsumeResult {
    const credits = this.getCredits()

    if (credits.credits < 1) {
      return {
        success: false,
        remainingCredits: 0,
        error: '积分不足',
      }
    }

    // 扣除积分
    const updatedCredits: VisitorCredits = {
      ...credits,
      credits: credits.credits - 1,
    }

    this.saveCredits(updatedCredits)

    return {
      success: true,
      remainingCredits: updatedCredits.credits,
    }
  }

  /**
   * 检查是否有足够积分
   */
  static hasCredits(): boolean {
    const credits = this.getCredits()
    return credits.credits > 0
  }

  /**
   * 获取当前积分数量
   */
  static getCreditsCount(): number {
    const credits = this.getCredits()
    return credits.credits
  }

  /**
   * 获取访客 ID
   */
  static getVisitorId(): string {
    const credits = this.getCredits()
    return credits.visitorId
  }

  /**
   * 清除 Cookie（用于测试或用户主动清理）
   */
  static clear(): void {
    Cookies.remove(COOKIE_NAME, { path: '/' })
  }

  /**
   * 验证积分数据完整性
   */
  private static isValidCreditsData(data: any): boolean {
    return (
      data &&
      typeof data.visitorId === 'string' &&
      typeof data.credits === 'number' &&
      typeof data.createdAt === 'string' &&
      typeof data.expiresAt === 'string' &&
      data.credits >= 0 &&
      data.credits <= INITIAL_CREDITS
    )
  }
}

/**
 * 便捷导出函数
 */
export const cookieCredits = {
  get: () => CookieCreditsManager.getCredits(),
  getCount: () => CookieCreditsManager.getCreditsCount(),
  getVisitorId: () => CookieCreditsManager.getVisitorId(),
  consume: () => CookieCreditsManager.consumeCredit(),
  hasCredits: () => CookieCreditsManager.hasCredits(),
  clear: () => CookieCreditsManager.clear(),
}

export default CookieCreditsManager
