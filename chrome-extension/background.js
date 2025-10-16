/**
 * Background Service Worker
 * 处理：登录、登出、API 调用、消息通信
 */

import { SUPABASE_CONFIG, getApiBaseUrl, log, logError } from './config.js'

// === Supabase 客户端初始化 ===

// 注意：由于 Manifest V3 不支持直接使用 npm 包，
// 我们使用简化的方式：通过 Supabase REST API 直接调用

// === 状态管理 ===
let currentUser = null
let currentSession = null

// === Storage 工具函数 ===

async function saveSession(session) {
  try {
    await chrome.storage.local.set({
      [SUPABASE_CONFIG.storageKey]: JSON.stringify(session)
    })
    currentSession = session
    currentUser = session.user
    log('✅ Session 保存成功')
  } catch (error) {
    logError('❌ Session 保存失败:', error)
  }
}

async function getSession() {
  try {
    const result = await chrome.storage.local.get([SUPABASE_CONFIG.storageKey])
    const sessionData = result[SUPABASE_CONFIG.storageKey]

    if (!sessionData) {
      log('⚠️ 未找到本地 session')
      return null
    }

    const session = JSON.parse(sessionData)
    currentSession = session
    currentUser = session.user

    log('✅ Session 加载成功:', currentUser?.email)
    return session
  } catch (error) {
    logError('❌ Session 加载失败:', error)
    return null
  }
}

async function clearSession() {
  try {
    await chrome.storage.local.remove([SUPABASE_CONFIG.storageKey])
    currentSession = null
    currentUser = null
    log('✅ Session 已清除')
  } catch (error) {
    logError('❌ Session 清除失败:', error)
  }
}

async function getAccessToken() {
  const session = await getSession()
  return session?.access_token || null
}

// === Google OAuth 登录 ===

async function loginWithGoogle() {
  log('🔐 开始 Google 登录...')
  log('⏰ 时间戳:', new Date().toISOString())

  try {
    // 步骤 1: 获取插件的 redirect URL
    const redirectURL = chrome.identity.getRedirectURL()
    log('🔗 Extension Redirect URL:', redirectURL)
    log('📝 Redirect URL 类型:', typeof redirectURL)
    log('📝 Redirect URL 长度:', redirectURL.length)

    // 步骤 2: 生成 OAuth URL（必须传 redirect_to 参数）
    const authParams = {
      provider: 'google',
      redirect_to: redirectURL  // 关键: 告诉 Supabase 重定向到哪里
    }

    log('🔧 OAuth 参数:', authParams)

    const authUrl = `${SUPABASE_CONFIG.url}/auth/v1/authorize?` + new URLSearchParams(authParams).toString()

    log('🔗 完整 OAuth URL:', authUrl)
    log('📝 OAuth URL 长度:', authUrl.length)

    // 步骤 3: 启动 OAuth 流程
    log('🚀 准备启动 launchWebAuthFlow...')
    log('⚙️ launchWebAuthFlow 参数:', { url: authUrl, interactive: true })

    const redirectUrl = await chrome.identity.launchWebAuthFlow({
      url: authUrl,
      interactive: true
    })

    log('✅ launchWebAuthFlow 返回成功!')
    log('📩 返回的 Redirect URL:', redirectUrl)
    log('📝 Redirect URL 类型:', typeof redirectUrl)
    log('📝 Redirect URL 长度:', redirectUrl.length)

    // 步骤 4: 解析 redirect URL
    log('🔍 开始解析 URL...')
    const url = new URL(redirectUrl)
    log('📊 URL 组成部分:')
    log('  - protocol:', url.protocol)
    log('  - host:', url.host)
    log('  - pathname:', url.pathname)
    log('  - search:', url.search)
    log('  - hash:', url.hash)

    // 尝试从 hash 中提取 token (Supabase 通常用 hash)
    log('🔍 解析 hash 参数...')
    const hashParams = new URLSearchParams(url.hash.substring(1))
    log('📋 Hash 参数列表:')
    for (const [key, value] of hashParams.entries()) {
      log(`  - ${key}:`, value.substring(0, 20) + '...')
    }

    const access_token = hashParams.get('access_token')
    const refresh_token = hashParams.get('refresh_token')
    const expires_in = hashParams.get('expires_in')

    log('🔑 提取结果:')
    log('  - access_token:', access_token ? '✅ 已获取' : '❌ 未找到')
    log('  - refresh_token:', refresh_token ? '✅ 已获取' : '❌ 未找到')
    log('  - expires_in:', expires_in || '未找到')

    if (!access_token) {
      // 如果 hash 中没有, 尝试 search 参数
      log('⚠️ hash 中未找到 token, 尝试 search 参数...')
      const searchParams = new URLSearchParams(url.search)
      log('📋 Search 参数列表:')
      for (const [key, value] of searchParams.entries()) {
        log(`  - ${key}:`, value)
      }

      throw new Error('未获取到 access_token - URL 中既没有 hash 也没有 search 参数包含 token')
    }

    log('✅ Token 提取成功!')

    // 步骤 5: 获取用户信息
    log('👤 开始获取用户信息...')
    const userApiUrl = `${SUPABASE_CONFIG.url}/auth/v1/user`
    log('🔗 用户信息 API:', userApiUrl)

    const userResponse = await fetch(userApiUrl, {
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'apikey': SUPABASE_CONFIG.anonKey
      }
    })

    log('📡 用户信息 API 响应状态:', userResponse.status, userResponse.statusText)

    if (!userResponse.ok) {
      const errorText = await userResponse.text()
      logError('❌ 用户信息 API 错误响应:', errorText)
      throw new Error(`获取用户信息失败: ${userResponse.status} ${userResponse.statusText}`)
    }

    const user = await userResponse.json()
    log('✅ 用户信息获取成功!')
    log('📧 用户邮箱:', user.email)
    log('🆔 用户 ID:', user.id)

    // 步骤 6: 保存 session
    log('💾 开始保存 session...')
    const session = {
      access_token,
      refresh_token,
      expires_in: parseInt(expires_in),
      expires_at: Date.now() + parseInt(expires_in) * 1000,
      token_type: 'bearer',
      user: user
    }

    log('📦 Session 数据:', {
      has_access_token: !!access_token,
      has_refresh_token: !!refresh_token,
      expires_in: expires_in,
      user_email: user.email
    })

    await saveSession(session)
    log('✅ Session 保存完成')

    // 步骤 7: 查询用户积分
    log('💰 开始查询用户积分...')
    const profile = await fetchUserProfile()
    log('✅ 用户积分查询成功:', profile)

    log('🎉 登录流程全部完成！')
    log('📊 最终结果:', {
      user_email: user.email,
      credits: profile.credits
    })

    return {
      success: true,
      user: user,
      profile: profile
    }

  } catch (error) {
    logError('❌ 登录失败!')
    logError('❌ 错误类型:', error.name)
    logError('❌ 错误信息:', error.message)
    logError('❌ 错误堆栈:', error.stack)

    return {
      success: false,
      error: error.message || '登录失败'
    }
  }
}

