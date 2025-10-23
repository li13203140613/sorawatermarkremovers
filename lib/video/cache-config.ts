/**
 * 视频缓存配置
 * 用于优化视频加载速度
 */

export const VIDEO_CACHE_CONFIG = {
  // 浏览器缓存时间 (秒)
  BROWSER_CACHE_MAX_AGE: 31536000, // 1年 = 365天

  // CDN 缓存时间 (秒)
  CDN_CACHE_MAX_AGE: 31536000, // 1年

  // 是否使用 immutable 标记 (表示资源永不变化)
  USE_IMMUTABLE: true,

  // 视频预加载策略
  // - 'none': 不预加载 (节省带宽,但首次播放慢)
  // - 'metadata': 预加载元数据 (时长、尺寸等,适中)
  // - 'auto': 自动预加载整个视频 (推荐,配合缓存使用)
  PRELOAD_STRATEGY: 'auto' as 'none' | 'metadata' | 'auto',

  // 是否启用代理
  USE_PROXY: true,

  // 代理 API 路径
  PROXY_API_PATH: '/api/video/proxy'
} as const;

/**
 * 生成视频代理 URL
 */
export function getProxyVideoUrl(originalUrl: string): string {
  if (!VIDEO_CACHE_CONFIG.USE_PROXY) {
    return originalUrl;
  }

  return `${VIDEO_CACHE_CONFIG.PROXY_API_PATH}?url=${encodeURIComponent(originalUrl)}`;
}

/**
 * 生成缓存控制头
 */
export function getCacheControlHeader(): string {
  const parts = [
    'public',
    `max-age=${VIDEO_CACHE_CONFIG.BROWSER_CACHE_MAX_AGE}`
  ];

  if (VIDEO_CACHE_CONFIG.USE_IMMUTABLE) {
    parts.push('immutable');
  }

  return parts.join(', ');
}

/**
 * 生成 CDN 缓存控制头
 */
export function getCDNCacheControlHeader(): string {
  return `public, max-age=${VIDEO_CACHE_CONFIG.CDN_CACHE_MAX_AGE}`;
}
