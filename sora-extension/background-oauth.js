/**
 * Sora Video Downloader - Background Service Worker (OAuth 版本)
 * 支持独立的 OAuth 登录
 */

console.log('🎬 Sora Video Downloader Background Service 已启动 (OAuth 版本)');

// ========== 配置 ==========

const CONFIG = {
  // Supabase 配置
  SUPABASE_URL: 'https://zjefhzapfbouslkgllah.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqZWZoemFwZmJvdXNsa2dsbGFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5MTM1MjEsImV4cCI6MjA3NTQ4OTUyMX0.49ix1bGrSrTqsS5qDXWgj6OOk-bj5UOaDTkNazqCdko',

  // API 配置
  API_BASE_URL: 'https://www.sora-prompt.io',
  API_VIDEO_PROCESS: 'https://www.sora-prompt.io/api/video/process',
  API_USER_PROFILE: 'https://www.sora-prompt.io/api/user/profile',
  API_TIMEOUT: 30000,

  // 存储键名
  STORAGE_KEYS: {
    ACCESS_TOKEN: 'oauth_access_token',
    REFRESH_TOKEN: 'oauth_refresh_token',
    EXPIRES_AT: 'oauth_expires_at',
    USER_INFO: 'oauth_user_info',
    VISITOR_ID: 'sora_extension_visitor_id',
  },
};

// ========== OAuth 认证功能 ==========

/**
 * 生成 PKCE Code Verifier 和 Challenge
 */
async function generatePKCE() {
  // 生成随机的 code_verifier (43-128 字符)
  const randomBytes = new Uint8Array(32);
  crypto.getRandomValues(randomBytes);
  const codeVerifier = btoa(String.fromCharCode(...randomBytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  // 生成 code_challenge (SHA-256 hash of code_verifier)
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = new Uint8Array(hashBuffer);
  const codeChallenge = btoa(String.fromCharCode(...hashArray))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  return { codeVerifier, codeChallenge };
}

/**
 * 使用 OAuth 登录 (PKCE Flow)
 */
async function loginWithOAuth(provider = 'google') {
  try {
    console.log(`🔐 开始 ${provider} OAuth 登录流程 (PKCE Flow)...`);

    // 1. 生成 PKCE 参数
    const { codeVerifier, codeChallenge } = await generatePKCE();
    console.log('🔑 PKCE Code Verifier 已生成');

    // 2. 获取扩展的 redirect URI
    const redirectUri = chrome.identity.getRedirectURL();
    console.log('📍 Redirect URI:', redirectUri);

    // 3. 构建 Supabase OAuth URL (PKCE Flow)
    const authUrl =
      `${CONFIG.SUPABASE_URL}/auth/v1/authorize?` +
      `provider=${provider}&` +
      `redirect_to=${encodeURIComponent(redirectUri)}&` +
      `code_challenge=${codeChallenge}&` +
      `code_challenge_method=S256`;

    console.log('🌐 打开授权窗口...');

    // 4. 使用 Promise 包装 launchWebAuthFlow
    return new Promise((resolve, reject) => {
      chrome.identity.launchWebAuthFlow(
        {
          url: authUrl,
          interactive: true,
        },
        async (redirectUrl) => {
          // 检查错误
          if (chrome.runtime.lastError) {
            const error = chrome.runtime.lastError.message;
            console.error('❌ OAuth 授权失败:', error);
            reject(new Error(error));
            return;
          }

          if (!redirectUrl) {
            console.error('❌ 未获取到 redirect URL');
            reject(new Error('未获取到授权响应'));
            return;
          }

          console.log('✅ 授权成功，正在交换 Code...');
          console.log('📋 Redirect URL:', redirectUrl);

          try {
            // 5. 从 redirect URL 中提取 authorization code
            const url = new URL(redirectUrl);
            const code = url.searchParams.get('code');

            if (!code) {
              console.error('❌ 未获取到 authorization code');
              console.log('📋 URL 参数:', Object.fromEntries(url.searchParams));
              throw new Error('未获取到 authorization code');
            }

            console.log('📝 Authorization Code 已获取');

            // 6. 使用 code 和 code_verifier 交换 access_token
            const tokenResponse = await fetch(
              `${CONFIG.SUPABASE_URL}/auth/v1/token?grant_type=pkce`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'apikey': CONFIG.SUPABASE_ANON_KEY,
                },
                body: JSON.stringify({
                  auth_code: code,
                  code_verifier: codeVerifier,
                }),
              }
            );

            if (!tokenResponse.ok) {
              const errorText = await tokenResponse.text();
              console.error('❌ Token 交换失败:', tokenResponse.status, errorText);
              throw new Error(`Token 交换失败: ${errorText}`);
            }

            const tokenData = await tokenResponse.json();
            console.log('✅ Token 交换成功');

            const accessToken = tokenData.access_token;
            const refreshToken = tokenData.refresh_token;
            const expiresIn = parseInt(tokenData.expires_in || '3600');

            if (!accessToken) {
              throw new Error('Token 响应中没有 access_token');
            }

            // 7. 计算过期时间
            const expiresAt = Date.now() + expiresIn * 1000;

            // 8. 存储 tokens
            await chrome.storage.local.set({
              [CONFIG.STORAGE_KEYS.ACCESS_TOKEN]: accessToken,
              [CONFIG.STORAGE_KEYS.REFRESH_TOKEN]: refreshToken,
              [CONFIG.STORAGE_KEYS.EXPIRES_AT]: expiresAt,
            });

            console.log('💾 Token 已存储');
            console.log('⏰ Token 过期时间:', new Date(expiresAt).toLocaleString());

            // 9. 获取并存储用户信息
            const userInfo = await fetchUserInfo(accessToken);
            if (userInfo) {
              await chrome.storage.local.set({
                [CONFIG.STORAGE_KEYS.USER_INFO]: userInfo,
              });
              console.log('✅ 登录成功:', userInfo.email);
              resolve({ success: true, user: userInfo });
            } else {
              throw new Error('获取用户信息失败');
            }
          } catch (error) {
            console.error('❌ 处理授权响应失败:', error);
            reject(error);
          }
        }
      );
    });
  } catch (error) {
    console.error('❌ OAuth 登录异常:', error);
    return {
      success: false,
      error: error.message || '登录失败',
    };
  }
}

