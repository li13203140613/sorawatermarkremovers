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

  // API 配置（生产环境）
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
 * 使用 OAuth 登录（在扩展弹窗中完成授权）
 */
async function loginWithOAuth(provider = 'google') {
  try {
    console.log(`🔐 开始 ${provider} OAuth 登录流程...`);

    // 1. 获取扩展的 redirect URI
    const redirectUri = chrome.identity.getRedirectURL();
    console.log('📍 Redirect URI:', redirectUri);

    // 2. 构建 Supabase OAuth URL
    const authUrl =
      `${CONFIG.SUPABASE_URL}/auth/v1/authorize?` +
      `provider=${provider}&` +
      `redirect_to=${encodeURIComponent(redirectUri)}`;

    console.log('🌐 打开授权窗口...');
    console.log('🔗 Auth URL:', authUrl);

    // 3. 使用 Promise 包装 launchWebAuthFlow
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

          console.log('✅ 授权成功');
          console.log('📋 Redirect URL:', redirectUrl);

          try {
            // 4. 从 redirect URL 中提取 tokens
            const url = new URL(redirectUrl);
            const fragment = url.hash.substring(1); // 移除 # 号
            const params = new URLSearchParams(fragment);

            const accessToken = params.get('access_token');
            const refreshToken = params.get('refresh_token');
            const expiresIn = parseInt(params.get('expires_in') || '3600');

            if (!accessToken) {
              console.error('❌ 未获取到 access_token');
              console.log('📋 URL Fragment:', fragment);
              throw new Error('未获取到 access_token');
            }

            console.log('✅ Token 已获取');

            // 5. 计算过期时间
            const expiresAt = Date.now() + expiresIn * 1000;

            // 6. 存储 tokens
            await chrome.storage.local.set({
              [CONFIG.STORAGE_KEYS.ACCESS_TOKEN]: accessToken,
              [CONFIG.STORAGE_KEYS.REFRESH_TOKEN]: refreshToken,
              [CONFIG.STORAGE_KEYS.EXPIRES_AT]: expiresAt,
            });

            console.log('💾 Token 已存储');
            console.log('⏰ Token 过期时间:', new Date(expiresAt).toLocaleString());

            // 7. 获取并存储用户信息
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
 * 获取用户信息（必须从数据库查询积分）
 * 不再使用降级方案，失败时返回null并附带详细错误信息
 */
async function fetchUserInfo(token) {
  try {
    console.log('\n📡 ============ 获取用户信息 ============');
    console.log('🔑 Token 前缀:', token.substring(0, 30) + '...');
    console.log('📍 API URL:', CONFIG.API_USER_PROFILE);

    // 调用后端 API 获取完整信息（包括数据库积分）
    const response = await fetch(CONFIG.API_USER_PROFILE, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'X-Extension-Request': 'true',
      },
      credentials: 'include',
    });

    console.log('📊 API 响应状态:', response.status);

    if (!response.ok) {
      const responseText = await response.text();
      let errorDetail = null;

      // 尝试解析错误详情
      try {
        const errorData = JSON.parse(responseText);
        errorDetail = errorData.error || errorData;
      } catch (e) {
        errorDetail = responseText;
      }

      console.error('\n❌ ============ API 调用失败 ============');
      console.error('   HTTP 状态:', response.status);
      console.error('   状态文本:', response.statusText);

      if (errorDetail && errorDetail.code) {
        console.error('   错误代码:', errorDetail.code);
        console.error('   错误消息:', errorDetail.message);
        console.error('   技术细节:', errorDetail.technicalDetail);
        console.error('   时间戳:', errorDetail.timestamp);
      } else {
        console.error('   错误内容:', errorDetail);
      }
      console.error('==========================================\n');

      // 不再使用降级方案，直接返回 null
      return null;
    }

    const data = await response.json();

    // 检查是否是错误响应（即使 HTTP 200）
    if (data.error) {
      console.error('\n❌ ============ API 返回错误 ============');
      console.error('   错误代码:', data.error.code);
      console.error('   错误消息:', data.error.message);
      console.error('   技术细节:', data.error.technicalDetail);
      console.error('==========================================\n');
      return null;
    }

    console.log('\n✅ ============ 用户信息获取成功 ============');
    console.log('   用户 ID:', data.id);
    console.log('   邮箱:', data.email);
    console.log('   用户名:', data.name);
    console.log('   积分:', data.credits);
    console.log('   头像:', data.avatar_url ? '已设置' : '未设置');
    console.log('=============================================\n');

    return {
      id: data.id,
      email: data.email,
      name: data.name || data.email?.split('@')[0] || '用户',
      avatarUrl: data.avatar_url,
      credits: data.credits !== undefined ? data.credits : 0, // 数据库为准，默认 0
      errorDetail: null, // 没有错误
    };
  } catch (error) {
    console.error('\n❌ ============ 获取用户信息异常 ============');
    console.error('   异常类型:', error.name);
    console.error('   异常消息:', error.message);
    console.error('   异常堆栈:', error.stack);
    console.error('=============================================\n');

    // 不再使用降级方案，直接返回 null
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
 * 获取用户信息（用于 Popup 显示）- 必须从数据库查询积分
 */
async function getUserInfo() {
  try {
    // 1. 获取有效的 OAuth Token
    const token = await getValidAccessToken();

    if (!token) {
      // 未登录 - 显示登录界面
      console.log('ℹ️ 用户未登录');
      return {
        success: true,
        isLoggedIn: false,
        message: '请登录以使用完整功能',
      };
    }

    // 2. 已有 Token，尝试获取用户信息
    console.log('🔄 从数据库获取最新用户信息和积分...');
    const userInfo = await fetchUserInfo(token);

    if (!userInfo) {
      // Token 有效但 API 调用失败
      // 这种情况下，我们仍然认为用户"已登录"，但积分查询失败
      console.error('⚠️ Token 有效但无法获取用户信息，可能是 API 错误');

      // 尝试从缓存读取基本用户信息
      const storage = await chrome.storage.local.get([CONFIG.STORAGE_KEYS.USER_INFO]);
      const cachedUser = storage[CONFIG.STORAGE_KEYS.USER_INFO];

      if (cachedUser) {
        console.log('📦 使用缓存的用户信息（积分可能不准确）');
        return {
          success: true,
          isLoggedIn: true,
          ...cachedUser,
          credits: null, // 积分查询失败，设为 null
          errorMessage: 'API 调用失败，积分数据可能不准确',
        };
      }

      // 连缓存都没有，只能返回最基本的信息
      return {
        success: true,
        isLoggedIn: true,
        email: '未知',
        name: '用户',
        credits: null,
        errorMessage: 'API 调用失败，请重试',
      };
    }

    // 3. 成功获取用户信息，更新缓存
    await chrome.storage.local.set({
      [CONFIG.STORAGE_KEYS.USER_INFO]: userInfo,
    });

    console.log('✅ 用户信息已更新');

    // 4. 返回用户信息
    return {
      success: true,
      isLoggedIn: true,
      ...userInfo,
    };
  } catch (error) {
    console.error('❌ getUserInfo 异常:', error);

    // 异常情况下，尝试返回缓存
    try {
      const storage = await chrome.storage.local.get([CONFIG.STORAGE_KEYS.USER_INFO]);
      const cachedUser = storage[CONFIG.STORAGE_KEYS.USER_INFO];

      if (cachedUser) {
        return {
          success: true,
          isLoggedIn: true,
          ...cachedUser,
          credits: null,
          errorMessage: '网络异常，使用缓存数据',
        };
      }
    } catch (cacheError) {
      console.error('❌ 读取缓存失败:', cacheError);
    }

    // 实在没办法了，返回错误
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
