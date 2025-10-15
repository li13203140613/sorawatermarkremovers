/**
 * Sora Video Downloader - Popup Script
 * 显示用户信息和积分状态
 */

console.log('🎬 Popup 页面已加载');

// DOM 元素
const loadingState = document.getElementById('loading-state');
const guestState = document.getElementById('guest-state');
const userState = document.getElementById('user-state');
const errorState = document.getElementById('error-state');

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', async () => {
  console.log('📋 初始化 Popup');
  await loadUserInfo();
});

/**
 * 加载用户信息
 */
async function loadUserInfo() {
  try {
    showState('loading');

    // 通过 background script 获取用户信息
    const response = await chrome.runtime.sendMessage({
      action: 'getUserInfo'
    });

    if (!response || !response.success) {
      throw new Error(response?.error || '获取用户信息失败');
    }

    if (response.isLoggedIn) {
      // 已登录用户
      console.log('✅ 已登录:', response);
      displayLoggedInUser(response);
    } else {
      // 访客用户
      console.log('ℹ️ 访客模式:', response);
      displayGuestUser(response);
    }

  } catch (error) {
    console.error('❌ 加载用户信息失败:', error);
    showError('加载失败: ' + error.message);
  }
}

/**
 * 显示已登录用户信息
 */
function displayLoggedInUser(data) {
  document.getElementById('user-name').textContent = data.name || '用户';
  document.getElementById('user-email').textContent = data.email || '-';

  // 显示数据库积分，如果查询失败则显示 "null"
  const creditsElement = document.getElementById('user-credits');
  if (data.credits === null || data.credits === undefined) {
    creditsElement.textContent = 'null';
    creditsElement.style.color = '#999'; // 灰色表示未查询到
  } else {
    creditsElement.textContent = data.credits;
    creditsElement.style.color = ''; // 恢复默认颜色
  }

  // 设置用户头像
  const avatarContainer = document.getElementById('user-avatar');
  if (data.avatarUrl) {
    avatarContainer.innerHTML = `<img src="${data.avatarUrl}" alt="Avatar" />`;
  } else {
    // 默认头像（首字母）
    const initial = (data.name || 'U')[0].toUpperCase();
    avatarContainer.innerHTML = `
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="24" fill="#4CAF50"/>
        <text x="24" y="30" text-anchor="middle" fill="white" font-size="20" font-weight="600">
          ${initial}
        </text>
      </svg>
    `;
  }

  showState('user');
}

/**
 * 显示访客用户信息（未登录状态）
 */
function displayGuestUser(data) {
  // 显示登录界面（不再显示访客积分）
  showState('guest');
}

/**
 * 切换显示状态
 */
function showState(state) {
  loadingState.style.display = 'none';
  guestState.style.display = 'none';
  userState.style.display = 'none';
  errorState.style.display = 'none';

  switch (state) {
    case 'loading':
      loadingState.style.display = 'flex';
      break;
    case 'guest':
      guestState.style.display = 'flex';
      break;
    case 'user':
      userState.style.display = 'flex';
      break;
    case 'error':
      errorState.style.display = 'flex';
      break;
  }
}

/**
 * 显示错误信息
 */
function showError(message) {
  document.getElementById('error-message').textContent = message;
  showState('error');
}

// ========== 事件监听 ==========

// Google 登录按钮
document.getElementById('login-google')?.addEventListener('click', async () => {
  const button = document.getElementById('login-google');
  console.log('🔐 点击 Google 登录');

  // 禁用按钮并显示加载状态
  button.disabled = true;
  const originalText = button.innerHTML;
  button.innerHTML = '<span>登录中...</span>';

  try {
    // 发送登录消息到 background script
    const response = await chrome.runtime.sendMessage({
      action: 'login',
      provider: 'google',
    });

    if (response && response.success) {
      console.log('✅ 登录成功');
      // 等待 1 秒后重新加载用户信息
      setTimeout(() => {
        loadUserInfo();
      }, 1000);
    } else {
      throw new Error(response?.error || '登录失败');
    }
  } catch (error) {
    console.error('❌ 登录失败:', error);
    alert('登录失败: ' + error.message);
    // 恢复按钮状态
    button.disabled = false;
    button.innerHTML = originalText;
  }
});

// 登出按钮
document.getElementById('logout-button')?.addEventListener('click', async () => {
  if (confirm('确定要登出吗？')) {
    console.log('👋 登出');
    try {
      await chrome.runtime.sendMessage({ action: 'logout' });
      // 重新加载，显示登录界面
      loadUserInfo();
    } catch (error) {
      console.error('❌ 登出失败:', error);
    }
  }
});

// 充值按钮点击
document.getElementById('recharge-button')?.addEventListener('click', () => {
  chrome.tabs.create({ url: 'https://www.sora-prompt.io/pricing' });
});

// 重试按钮点击
document.getElementById('retry-button')?.addEventListener('click', () => {
  loadUserInfo();
});

console.log('✅ Popup 初始化完成');
