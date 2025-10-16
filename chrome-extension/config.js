/**
 * 插件配置文件
 * 请根据实际情况修改以下配置
 */

// Supabase 配置（从网页版复制）
export const SUPABASE_CONFIG = {
  url: 'https://zjefhzapfbouslkgllah.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqZWZoemFwZmJvdXNsa2dsbGFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5MTM1MjEsImV4cCI6MjA3NTQ4OTUyMX0.49ix1bGrSrTqsS5qDXWgj6OOk-bj5UOaDTkNazqCdko',

  // Token 存储键名
  storageKey: 'supabase.auth.token'
}

// API 配置
export const API_CONFIG = {
  // 开发环境
  development: {
    baseUrl: 'http://localhost:3000',
    apiPrefix: '/api'
  },

  // 生产环境
  production: {
    baseUrl: 'https://www.sora-prompt.io',  // ⚠️ 修改为你的实际域名
    apiPrefix: '/api'
  }
}

// 获取当前环境的 API URL
export function getApiBaseUrl() {
  // 插件始终使用生产环境 API
  // 不再判断开发/生产环境,避免在本地加载插件时错误地使用 localhost
  return API_CONFIG.production.baseUrl + API_CONFIG.production.apiPrefix
}

// 调试配置
export const DEBUG = true  // 生产环境设置为 false

// 日志函数
export function log(...args) {
  if (DEBUG) {
    console.log('[Sora Extension]', ...args)
  }
}

export function logError(...args) {
  console.error('[Sora Extension]', ...args)
}