/**
 * 获取有效的 Access Token（自动刷新）
 */
async function getValidAccessToken() {
  try {
    // 1. 从存储中读取 tokens
    const storage = await chrome.storage.local.get([
      CONFIG.STORAGE_KEYS.ACCESS_TOKEN,
      CONFIG.STORAGE_KEYS.REFRESH_TOKEN,
      CONFIG.STORAGE_KEYS.EXPIRES_AT,
    ]);

    const accessToken = storage[CONFIG.STORAGE_KEYS.ACCESS_TOKEN];
    const refreshToken = storage[CONFIG.STORAGE_KEYS.REFRESH_TOKEN];
    const expiresAt = storage[CONFIG.STORAGE_KEYS.EXPIRES_AT];

    if (!accessToken) {
      console.log('ℹ️ 未登录（无 OAuth Token）');
      return null;
    }

    // 2. 检查 token 是否即将过期（提前 5 分钟刷新）
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;

    if (now < expiresAt - fiveMinutes) {
      // Token 还有效
      console.log('✅ OAuth Token 有效');
      return accessToken;
    }

    // 3. Token 即将过期，尝试刷新
    console.log('🔄 OAuth Token 即将过期，刷新中...');

    if (!refreshToken) {
      console.error('❌ 没有 refresh_token，需要重新登录');
      await logout();
      return null;
    }

    // 4. 调用 Supabase 刷新 Token API
    const response = await fetch(
      `${CONFIG.SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: CONFIG.SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          refresh_token: refreshToken,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ 刷新 Token 失败:', response.status, error);
      await logout();
      return null;
    }

    const data = await response.json();

    // 5. 更新存储
    const newAccessToken = data.access_token;
    const newRefreshToken = data.refresh_token;
    const newExpiresIn = parseInt(data.expires_in || '3600');
    const newExpiresAt = Date.now() + newExpiresIn * 1000;

    await chrome.storage.local.set({
      [CONFIG.STORAGE_KEYS.ACCESS_TOKEN]: newAccessToken,
      [CONFIG.STORAGE_KEYS.REFRESH_TOKEN]: newRefreshToken,
      [CONFIG.STORAGE_KEYS.EXPIRES_AT]: newExpiresAt,
    });

    console.log('✅ OAuth Token 刷新成功');
    console.log('⏰ 新的过期时间:', new Date(newExpiresAt).toLocaleString());

    return newAccessToken;
  } catch (error) {
    console.error('❌ 获取 OAuth Token 异常:', error);
    return null;
  }
}

/**
 * 获取用户信息
 */
async function fetchUserInfo(token) {
  try {
    console.log('📡 获取用户信息...');

    // 调用后端 API 获取完整信息
    const response = await fetch(CONFIG.API_USER_PROFILE, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'X-Extension-Request': 'true',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      console.error('❌ 获取用户信息失败:', response.status);
      // 降级到基本信息
      return await fetchBasicUserInfo(token);
    }

    const data = await response.json();
    console.log('✅ 用户信息获取成功');

    return {
      id: data.id,
      email: data.email,
      name: data.name || data.email?.split('@')[0] || '用户',
      avatarUrl: data.avatar_url,
      credits: data.credits || 0,
    };
  } catch (error) {
    console.error('❌ 获取用户信息异常:', error);
    return await fetchBasicUserInfo(token);
  }
}

/**
 * 从 Supabase 获取基本用户信息（降级方案）
 */
async function fetchBasicUserInfo(token) {
  try {
    const response = await fetch(`${CONFIG.SUPABASE_URL}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: CONFIG.SUPABASE_ANON_KEY,
      },
    });

    if (!response.ok) {
      return null;
    }

    const user = await response.json();

    return {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.full_name || user.email?.split('@')[0] || '用户',
      avatarUrl: user.user_metadata?.avatar_url,
      credits: 0,
    };
  } catch (error) {
    console.error('❌ 获取基本用户信息失败:', error);
    return null;
  }
}

