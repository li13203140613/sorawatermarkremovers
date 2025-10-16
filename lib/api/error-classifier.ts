/**
 * API 错误分类和处理工具
 */

export interface ErrorDetail {
  code: string
  message: string
  technicalDetail: string
  httpStatus: number
  timestamp: string
}

/**
 * API 错误类型定义
 */
export const API_ERRORS = {
  // ===== 1. 认证层错误 =====
  AUTH_TOKEN_INVALID: {
    code: 'AUTH_TOKEN_INVALID',
    message: 'Token 格式错误或无效',
    httpStatus: 401,
  },
  AUTH_TOKEN_EXPIRED: {
    code: 'AUTH_TOKEN_EXPIRED',
    message: 'Token 已过期，请重新登录',
    httpStatus: 401,
  },
  AUTH_MISSING_SUB_CLAIM: {
    code: 'AUTH_MISSING_SUB_CLAIM',
    message: 'Token 缺少用户标识',
    httpStatus: 401,
  },
  AUTH_USER_NOT_FOUND: {
    code: 'AUTH_USER_NOT_FOUND',
    message: '用户不存在',
    httpStatus: 404,
  },

  // ===== 2. 环境配置错误 =====
  CONFIG_MISSING_SUPABASE_URL: {
    code: 'CONFIG_MISSING_SUPABASE_URL',
    message: '服务器配置错误：缺少 Supabase URL',
    httpStatus: 500,
  },
  CONFIG_MISSING_SERVICE_KEY: {
    code: 'CONFIG_MISSING_SERVICE_KEY',
    message: '服务器配置错误：缺少 Service Role Key',
    httpStatus: 500,
  },
  CONFIG_MISSING_ANON_KEY: {
    code: 'CONFIG_MISSING_ANON_KEY',
    message: '服务器配置错误：缺少 Anon Key',
    httpStatus: 500,
  },
  CONFIG_INVALID_KEY_FORMAT: {
    code: 'CONFIG_INVALID_KEY_FORMAT',
    message: '密钥格式错误',
    httpStatus: 500,
  },

  // ===== 3. 数据库权限错误 =====
  DB_PERMISSION_DENIED: {
    code: 'DB_PERMISSION_DENIED',
    message: '数据库访问权限不足',
    httpStatus: 403,
  },
  DB_RLS_POLICY_VIOLATION: {
    code: 'DB_RLS_POLICY_VIOLATION',
    message: 'RLS 策略拒绝访问',
    httpStatus: 403,
  },

  // ===== 4. 数据库查询错误 =====
  DB_USER_PROFILE_NOT_FOUND: {
    code: 'DB_USER_PROFILE_NOT_FOUND',
    message: '用户档案不存在',
    httpStatus: 404,
  },
  DB_QUERY_SYNTAX_ERROR: {
    code: 'DB_QUERY_SYNTAX_ERROR',
    message: '数据库查询语法错误',
    httpStatus: 500,
  },
  DB_CONNECTION_FAILED: {
    code: 'DB_CONNECTION_FAILED',
    message: '数据库连接失败',
    httpStatus: 503,
  },
  DB_TIMEOUT: {
    code: 'DB_TIMEOUT',
    message: '数据库查询超时',
    httpStatus: 504,
  },
  DB_CONSTRAINT_ERROR: {
    code: 'DB_CONSTRAINT_ERROR',
    message: '数据库约束错误',
    httpStatus: 400,
  },

  // ===== 5. 业务逻辑错误 =====
  PROFILE_CREATE_FAILED: {
    code: 'PROFILE_CREATE_FAILED',
    message: '创建用户档案失败',
    httpStatus: 500,
  },
  CREDITS_QUERY_FAILED: {
    code: 'CREDITS_QUERY_FAILED',
    message: '积分查询失败',
    httpStatus: 500,
  },

  // ===== 6. 未知错误 =====
  UNKNOWN_ERROR: {
    code: 'UNKNOWN_ERROR',
    message: '未知错误',
    httpStatus: 500,
  },
} as const

/**
 * 识别 Supabase 认证错误类型
 */
function classifyAuthError(error: any): ErrorDetail {
  const message = error?.message?.toLowerCase() || ''

  // 检查 sub claim 错误
  if (message.includes('missing sub claim')) {
    return {
      ...API_ERRORS.AUTH_MISSING_SUB_CLAIM,
      technicalDetail: error.message,
      timestamp: new Date().toISOString(),
    }
  }

  // 检查 JWT 过期
  if (message.includes('jwt') && message.includes('expired')) {
    return {
      ...API_ERRORS.AUTH_TOKEN_EXPIRED,
      technicalDetail: error.message,
      timestamp: new Date().toISOString(),
    }
  }

  // 检查 JWT 格式错误
  if (
    message.includes('jwt') &&
    (message.includes('invalid') || message.includes('malformed'))
  ) {
    return {
      ...API_ERRORS.AUTH_TOKEN_INVALID,
      technicalDetail: error.message,
      timestamp: new Date().toISOString(),
    }
  }

  // 检查用户不存在
  if (message.includes('user not found')) {
    return {
      ...API_ERRORS.AUTH_USER_NOT_FOUND,
      technicalDetail: error.message,
      timestamp: new Date().toISOString(),
    }
  }

  // 默认认证错误
  return {
    ...API_ERRORS.AUTH_TOKEN_INVALID,
    technicalDetail: error.message || JSON.stringify(error),
    timestamp: new Date().toISOString(),
  }
}

