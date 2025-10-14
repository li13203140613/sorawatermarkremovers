/**
 * 扩展配置文件
 * ⚠️ 注意：SUPABASE_ANON_KEY 是公开的，可以安全地放在前端
 */

// Supabase 配置
export const SUPABASE_URL = 'https://zjefhzapfbouslkgllah.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqZWZoemFwZmJvdXNsa2dsbGFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgxMzg2MjIsImV4cCI6MjA1MzcxNDYyMn0.J_5z-DLJuRrD9_jElMJNUfRIhATj1vLKZ4YPVu3MTPA';

// API 配置
export const API_BASE_URL = 'https://www.sora-prompt.io';
export const API_TIMEOUT = 30000; // 30 秒

// 存储键名
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  EXPIRES_AT: 'expires_at',
  USER_INFO: 'user_info',
  VISITOR_ID: 'visitor_id',
};

// OAuth 提供商
export const AUTH_PROVIDERS = {
  GOOGLE: 'google',
  GITHUB: 'github',
};
