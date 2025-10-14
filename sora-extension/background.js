/**
 * Sora Video Downloader - Background Service Worker
 * 处理 API 调用和下载管理
 */

console.log('🎬 Sora Video Downloader Background Service 已启动');

// 配置
const CONFIG = {
  // 开发环境：使用本地 API
  // 生产环境：使用线上 API
  // API_URL: 'http://localhost:3000/api/video/process',  // 本地开发环境
  API_URL: 'https://www.sora-prompt.io/api/video/process',  // 生产环境
  API_TIMEOUT: 30000, // 30 秒超时
  VISITOR_ID_KEY: 'sora_extension_visitor_id',
};

/**
 * 生成 UUID v4
 */
function generateUUID() {
  return crypto.randomUUID();
}

/**
 * 获取或创建 visitorId
 */
async function getOrCreateVisitorId() {
  try {
    const result = await chrome.storage.local.get([CONFIG.VISITOR_ID_KEY]);

    if (result[CONFIG.VISITOR_ID_KEY]) {
      console.log('📝 使用已存在的 visitorId:', result[CONFIG.VISITOR_ID_KEY]);
      return result[CONFIG.VISITOR_ID_KEY];
    }

    // 生成新的 visitorId
    const visitorId = generateUUID();
    await chrome.storage.local.set({ [CONFIG.VISITOR_ID_KEY]: visitorId });

    console.log('🆕 创建新的 visitorId:', visitorId);
    return visitorId;
  } catch (error) {
    console.error('❌ 获取 visitorId 失败:', error);
    // 降级方案：使用临时 UUID
    return generateUUID();
  }
}

/**
 * 获取 Supabase Auth Cookie（检测登录状态）
 */
async function getSupabaseAuthCookie() {
  try {
    // 生产环境：从线上读取
    const cookie = await chrome.cookies.get({
      url: 'https://www.sora-prompt.io',
      name: 'sb-zjefhzapfbouslkgllah-auth-token'
    });

    if (cookie && cookie.value) {
      console.log('✅ 检测到登录状态');
      return cookie.value;
    }

    console.log('ℹ️ 未登录状态');
    return null;
  } catch (error) {
    console.error('❌ 读取 Auth Cookie 失败:', error);
    return null;
  }
}

/**
 * 获取访客积分 Cookie（未登录用户）
 */
async function getVisitorCreditsCookie() {
  try {
    const cookie = await chrome.cookies.get({
      url: 'https://www.sora-prompt.io',
      name: 'visitor_credits'
    });

    if (cookie && cookie.value) {
      const credits = JSON.parse(decodeURIComponent(cookie.value));
      console.log('📝 访客积分:', credits);
      return credits;
    }

    return null;
  } catch (error) {
    console.error('❌ 读取访客积分失败:', error);
    return null;
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
    // 1. 读取 Auth Cookie（检测登录状态）
    const authCookie = await getSupabaseAuthCookie();

    // 2. 构建请求头
    const headers = {
      'Content-Type': 'application/json',
    };

    // 3. 如果已登录，携带 Cookie
    if (authCookie) {
      headers['Cookie'] = `sb-zjefhzapfbouslkgllah-auth-token=${authCookie}`;
      console.log('🔐 使用登录状态调用 API');
    } else {
      console.log('👤 使用访客状态调用 API');
    }

    const response = await fetch(CONFIG.API_URL, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        shareLink: shareLink,
        visitorId: visitorId,
      }),
      signal: controller.signal,
      credentials: 'include', // 允许携带 Cookie
    });

    clearTimeout(timeoutId);

    // 解析响应
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

    // 解析错误信息
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

  // 生成文件名（时间戳格式）
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
      saveAs: false, // 自动保存到默认下载目录
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
 * 获取用户信息（用于 Popup 显示）
 */