/**
 * 登出
 */
async function logout() {
  try {
    console.log('👋 登出中...');

    await chrome.storage.local.remove([
      CONFIG.STORAGE_KEYS.ACCESS_TOKEN,
      CONFIG.STORAGE_KEYS.REFRESH_TOKEN,
      CONFIG.STORAGE_KEYS.EXPIRES_AT,
      CONFIG.STORAGE_KEYS.USER_INFO,
    ]);

    console.log('✅ 已登出');
  } catch (error) {
    console.error('❌ 登出失败:', error);
  }
}

/**
 * 获取用户信息（用于 Popup 显示）
 */
async function getUserInfo() {
  try {
    // 1. 获取有效的 OAuth Token
    const token = await getValidAccessToken();

    if (!token) {
      // 未登录
      return {
        success: true,
        isLoggedIn: false,
        credits: 1,
      };
    }

    // 2. 从缓存读取用户信息
    const storage = await chrome.storage.local.get([CONFIG.STORAGE_KEYS.USER_INFO]);
    let userInfo = storage[CONFIG.STORAGE_KEYS.USER_INFO];

    // 3. 如果缓存不存在，重新获取
    if (!userInfo) {
      console.log('🔄 缓存不存在，重新获取用户信息...');
      userInfo = await fetchUserInfo(token);

      if (userInfo) {
        await chrome.storage.local.set({
          [CONFIG.STORAGE_KEYS.USER_INFO]: userInfo,
        });
      } else {
        return {
          success: false,
          error: '获取用户信息失败',
        };
      }
    }

    // 4. 返回用户信息
    return {
      success: true,
      isLoggedIn: true,
      ...userInfo,
    };
  } catch (error) {
    console.error('❌ getUserInfo 异常:', error);
    return {
      success: false,
      error: error.message || '获取用户信息失败',
    };
  }
}

// ========== 视频处理功能 ==========

/**
 * 生成 UUID
 */
function generateUUID() {
  return crypto.randomUUID();
}

/**
 * 获取或创建 visitorId
 */
async function getOrCreateVisitorId() {
  try {
    const result = await chrome.storage.local.get([CONFIG.STORAGE_KEYS.VISITOR_ID]);

    if (result[CONFIG.STORAGE_KEYS.VISITOR_ID]) {
      console.log('📝 使用已存在的 visitorId:', result[CONFIG.STORAGE_KEYS.VISITOR_ID]);
      return result[CONFIG.STORAGE_KEYS.VISITOR_ID];
    }

    const visitorId = generateUUID();
    await chrome.storage.local.set({ [CONFIG.STORAGE_KEYS.VISITOR_ID]: visitorId });

    console.log('🆕 创建新的 visitorId:', visitorId);
    return visitorId;
  } catch (error) {
    console.error('❌ 获取 visitorId 失败:', error);
    return generateUUID();
  }
}

/**
 * 调用后端 API 处理视频
 */
