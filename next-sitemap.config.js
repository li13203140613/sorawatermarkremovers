/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://www.sora-prompt.io',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  exclude: [
    '/api/*',
    '/test-cookie',
    '/payment',
    '/admin/*'
  ],
  // 手动添加所有路由
  additionalPaths: async (config) => {
    const result = []

    // 主要页面
    const paths = [
      '/',
      '/login',
      '/dashboard',
      '/pricing',
      '/payment/success',
    ]

    // 为每个路径添加语言版本
    paths.forEach(path => {
      result.push({
        loc: path,
        changefreq: 'daily',
        priority: path === '/' ? 1.0 : 0.8,
        lastmod: new Date().toISOString(),
      })
    })

    return result
  },
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/payment', '/test-cookie']
      }
    ],
    additionalSitemaps: [
      'https://www.sora-prompt.io/sitemap.xml',
    ]
  }
}
