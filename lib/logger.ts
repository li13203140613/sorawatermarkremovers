/**
 * 统一日志系统
 * 提供带命名空间的日志功能，便于追踪和调试
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LoggerOptions {
  namespace: string
  enabled?: boolean
  prefix?: string
}

class Logger {
  private namespace: string
  private enabled: boolean
  private prefix: string

  constructor(options: LoggerOptions) {
    this.namespace = options.namespace
    this.enabled = options.enabled ?? process.env.NODE_ENV === 'development'
    this.prefix = options.prefix || '📝'
  }

  private formatMessage(level: LogLevel, emoji: string, message: string, ...args: unknown[]): void {
    if (!this.enabled && level !== 'error') return

    const timestamp = new Date().toISOString()
    const formattedMessage = `[${this.namespace}] ${emoji} ${message}`

    switch (level) {
      case 'debug':
        console.debug(formattedMessage, ...args)
        break
      case 'info':
        console.log(formattedMessage, ...args)
        break
      case 'warn':
        console.warn(formattedMessage, ...args)
        break
      case 'error':
        console.error(formattedMessage, ...args)
        break
    }
  }

  debug(message: string, ...args: unknown[]): void {
    this.formatMessage('debug', '🔍', message, ...args)
  }

  info(message: string, ...args: unknown[]): void {
    this.formatMessage('info', 'ℹ️', message, ...args)
  }

  warn(message: string, ...args: unknown[]): void {
    this.formatMessage('warn', '⚠️', message, ...args)
  }

  error(message: string, ...args: unknown[]): void {
    this.formatMessage('error', '❌', message, ...args)
  }

  success(message: string, ...args: unknown[]): void {
    this.formatMessage('info', '✅', message, ...args)
  }

  // 特定领域的日志方法
  request(message: string, ...args: unknown[]): void {
    this.formatMessage('info', '📥', message, ...args)
  }

  response(message: string, ...args: unknown[]): void {
    this.formatMessage('info', '📤', message, ...args)
  }

  api(message: string, ...args: unknown[]): void {
    this.formatMessage('info', '🔌', message, ...args)
  }

  db(message: string, ...args: unknown[]): void {
    this.formatMessage('info', '💾', message, ...args)
  }
}

/**
 * 创建命名空间日志器
 */
export function createLogger(namespace: string, options?: Partial<LoggerOptions>): Logger {
  return new Logger({ namespace, ...options })
}

/**
 * 预定义的常用日志器
 */
export const videoLogger = createLogger('Video Processing')
export const aiLogger = createLogger('AI Coding')
export const paymentLogger = createLogger('Payment')
export const authLogger = createLogger('Auth')
export const adminLogger = createLogger('Admin')
export const apiLogger = createLogger('API')