/**
 * 识别 Supabase 数据库错误类型
 */
function classifyDatabaseError(error: any): ErrorDetail {
  const code = error?.code
  const message = error?.message?.toLowerCase() || ''

  // 1. 检查 PostgREST 错误代码
  if (code === 'PGRST116') {
    // No rows found
    return {
      ...API_ERRORS.DB_USER_PROFILE_NOT_FOUND,
      technicalDetail: `${code}: ${error.message}`,
      timestamp: new Date().toISOString(),
    }
  }

  if (code === 'PGRST301') {
    // Permission denied
    return {
      ...API_ERRORS.DB_PERMISSION_DENIED,
      technicalDetail: `${code}: ${error.message}`,
      timestamp: new Date().toISOString(),
    }
  }

  // 2. 检查 PostgreSQL 错误代码
  if (code === '42P01') {
    // Undefined table
    return {
      ...API_ERRORS.DB_QUERY_SYNTAX_ERROR,
      technicalDetail: `${code}: ${error.message}`,
      timestamp: new Date().toISOString(),
    }
  }

  if (code === '42501') {
    // Insufficient privilege
    return {
      ...API_ERRORS.DB_RLS_POLICY_VIOLATION,
      technicalDetail: `${code}: ${error.message}`,
      timestamp: new Date().toISOString(),
    }
  }

  if (code === '08006') {
    // Connection failure
    return {
      ...API_ERRORS.DB_CONNECTION_FAILED,
      technicalDetail: `${code}: ${error.message}`,
      timestamp: new Date().toISOString(),
    }
  }

  if (code === '57014') {
    // Query timeout
    return {
      ...API_ERRORS.DB_TIMEOUT,
      technicalDetail: `${code}: ${error.message}`,
      timestamp: new Date().toISOString(),
    }
  }

  if (code?.startsWith('23')) {
    // Integrity constraint violation (23xxx)
    return {
      ...API_ERRORS.DB_CONSTRAINT_ERROR,
      technicalDetail: `${code}: ${error.message}`,
      timestamp: new Date().toISOString(),
    }
  }

  // 3. 检查错误消息关键词
  if (message.includes('permission') || message.includes('access denied')) {
    return {
      ...API_ERRORS.DB_PERMISSION_DENIED,
      technicalDetail: error.message,
      timestamp: new Date().toISOString(),
    }
  }

  if (message.includes('connection') || message.includes('network')) {
    return {
      ...API_ERRORS.DB_CONNECTION_FAILED,
      technicalDetail: error.message,
      timestamp: new Date().toISOString(),
    }
  }

  if (message.includes('timeout')) {
    return {
      ...API_ERRORS.DB_TIMEOUT,
      technicalDetail: error.message,
      timestamp: new Date().toISOString(),
    }
  }

  // 默认数据库错误
  return {
    code: 'DB_QUERY_ERROR',
    message: '数据库查询错误',
    technicalDetail: error.message || JSON.stringify(error),
    httpStatus: 500,
    timestamp: new Date().toISOString(),
  }
}

/**
 * 主错误分类函数
 * @param error 错误对象
 * @param context 错误发生的上下文（auth, database, config 等）
 */
export function classifyError(
  error: any,
  context: 'auth' | 'database' | 'config' | 'business' = 'database'
): ErrorDetail {
  if (!error) {
    return {
      ...API_ERRORS.UNKNOWN_ERROR,
      technicalDetail: 'No error object provided',
      timestamp: new Date().toISOString(),
    }
  }

  // 根据上下文选择分类函数
  switch (context) {
    case 'auth':
      return classifyAuthError(error)

    case 'database':
      return classifyDatabaseError(error)

    case 'config':
      return {
        ...API_ERRORS.CONFIG_MISSING_SERVICE_KEY,
        technicalDetail: error.message || 'Configuration error',
        timestamp: new Date().toISOString(),
      }

    case 'business':
      return {
        code: 'BUSINESS_LOGIC_ERROR',
        message: error.message || '业务逻辑错误',
        technicalDetail: error.message || JSON.stringify(error),
        httpStatus: 400,
        timestamp: new Date().toISOString(),
      }

    default:
      return {
        ...API_ERRORS.UNKNOWN_ERROR,
        technicalDetail: error.message || JSON.stringify(error),
        timestamp: new Date().toISOString(),
      }
  }
}

/**
 * 格式化错误日志输出
 */
export function logErrorDetail(stage: string, errorDetail: ErrorDetail) {
  console.error(`\n❌ ============ ${stage} 错误详情 ============`)
  console.error(`   错误代码: ${errorDetail.code}`)
  console.error(`   用户消息: ${errorDetail.message}`)
  console.error(`   技术细节: ${errorDetail.technicalDetail}`)
  console.error(`   HTTP 状态: ${errorDetail.httpStatus}`)
  console.error(`   时间戳: ${errorDetail.timestamp}`)
  console.error(`============================================\n`)
}
