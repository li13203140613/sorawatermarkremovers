/**
 * OAuth 认证模块
 * 处理 Supabase OAuth 登录、Token 管理和刷新
 */

import {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  API_BASE_URL,
  STORAGE_KEYS,
  AUTH_PROVIDERS,
} from './config.js';

/**
 * 使用 OAuth 登录
 * @param {string} provider - 认证提供商 ('google' | 'github')
 * @returns {Promise<{success: boolean, user?: object, error?: string}>}
 */
export async function loginWithOAuth(provider = AUTH_PROVIDERS.GOOGLE) {
  try {
    console.log(`🔐 开始 ${provider} OAuth 登录流程...`);

    // 1. 获取扩展的 redirect URI
    const redirectUri = chrome.identity.getRedirectURL();
    console.log('📍 Redirect URI:', redirectUri);

    // 2. 构建 Supabase OAuth URL
    const authUrl =
      `${SUPABASE_URL}/auth/v1/authorize?` +
      `provider=${provider}&` +
      `redirect_to=${encodeURIComponent(redirectUri)}`;

    console.log('🌐 打开授权窗口...');

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

          console.log('✅ 授权成功，解析 Token...');

          try {
            // 4. 从 redirect URL 中提取 tokens
            // 格式: https://xxx.chromiumapp.org/#access_token=yyy&refresh_token=zzz&expires_in=3600
            const hashParams = redirectUrl.split('#')[1];
            if (!hashParams) {
              throw new Error('无效的授权响应格式');
            }

            const params = new URLSearchParams(hashParams);
            const accessToken = params.get('access_token');
            const refreshToken = params.get('refresh_token');
            const expiresIn = parseInt(params.get('expires_in') || '3600');

            if (!accessToken) {
              throw new Error('未获取到 access_token');
            }

            // 5. 计算过期时间
            const expiresAt = Date.now() + expiresIn * 1000;

            // 6. 存储 tokens
            await chrome.storage.local.set({
              [STORAGE_KEYS.ACCESS_TOKEN]: accessToken,
              [STORAGE_KEYS.REFRESH_TOKEN]: refreshToken,
              [STORAGE_KEYS.EXPIRES_AT]: expiresAt,
            });

            console.log('💾 Token 已存储');
            console.log('⏰ Token 过期时间:', new Date(expiresAt).toLocaleString());

            // 7. 获取并存储用户信息
            const userInfo = await fetchUserInfo(accessToken);
            if (userInfo) {
              await chrome.storage.local.set({
                [STORAGE_KEYS.USER_INFO]: userInfo,
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
 * @returns {Promise<string|null>}
 */
export async function getValidAccessToken() {
  try {
    // 1. 从存储中读取 tokens
    const storage = await chrome.storage.local.get([
      STORAGE_KEYS.ACCESS_TOKEN,
      STORAGE_KEYS.REFRESH_TOKEN,
      STORAGE_KEYS.EXPIRES_AT,
    ]);

    const accessToken = storage[STORAGE_KEYS.ACCESS_TOKEN];
    const refreshToken = storage[STORAGE_KEYS.REFRESH_TOKEN];
    const expiresAt = storage[STORAGE_KEYS.EXPIRES_AT];

    if (!accessToken) {
      console.log('ℹ️ 未登录');
      return null;
    }

    // 2. 检查 token 是否即将过期（提前 5 分钟刷新）
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;

    if (now < expiresAt - fiveMinutes) {
      // Token 还有效
      console.log('✅ Token 有效');
      return accessToken;
    }

    // 3. Token 即将过期，尝试刷新
    console.log('🔄 Token 即将过期，刷新中...');

    if (!refreshToken) {
      console.error('❌ 没有 refresh_token，需要重新登录');
      await logout();
      return null;
    }

    // 4. 调用 Supabase 刷新 Token API
    const response = await fetch(
      `${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: SUPABASE_ANON_KEY,
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
      [STORAGE_KEYS.ACCESS_TOKEN]: newAccessToken,
      [STORAGE_KEYS.REFRESH_TOKEN]: newRefreshToken,
      [STORAGE_KEYS.EXPIRES_AT]: newExpiresAt,
    });

    console.log('✅ Token 刷新成功');
    console.log('⏰ 新的过期时间:', new Date(newExpiresAt).toLocaleString());

    return newAccessToken;
  } catch (error) {
    console.error('❌ 获取 Token 异常:', error);
    return null;
  }
}

/**
 * 获取用户信息
 * @param {string} token - Access Token
 * @returns {Promise<object|null>}
 */
async function fetchUserInfo(token) {
  try {
    console.log('📡 获取用户信息...');

    // 1. 调用你的 API 获取完整信息（积分、头像等）
    const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error('❌ 获取用户信息失败:', response.status);

      // 如果 API 失败，尝试直接从 Supabase 获取基本信息
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
    // 降级到基本信息
    return await fetchBasicUserInfo(token);
  }
}

/**
 * 从 Supabase 获取基本用户信息（降级方案）
 * @param {string} token - Access Token
 * @returns {Promise<object|null>}
 */
async function fetchBasicUserInfo(token) {
  try {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: SUPABASE_ANON_KEY,
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
      credits: 0, // 无法获取积分，默认 0
    };
  } catch (error) {
    console.error('❌ 获取基本用户信息失败:', error);
    return null;
  }
}

/**
 * 登出
 * @returns {Promise<void>}
 */
export async function logout() {
  try {
    console.log('👋 登出中...');

    // 清除所有认证相关的存储
    await chrome.storage.local.remove([
      STORAGE_KEYS.ACCESS_TOKEN,
      STORAGE_KEYS.REFRESH_TOKEN,
      STORAGE_KEYS.EXPIRES_AT,
      STORAGE_KEYS.USER_INFO,
    ]);

    console.log('✅ 已登出');
  } catch (error) {
    console.error('❌ 登出失败:', error);
  }
}

/**
 * 获取用户信息（用于 Popup 显示）
 * @returns {Promise<{success: boolean, isLoggedIn: boolean, user?: object, error?: string}>}
 */
export async function getUserInfo() {
  try {
    // 1. 获取有效的 Access Token
    const token = await getValidAccessToken();

    if (!token) {
      // 未登录
      return {
        success: true,
        isLoggedIn: false,
        credits: 1, // 访客默认 1 次
      };
    }

    // 2. 从缓存读取用户信息
    const storage = await chrome.storage.local.get([STORAGE_KEYS.USER_INFO]);
    let userInfo = storage[STORAGE_KEYS.USER_INFO];

    // 3. 如果缓存不存在，重新获取
    if (!userInfo) {
      console.log('🔄 缓存不存在，重新获取用户信息...');
      userInfo = await fetchUserInfo(token);

      if (userInfo) {
        await chrome.storage.local.set({
          [STORAGE_KEYS.USER_INFO]: userInfo,
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