async function processVideo(shareLink, visitorId) {
  console.log('🔄 调用 API 处理视频...');
  console.log('📎 分享链接:', shareLink);
  console.log('🆔 访客ID:', visitorId);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), CONFIG.API_TIMEOUT);

  try {
    // 1. 获取有效的 OAuth Token
    const token = await getValidAccessToken();

    // 2. 构建请求头
    const headers = {
      'Content-Type': 'application/json',
    };

    // 3. 如果已登录，添加 Bearer Token
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('🔐 使用 OAuth Token 调用 API');
    } else {
      console.log('👤 使用访客模式调用 API');
    }

    const response = await fetch(CONFIG.API_VIDEO_PROCESS, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        shareLink: shareLink,
        visitorId: visitorId,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    if (!data.success || !data.videoUrl) {
      throw new Error(data.error || 'API 返回数据格式错误');
    }

    console.log('✅ API 调用成功');
    console.log('🎥 视频URL:', data.videoUrl);

    return {
      success: true,
      videoUrl: data.videoUrl,
      shouldConsumeCredit: data.shouldConsumeCredit,
    };
  } catch (error) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      console.error('❌ API 请求超时');
      return {
        success: false,
        error: '请求超时，请稍后重试',
      };
    }

    console.error('❌ API 调用失败:', error);

    let errorMessage = 'API 调用失败';
    if (error.message.includes('积分不足')) {
      errorMessage = '积分不足';
    } else if (error.message.includes('网络')) {
      errorMessage = '网络连接失败';
    } else if (error.message.includes('无效')) {
      errorMessage = '链接无效';
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * 下载视频文件
 */
async function downloadVideo(videoUrl) {
  console.log('⬇️ 开始下载视频...');

  const timestamp = new Date()
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\..+/, '')
    .replace('T', '_');

  const filename = `sora_video_${timestamp}.mp4`;

  try {
    const downloadId = await chrome.downloads.download({
      url: videoUrl,
      filename: filename,
      saveAs: false,
    });

    console.log('✅ 下载已启动，ID:', downloadId);
    console.log('📁 文件名:', filename);

    return {
      success: true,
      downloadId: downloadId,
      filename: filename,
    };
  } catch (error) {
    console.error('❌ 下载失败:', error);
    return {
      success: false,
      error: '下载失败: ' + error.message,
    };
  }
}

/**
 * 处理完整的下载流程
 */
async function handleDownload(shareLink) {
  try {
    const visitorId = await getOrCreateVisitorId();
    const processResult = await processVideo(shareLink, visitorId);

    if (!processResult.success) {
      return {
        success: false,
        error: processResult.error,
      };
    }

    const downloadResult = await downloadVideo(processResult.videoUrl);

    if (!downloadResult.success) {
      return {
        success: false,
        error: downloadResult.error,
      };
    }

    return {
      success: true,
      filename: downloadResult.filename,
    };
  } catch (error) {
    console.error('❌ 处理下载流程时发生错误:', error);
    return {
      success: false,
      error: '处理失败: ' + error.message,
    };
  }
}

// ========== 消息监听 ==========

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('📨 收到消息:', request);

  // OAuth 登录
  if (request.action === 'login') {
    loginWithOAuth(request.provider || 'google')
      .then((result) => {
        console.log('📤 发送登录响应:', result);
        sendResponse(result);
      })
      .catch((error) => {
        console.error('❌ 登录失败:', error);
        sendResponse({
          success: false,
          error: error.message || '登录失败',
        });
      });
    return true;
  }

  // 登出
  if (request.action === 'logout') {
    logout().then(() => {
      console.log('📤 登出成功');
      sendResponse({ success: true });
    });
    return true;
  }

  // 获取用户信息
  if (request.action === 'getUserInfo') {
    getUserInfo()
      .then((result) => {
        console.log('📤 发送用户信息:', result);
        sendResponse(result);
      })
      .catch((error) => {
        console.error('❌ 获取用户信息失败:', error);
        sendResponse({
          success: false,
          error: error.message || '未知错误',
        });
      });
    return true;
  }

  // 下载视频
  if (request.action === 'downloadVideo') {
    handleDownload(request.shareLink)
      .then((result) => {
        console.log('📤 发送下载响应:', result);
        sendResponse(result);
      })
      .catch((error) => {
        console.error('❌ 处理下载失败:', error);
        sendResponse({
          success: false,
          error: error.message || '未知错误',
        });
      });
    return true;
  }
});

// ========== 下载状态监听 ==========

chrome.downloads.onChanged.addListener((delta) => {
  if (delta.state && delta.state.current === 'complete') {
    console.log('✅ 下载完成:', delta.id);
  } else if (delta.state && delta.state.current === 'interrupted') {
    console.error('❌ 下载中断:', delta.id);
  }
});

console.log('✅ Background Service Worker 初始化完成 (OAuth 版本)');