// === 退出登录 ===

async function logout() {
  log('🚪 退出登录...')

  try {
    const accessToken = await getAccessToken()

    if (accessToken) {
      // 调用 Supabase 登出 API
      await fetch(`${SUPABASE_CONFIG.url}/auth/v1/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'apikey': SUPABASE_CONFIG.anonKey
        }
      })
    }

    // 清除本地 session
    await clearSession()

    log('✅ 退出成功')

    return { success: true }

  } catch (error) {
    logError('❌ 退出失败:', error)

    // 即使失败也清除本地 session
    await clearSession()

    return { success: false, error: error.message }
  }
}

// === 查询用户信息和积分 ===

async function fetchUserProfile() {
  log('📊 查询用户信息...')

  try {
    const accessToken = await getAccessToken()

    if (!accessToken) {
      throw new Error('未登录')
    }

    const apiUrl = getApiBaseUrl()
    const response = await fetch(`${apiUrl}/user/profile`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      if (response.status === 401) {
        // Token 过期，清除 session
        await clearSession()
        throw new Error('登录已过期，请重新登录')
      }

      const error = await response.json()
      throw new Error(error.error?.message || '查询失败')
    }

    const profile = await response.json()
    log('✅ 用户信息:', profile)

    return profile

  } catch (error) {
    logError('❌ 查询失败:', error)
    throw error
  }
}

// === 消息监听 ===

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  log('📨 收到消息:', request.action)

  // 处理异步消息
  const handleAsync = async () => {
    switch (request.action) {
      case 'login':
        return await loginWithGoogle()

      case 'logout':
        return await logout()

      case 'getProfile':
        try {
          const profile = await fetchUserProfile()
          return { success: true, profile }
        } catch (error) {
          return { success: false, error: error.message }
        }

      case 'checkAuth':
        const session = await getSession()
        return {
          isAuthenticated: !!session,
          user: session?.user || null
        }

      case 'openRecharge':
        // 打开充值页面
        const rechargeUrl = 'https://www.sora-prompt.io/pricing'
        chrome.tabs.create({ url: rechargeUrl })
        return { success: true }

      case 'downloadVideo':
        // 这个功能稍后实现
        return {
          success: false,
          error: '功能开发中...'
        }

      case 'downloadFile':
        // 这个功能稍后实现
        try {
          chrome.downloads.download({
            url: request.url,
            filename: request.filename || 'video.mp4',
            saveAs: true
          })
          return { success: true }
        } catch (error) {
          return { success: false, error: error.message }
        }

      default:
        return { success: false, error: 'Unknown action' }
    }
  }

  // 执行异步处理
  handleAsync()
    .then(result => sendResponse(result))
    .catch(error => {
      logError('消息处理失败:', error)
      sendResponse({ success: false, error: error.message })
    })

  // 返回 true 表示异步响应
  return true
})

// === 插件安装/更新时 ===

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    log('🎉 插件首次安装')
  } else if (details.reason === 'update') {
    log('🔄 插件已更新到', chrome.runtime.getManifest().version)
  }

  // 检查是否已登录
  getSession().then(session => {
    if (session) {
      log('✅ 已登录用户:', session.user?.email)
    } else {
      log('⚠️ 未登录')
    }
  })
})

// === 插件启动时 ===

log('🚀 Background Service Worker 已启动')
log('📍 API Base URL:', getApiBaseUrl())

// 恢复 session
getSession()
