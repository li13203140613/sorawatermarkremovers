/**
 * Sora Video Downloader - Content Script
 * 注入到 Sora 视频页面，添加下载按钮
 */

console.log('🎬 Sora Video Downloader 扩展已加载');

// 配置
const CONFIG = {
  BUTTON_ID: 'sora-extension-download-btn',
  RETRY_ATTEMPTS: 10,
  RETRY_DELAY: 500, // ms
};

// 检查是否是 Sora 视频页面
function isSoraVideoPage() {
  const url = window.location.href;
  // 支持多种 URL 格式：/p/xxx 或 /s/xxx 或其他
  return url.includes('sora.chatgpt.com') &&
         (url.includes('/p/') || url.includes('/s/') || url.match(/sora\.chatgpt\.com\/[a-z]\/[a-zA-Z0-9_-]+/));
}

// 提取视频分享链接
function extractVideoLink() {
  const url = window.location.href;

  // 验证 URL 格式 - 更宽松的匹配
  if (!url.includes('sora.chatgpt.com')) {
    throw new Error('无效的 Sora 视频页面');
  }

  return url;
}

// 查找按钮容器（操作按钮所在的父容器）
function findButtonContainer() {
  // 尝试多种选择器，提高兼容性
  const selectors = [
    // 方案1：直接通过 class 查找（Sora 实际使用的）
    'div.flex.w-fit.items-center.justify-end.gap-2',
    // 方案2：更灵活的 class 匹配
    'div[class*="flex"][class*="items-center"][class*="gap-"]',
    // 方案3：查找包含多个按钮的 flex 容器
    'div.flex',
  ];

  for (const selector of selectors) {
    const elements = document.querySelectorAll(selector);
    for (const element of elements) {
      // 检查是否包含多个按钮（至少 3 个）
      const buttons = element.querySelectorAll(':scope > button');
      if (buttons.length >= 3) {
        console.log('✅ 找到按钮容器:', element);
        console.log('✅ 容器 class:', element.className);
        console.log('✅ 按钮数量:', buttons.length);
        return element;
      }
    }
  }

  console.warn('⚠️ 未找到按钮容器');
  return null;
}

// 检查按钮是否已注入
function isButtonInjected() {
  return document.getElementById(CONFIG.BUTTON_ID) !== null;
}

// 创建下载按钮
function createDownloadButton() {
  const button = document.createElement('button');
  button.id = CONFIG.BUTTON_ID;
  button.className = 'sora-extension-btn';
  button.innerHTML = `
    <svg class="sora-extension-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
      <polyline points="7 10 12 15 17 10"></polyline>
      <line x1="12" y1="15" x2="12" y2="3"></line>
    </svg>
    <span class="sora-extension-text">下载</span>
  `;

  button.onclick = handleDownloadClick;

  return button;
}

// 注入下载按钮
function injectDownloadButton() {
  // 检查是否已注入
  if (isButtonInjected()) {
    console.log('✅ 按钮已存在，跳过注入');
    return true;
  }

  // 查找按钮容器
  const container = findButtonContainer();
  if (!container) {
    return false;
  }

  // 创建并插入按钮
  const button = createDownloadButton();
  container.appendChild(button);

  console.log('✅ 下载按钮已注入');
  return true;
}

