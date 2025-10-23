const withNextIntl = require('next-intl/plugin')('./i18n.ts')
const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'openaiassets.blob.core.windows.net',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.vimeocdn.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // 修复 Next.js 15 的配置（使用新的 serverExternalPackages）
  serverExternalPackages: ['next-intl'],
  // 显式设置 workspace root 以避免 lockfile 警告
  outputFileTracingRoot: path.join(__dirname),
}

module.exports = withNextIntl(nextConfig)