async function getUserInfo() {
  try {
    // 1. 读取 Auth Cookie
    const authCookie = await getSupabaseAuthCookie();

    if (!authCookie) {
      // 未登录 - 返回访客信息
      const visitorCredits = await getVisitorCreditsCookie();
      return {
        success: true,
        isLoggedIn: false,
        credits: visitorCredits?.credits || 1,
      };
    }

    // 2. 已登录 - 解析 Token
    const userData = parseAuthToken(authCookie);

    if (!userData) {
      return {
        success: false,
        error: '无法解析用户信息',
      };
    }

    // 3. 调用 API 获取完整用户信息和积分
    let credits = 0;
    let fullName = null;
    let avatarUrl = null;

    try {
      // 调用线上 API
      const response = await fetch('https://www.sora-prompt.io/api/user/profile', {
        method: 'GET',
        credentials: 'include', // 自动携带同域 Cookie
      });

      if (response.ok) {
        const data = await response.json();
        credits = data.credits || 0;
        fullName = data.name;
        avatarUrl = data.avatar_url;
        console.log('✅ API 调用成功:', data);
      } else {
        console.warn('⚠️ API 返回错误:', response.status);
      }
    } catch (error) {
      console.warn('⚠️ API 调用失败，使用 Token 中的信息:', error.message);
    }

    // 4. 返回用户信息（优先使用 API 返回的数据）
    return {
      success: true,
      isLoggedIn: true,
      name: fullName || userData.user_metadata?.full_name || userData.email?.split('@')[0] || '用户',
      email: userData.email,
      avatarUrl: avatarUrl || userData.user_metadata?.avatar_url,
      credits: credits,
    };

  } catch (error) {
    console.error('❌ 获取用户信息失败:', error);
    return {
      success: false,
      error: error.message || '获取失败',
    };
  }
}

/**
 * 解析 Supabase Auth Token (JWT)
 */
function parseAuthToken(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = parts[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('解析 Token 失败:', error);
    return null;
  }
}

/**
 * 处理完整的下载流程
 */
async function handleDownload(shareLink) {
  try {
    // 1. 获取 visitorId
    const visitorId = await getOrCreateVisitorId();

    // 2. 调用 API 处理视频
    const processResult = await processVideo(shareLink, visitorId);

    if (!processResult.success) {
      return {
        success: false,
        error: processResult.error,
      };
    }

    // 3. 下载视频
    const downloadResult = await downloadVideo(processResult.videoUrl);

    if (!downloadResult.success) {
      return {
        success: false,
        error: downloadResult.error,
      };
    }

    // 4. 如果需要扣除 Cookie 积分（第二期实现）
    if (processResult.shouldConsumeCredit) {
      console.log('💳 需要扣除 Cookie 积分（第二期实现）');
      // TODO: 实现 Cookie 积分扣除逻辑
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

/**
 * 监听来自 content script 和 popup 的消息
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('📨 收到消息:', request);

  if (request.action === 'downloadVideo') {
    // 异步处理，使用 Promise
    handleDownload(request.shareLink)
      .then(result => {
        console.log('📤 发送响应:', result);
        sendResponse(result);
      })
      .catch(error => {
        console.error('❌ 处理消息时发生错误:', error);
        sendResponse({
          success: false,
          error: error.message || '未知错误',
        });
      });

    // 返回 true 表示异步响应
    return true;
  }

  if (request.action === 'getUserInfo') {
    // 获取用户信息
    getUserInfo()
      .then(result => {
        console.log('📤 发送用户信息:', result);
        sendResponse(result);
      })
      .catch(error => {
        console.error('❌ 获取用户信息失败:', error);
        sendResponse({
          success: false,
          error: error.message || '未知错误',
        });
      });

    return true;
  }
});

/**
 * 监听下载状态变化
 */
chrome.downloads.onChanged.addListener((delta) => {
  if (delta.state) {
    if (delta.state.current === 'complete') {
      console.log('✅ 下载完成，ID:', delta.id);
      // TODO: 可以在这里发送通知给用户
    } else if (delta.state.current === 'interrupted') {
      console.error('❌ 下载中断，ID:', delta.id);
    }
  }

  if (delta.error) {
    console.error('❌ 下载错误:', delta.error.current);
  }
});

/**
 * 扩展安装或更新时的处理
 */
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('🎉 扩展首次安装');
    // 可以在这里打开欢迎页面
  } else if (details.reason === 'update') {
    console.log('🔄 扩展已更新到版本:', chrome.runtime.getManifest().version);
  }
});

console.log('✅ Background Service 初始化完成');
