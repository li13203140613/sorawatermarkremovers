/**
 * Sora Video Downloader - Background Service Worker (网站中转 OAuth 版本)
 * 通过网站中转完成 OAuth 登录
 */

console.log('🎬 Sora Video Downloader Background Service 已启动 (网站中转 OAuth)');

// ========== 配置 ==========

const CONFIG = {
  // Supabase 配置
  SUPABASE_URL: 'https://zjefhzapfbouslkgllah.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqZWZoemFwZmJvdXNsa2dsbGFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgxMzg2MjIsImV4cCI6MjA1MzcxNDYyMn0.J_5z-DLJuRrD9_jElMJNUfRIhATj1vLKZ4YPVu3MTPA',

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
    PENDING_AUTH_TAB: 'pending_auth_tab_id', // 存储等待认证的标签页 ID
  },
};

// ========== OAuth 认证功能 (网站中转方式) ==========

/**
 * 使用 OAuth 登录 (通过网站中转)
 */
async function loginWithOAuth(provider = 'google') {
  try {
    console.log(`🔐 开始 ${provider} OAuth 登录流程 (网站中转方式)...`);

    // 1. 构建网站的扩展登录页面 URL
    const extensionId = chrome.runtime.id;
    const loginUrl = `${CONFIG.API_BASE_URL}/extension-auth?provider=${provider}&extension_id=${extensionId}`;

    console.log('🌐 打开网站登录页面:', loginUrl);
    console.log('📱 扩展 ID:', extensionId);

    // 2. 创建Promise等待认证完成
    return new Promise((resolve, reject) => {
      let authTabId = null;
      let isResolved = false;

      // 超时处理 (60秒)
      const timeout = setTimeout(() => {
        if (!isResolved) {
          isResolved = true;
          console.error('❌ 登录超时');
          cleanup();
          reject(new Error('登录超时，请重试'));
        }
      }, 60000);

      // 监听来自 content script 的消息
      const messageListener = (request, sender, sendResponse) => {
        if (request.action === 'authSuccess') {
          console.log('✅ 接收到网站传来的认证信息');

          if (isResolved) return;
          isResolved = true;

          const { access_token, refresh_token, expires_in } = request.payload;

          if (!access_token) {
            console.error('❌ 未获取到 access_token');
            cleanup();
            reject(new Error('未获取到 access_token'));
            return;
          }

          console.log('🔑 Access Token: ✅ 已获取');
          console.log('🔑 Refresh Token:', refresh_token ? '✅ 已获取' : '❌ 未获取');

          // 关闭登录标签页
          if (authTabId) {
            chrome.tabs.remove(authTabId, () => {
              console.log('🗑️ 登录标签页已关闭');
            });
          }

          cleanup();

          // 处理认证成功
          handleAuthSuccess(access_token, refresh_token, expires_in)
            .then(resolve)
            .catch(reject);
        } else if (request.action === 'authError') {
          console.error('❌ 网站认证失败:', request.error);

          if (isResolved) return;
          isResolved = true;

          cleanup();
          reject(new Error(request.error || '登录失败'));
        }
      };

      // 清理函数
      const cleanup = () => {
        clearTimeout(timeout);
        chrome.runtime.onMessage.removeListener(messageListener);
        chrome.storage.local.remove(CONFIG.STORAGE_KEYS.PENDING_AUTH_TAB);
      };

      // 添加消息监听器
      chrome.runtime.onMessage.addListener(messageListener);

      // 打开登录页面
      chrome.tabs.create({ url: loginUrl, active: true }, (tab) => {
        authTabId = tab.id;
        console.log('📑 登录标签页已打开, Tab ID:', authTabId);

        // 存储标签页 ID,以便后续关闭
        chrome.storage.local.set({
          [CONFIG.STORAGE_KEYS.PENDING_AUTH_TAB]: authTabId,
        });
      });
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
 * 处理认证成功
 */
async function handleAuthSuccess(accessToken, refreshToken, expiresIn = 3600) {
  try {
    // 1. 计算过期时间
    const expiresAt = Date.now() + expiresIn * 1000;

    // 2. 存储 tokens
    await chrome.storage.local.set({
      [CONFIG.STORAGE_KEYS.ACCESS_TOKEN]: accessToken,
      [CONFIG.STORAGE_KEYS.REFRESH_TOKEN]: refreshToken,
      [CONFIG.STORAGE_KEYS.EXPIRES_AT]: expiresAt,
    });

    console.log('💾 Token 已存储');
    console.log('⏰ Token 过期时间:', new Date(expiresAt).toLocaleString());

    // 3. 获取并存储用户信息
    const userInfo = await fetchUserInfo(accessToken);
    if (userInfo) {
      await chrome.storage.local.set({
        [CONFIG.STORAGE_KEYS.USER_INFO]: userInfo,
      });
      console.log('✅ 登录成功:', userInfo.email);
      return { success: true, user: userInfo };
    } else {
      throw new Error('获取用户信息失败');
    }
  } catch (error) {
    console.error('❌ 处理认证成功失败:', error);
    throw error;
  }
}

/**
 * 获取用户信息
 */
async function fetchUserInfo(accessToken) {
  try {
    console.log('📡 获取用户信息...');

    const response = await fetch(CONFIG.API_USER_PROFILE, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      console.error('❌ 获取用户信息失败:', response.status);
      return null;
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
    return null;
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
      console.error('❌ Token 刷新失败，需要重新登录');
      await logout();
      return null;
    }

    const data = await response.json();
    const newAccessToken = data.access_token;
    const newRefreshToken = data.refresh_token;
    const newExpiresIn = data.expires_in || 3600;
    const newExpiresAt = Date.now() + newExpiresIn * 1000;

    // 5. 更新存储
    await chrome.storage.local.set({
      [CONFIG.STORAGE_KEYS.ACCESS_TOKEN]: newAccessToken,
      [CONFIG.STORAGE_KEYS.REFRESH_TOKEN]: newRefreshToken,
      [CONFIG.STORAGE_KEYS.EXPIRES_AT]: newExpiresAt,
    });

    console.log('✅ Token 刷新成功');
    return newAccessToken;
  } catch (error) {
    console.error('❌ 获取有效 Token 异常:', error);
    return null;
  }
}

/**
 * 登出
 */
async function logout() {
  try {
    console.log('👋 登出中...');

    // 清除存储的认证信息
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
// (保持原有的视频下载功能不变...)
// 这里省略,因为太长了,你的原代码中有完整实现

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
});

console.log('✅ Background Service Worker 初始化完成 (网站中转 OAuth)');