// 更新按钮状态
function updateButtonState(state, message = '') {
  const button = document.getElementById(CONFIG.BUTTON_ID);
  if (!button) return;

  const textElement = button.querySelector('.sora-extension-text');
  const iconElement = button.querySelector('.sora-extension-icon');

  switch (state) {
    case 'loading':
      button.disabled = true;
      button.className = 'sora-extension-btn loading';
      if (iconElement) iconElement.classList.add('spin');
      if (textElement) textElement.textContent = '处理中...';
      break;

    case 'success':
      button.disabled = true;
      button.className = 'sora-extension-btn success';
      if (iconElement) iconElement.classList.remove('spin');
      if (textElement) textElement.textContent = '✓ 已下载';

      // 3 秒后恢复
      setTimeout(() => {
        button.disabled = false;
        button.className = 'sora-extension-btn';
        if (textElement) textElement.textContent = '下载';
      }, 3000);
      break;

    case 'error':
      button.disabled = true;
      button.className = 'sora-extension-btn error';
      if (iconElement) iconElement.classList.remove('spin');
      if (textElement) textElement.textContent = message || '下载失败';

      // 5 秒后恢复
      setTimeout(() => {
        button.disabled = false;
        button.className = 'sora-extension-btn';
        if (textElement) textElement.textContent = '下载';
      }, 5000);
      break;

    default:
      button.disabled = false;
      button.className = 'sora-extension-btn';
      if (iconElement) iconElement.classList.remove('spin');
      if (textElement) textElement.textContent = '下载';
  }
}

// 处理下载按钮点击
async function handleDownloadClick(e) {
  e.preventDefault();
  e.stopPropagation();

  console.log('🎯 下载按钮被点击');

  try {
    // 检查 chrome.runtime 是否可用
    if (!chrome || !chrome.runtime || !chrome.runtime.sendMessage) {
      console.error('❌ Chrome runtime 不可用');
      updateButtonState('error', 'Extension 错误');
      return;
    }

    // 提取视频链接
    const shareLink = extractVideoLink();
    console.log('📎 视频链接:', shareLink);

    if (!shareLink) {
      console.error('❌ 无法提取视频链接');
      updateButtonState('error', '链接提取失败');
      return;
    }

    // 更新按钮状态为加载中
    updateButtonState('loading');

    // 发送消息到 background script
    const response = await chrome.runtime.sendMessage({
      action: 'downloadVideo',
      shareLink: shareLink,
    });

    if (response && response.success) {
      console.log('✅ 下载成功');
      updateButtonState('success');
    } else {
      console.error('❌ 下载失败:', response?.error || '未知错误');
      updateButtonState('error', response?.error || '下载失败');
    }

  } catch (error) {
    console.error('❌ 处理下载时发生错误:', error);
    updateButtonState('error', error.message || '处理失败');
  }
}

// 尝试注入按钮（带重试机制）
function tryInjectButton(attempt = 1) {
  if (!isSoraVideoPage()) {
    console.log('⚠️ 不是 Sora 视频页面，跳过注入');
    return;
  }

  const success = injectDownloadButton();

  if (!success && attempt < CONFIG.RETRY_ATTEMPTS) {
    console.log(`🔄 第 ${attempt} 次注入失败，${CONFIG.RETRY_DELAY}ms 后重试...`);
    setTimeout(() => {
      tryInjectButton(attempt + 1);
    }, CONFIG.RETRY_DELAY);
  } else if (!success) {
    console.error('❌ 注入按钮失败，已达最大重试次数');
  }
}

// 监听 DOM 变化（处理 SPA 路由变化）
function observeDOMChanges() {
  let lastUrl = window.location.href;

  const observer = new MutationObserver(() => {
    const currentUrl = window.location.href;

    // URL 变化时重新检查
    if (currentUrl !== lastUrl) {
      console.log('🔄 URL 变化:', currentUrl);
      lastUrl = currentUrl;

      // 移除旧按钮
      const oldButton = document.getElementById(CONFIG.BUTTON_ID);
      if (oldButton) {
        oldButton.remove();
      }

      // 尝试注入新按钮
      setTimeout(() => {
        tryInjectButton();
      }, 1000);
    }

    // 定期检查按钮是否存在
    if (isSoraVideoPage() && !isButtonInjected()) {
      tryInjectButton();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  console.log('👀 DOM 监听已启动');
}

// 初始化
function init() {
  console.log('🚀 初始化扩展...');

  // 等待页面完全加载
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(tryInjectButton, 1000);
      observeDOMChanges();
    });
  } else {
    setTimeout(tryInjectButton, 1000);
    observeDOMChanges();
  }
}

// 启动
init();
