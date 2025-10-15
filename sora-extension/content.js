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

  // 添加内联样式，确保按钮显示正确
  button.style.cssText = `
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 8px 16px;
    border-radius: 20px;
    border: none;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-left: 8px;
    transition: all 0.2s ease;
  `;

  button.innerHTML = `
    <svg class="sora-extension-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
      <polyline points="7 10 12 15 17 10"></polyline>
      <line x1="12" y1="15" x2="12" y2="3"></line>
    </svg>
    <span class="sora-extension-text">Remove Watermark</span>
  `;

  // 添加悬停效果
  button.onmouseenter = () => {
    button.style.opacity = '0.9';
    button.style.transform = 'scale(1.05)';
  };

  button.onmouseleave = () => {
    if (!button.disabled) {
      button.style.opacity = '1';
      button.style.transform = 'scale(1)';
    }
  };

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

// Modal Manager - 专业级模态框管理
class ModalManager {
  static createModal(content, className = '') {
    const modal = document.createElement('div');
    modal.className = `sora-modal ${className}`;
    modal.innerHTML = `
      <div class="sora-modal-backdrop"></div>
      <div class="sora-modal-container">
        <div class="sora-modal-content">
          ${content}
        </div>
      </div>
    `;

    // 添加样式
    if (!document.getElementById('sora-modal-styles')) {
      const style = document.createElement('style');
      style.id = 'sora-modal-styles';
      style.textContent = `
        .sora-modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 999999;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: modalFadeIn 0.2s ease-out;
        }

        .sora-modal-backdrop {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
        }

        .sora-modal-container {
          position: relative;
          max-width: 420px;
          width: 90%;
          animation: modalSlideUp 0.3s ease-out;
        }

        .sora-modal-content {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .sora-modal-header {
          display: flex;
          align-items: center;
          margin-bottom: 16px;
        }

        .sora-modal-icon {
          width: 48px;
          height: 48px;
          margin-right: 16px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .sora-modal-title {
          font-size: 20px;
          font-weight: 600;
          color: #1a1a1a;
        }

        .sora-modal-body {
          color: #666;
          line-height: 1.6;
          margin-bottom: 20px;
        }

        .sora-modal-buttons {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }

        .sora-modal-btn {
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
          font-size: 14px;
        }

        .sora-modal-btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .sora-modal-btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        @keyframes modalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes modalSlideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .credits-info {
          background: #fef3c7;
          border: 1px solid #fcd34d;
          border-radius: 8px;
          padding: 12px;
          margin: 16px 0;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .credits-number {
          font-size: 24px;
          font-weight: bold;
          color: #d97706;
        }
      `;
      document.head.appendChild(style);
    }

    return modal;
  }

  static createLoginModal() {
    const content = `
      <div class="sora-modal-header">
        <div class="sora-modal-icon" style="background: #fef3c7;">
          <svg width="24" height="24" fill="none" stroke="#d97706" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 6v6l4 2"/>
          </svg>
        </div>
        <div class="sora-modal-title">Login Required</div>
      </div>
      <div class="sora-modal-body">
        Please log in through the extension popup to download videos without watermarks.
        <br><br>
        Click the extension icon in your browser toolbar and log in from there.
      </div>
      <div class="sora-modal-buttons">
        <button class="sora-modal-btn sora-modal-btn-primary" id="sora-modal-close-btn">
          Got it
        </button>
      </div>
    `;

    const modal = this.createModal(content, 'sora-login-modal');

    // 绑定关闭按钮事件
    setTimeout(() => {
      const closeBtn = modal.querySelector('#sora-modal-close-btn');
      if (closeBtn) {
        closeBtn.onclick = () => modal.remove();
      }

      // 点击背景也可以关闭
      const backdrop = modal.querySelector('.sora-modal-backdrop');
      if (backdrop) {
        backdrop.onclick = () => modal.remove();
      }
    }, 0);

    return modal;
  }

  static createCreditsModal(currentCredits) {
    const content = `
      <div class="sora-modal-header">
        <div class="sora-modal-icon" style="background: #fee2e2;">
          <svg width="24" height="24" fill="none" stroke="#ef4444" stroke-width="2">
            <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
        </div>
        <div class="sora-modal-title">Insufficient Credits</div>
      </div>
      <div class="sora-modal-body">
        You don't have enough credits to download this video.
        <div class="credits-info">
          <svg width="20" height="20" fill="#d97706">
            <circle cx="10" cy="10" r="10" opacity="0.2"/>
            <text x="10" y="14" text-anchor="middle" font-size="12" font-weight="bold">C</text>
          </svg>
          <div>
            <div style="font-size: 12px; color: #92400e;">Current Balance</div>
            <div class="credits-number">${currentCredits}</div>
          </div>
        </div>
        Please recharge through the extension popup.
        <br><br>
        Click the extension icon in your browser toolbar to purchase more credits.
      </div>
      <div class="sora-modal-buttons">
        <button class="sora-modal-btn sora-modal-btn-primary" id="sora-credits-close-btn">
          Got it
        </button>
      </div>
    `;

    const modal = this.createModal(content, 'sora-credits-modal');

    // 绑定关闭按钮事件
    setTimeout(() => {
      const closeBtn = modal.querySelector('#sora-credits-close-btn');
      if (closeBtn) {
        closeBtn.onclick = () => modal.remove();
      }

      // 点击背景也可以关闭
      const backdrop = modal.querySelector('.sora-modal-backdrop');
      if (backdrop) {
        backdrop.onclick = () => modal.remove();
      }
    }, 0);

    return modal;
  }
}

// Toast Manager - 专业级消息提示
class ToastManager {
  static showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `sora-toast sora-toast-${type}`;

    const icons = {
      success: '<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>',
      error: '<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="10" cy="10" r="9"/><path d="M10 6v4m0 4h.01"/></svg>',
      credits: '<svg width="20" height="20" fill="currentColor"><circle cx="10" cy="10" r="10" opacity="0.3"/><text x="10" y="14" text-anchor="middle" font-size="12" font-weight="bold">C</text></svg>'
    };

    toast.innerHTML = `
      <div class="sora-toast-icon">${icons[type] || icons.success}</div>
      <div class="sora-toast-message">${message}</div>
    `;

    // 添加样式
    if (!document.getElementById('sora-toast-styles')) {
      const style = document.createElement('style');
      style.id = 'sora-toast-styles';
      style.textContent = `
        .sora-toast {
          position: fixed;
          top: 20px;
          right: 20px;
          background: white;
          border-radius: 12px;
          padding: 12px 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
          z-index: 1000000;
          animation: toastSlideIn 0.3s ease-out;
          max-width: 360px;
        }

        .sora-toast-icon {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 50%;
        }

        .sora-toast-success .sora-toast-icon {
          background: #d4edda;
          color: #155724;
        }

        .sora-toast-error .sora-toast-icon {
          background: #f8d7da;
          color: #721c24;
        }

        .sora-toast-credits .sora-toast-icon {
          background: #fef3c7;
          color: #d97706;
        }

        .sora-toast-message {
          flex: 1;
          font-size: 14px;
          color: #333;
          line-height: 1.4;
        }

        @keyframes toastSlideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes toastSlideOut {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(toast);

    // 自动移除
    setTimeout(() => {
      toast.style.animation = 'toastSlideOut 0.3s ease-out';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  static showSuccessToast(message) {
    this.showToast(message, 'success');
  }

  static showErrorToast(message) {
    this.showToast(message, 'error');
  }

  static showCreditsToast(oldCredits, newCredits) {
    this.showToast(
      `Download successful! Credits: ${oldCredits} → ${newCredits}`,
      'credits',
      4000
    );
  }
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
      button.style.opacity = '0.6';
      button.style.cursor = 'not-allowed';
      if (iconElement) {
        iconElement.style.animation = 'spin 1s linear infinite';
      }
      if (textElement) textElement.textContent = 'Processing...';

      // 添加旋转动画
      if (!document.getElementById('sora-spin-style')) {
        const style = document.createElement('style');
        style.id = 'sora-spin-style';
        style.textContent = `
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `;
        document.head.appendChild(style);
      }
      break;

    case 'success':
      button.disabled = true;
      button.style.background = '#4CAF50';
      if (iconElement) iconElement.style.animation = '';
      if (textElement) textElement.textContent = '✓ Downloaded';

      // 3 秒后恢复
      setTimeout(() => {
        button.disabled = false;
        button.style.opacity = '1';
        button.style.cursor = 'pointer';
        button.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        if (textElement) textElement.textContent = 'Remove Watermark';
      }, 3000);
      break;

    case 'error':
      button.disabled = true;
      button.style.background = '#f44336';
      if (iconElement) iconElement.style.animation = '';
      if (textElement) textElement.textContent = message || 'Failed';

      // 5 秒后恢复
      setTimeout(() => {
        button.disabled = false;
        button.style.opacity = '1';
        button.style.cursor = 'pointer';
        button.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        if (textElement) textElement.textContent = 'Remove Watermark';
      }, 5000);
      break;

    default:
      button.disabled = false;
      button.style.opacity = '1';
      button.style.cursor = 'pointer';
      button.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      if (iconElement) iconElement.style.animation = '';
      if (textElement) textElement.textContent = 'Remove Watermark';
  }
}

// 处理下载按钮点击 - 世界级的实现
async function handleDownloadClick(e) {
  e.preventDefault();
  e.stopPropagation();

  console.log('🎯 下载按钮被点击');

  try {
    // 检查 chrome.runtime 是否可用
    if (!chrome || !chrome.runtime || !chrome.runtime.sendMessage) {
      console.error('❌ Chrome runtime 不可用');
      ToastManager.showErrorToast('Extension error. Please reload the page.');
      updateButtonState('error', 'Extension Error');
      return;
    }

    // Step 1: 获取用户登录状态和积分信息
    console.log('🔍 检查用户状态...');

    let userInfo;
    try {
      userInfo = await chrome.runtime.sendMessage({
        action: 'getUserInfo'
      });
      console.log('👤 用户信息:', userInfo);
    } catch (error) {
      console.error('❌ 获取用户信息失败:', error);
      userInfo = { isLoggedIn: false, credits: 0 };
    }

    // Step 2: 检查登录状态
    if (!userInfo || !userInfo.isLoggedIn) {
      console.log('⚠️ 用户未登录，显示登录提示');

      // 显示登录模态框
      const loginModal = ModalManager.createLoginModal();
      document.body.appendChild(loginModal);

      return;
    }

    // Step 3: 检查积分是否充足（必须以数据库为准）
    const currentCredits = userInfo.credits;
    console.log('💰 当前积分（数据库）:', currentCredits);

    // 如果积分为 null 或 undefined，说明数据库查询失败
    if (currentCredits === null || currentCredits === undefined) {
      console.error('❌ 无法获取积分信息');
      ToastManager.showErrorToast('Failed to retrieve credits. Please try again.');
      updateButtonState('error', 'Credits Error');
      return;
    }

    // 检查积分是否充足
    if (currentCredits < 1) {
      console.log('⚠️ 积分不足，显示充值提示');

      // 显示积分不足模态框
      const creditsModal = ModalManager.createCreditsModal(currentCredits);
      document.body.appendChild(creditsModal);

      return;
    }

    // Step 4: 提取视频链接
    const shareLink = extractVideoLink();
    console.log('📎 视频链接:', shareLink);

    if (!shareLink) {
      console.error('❌ 无法提取视频链接');
      ToastManager.showErrorToast('Failed to extract video link');
      updateButtonState('error', 'Link Error');
      return;
    }

    // Step 5: 开始下载
    updateButtonState('loading');
    console.log('🚀 开始下载视频...');

    // 发送下载请求到 background script
    const response = await chrome.runtime.sendMessage({
      action: 'downloadVideo',
      shareLink: shareLink,
    });

    if (response && response.success) {
      console.log('✅ 下载成功');

      // 使用服务器返回的真实积分余额
      const newCredits = response.creditsRemaining !== undefined
        ? response.creditsRemaining
        : currentCredits - 1;

      console.log('💰 积分变化:', currentCredits, '→', newCredits);

      // 显示成功提示，包含积分变化
      ToastManager.showCreditsToast(currentCredits, newCredits);

      updateButtonState('success');

      // 通知扩展刷新积分显示
      setTimeout(() => {
        chrome.runtime.sendMessage({
          action: 'creditsUpdated',
          credits: newCredits
        });
      }, 500);

    } else {
      console.error('❌ 下载失败:', response?.error || '未知错误');

      // 根据错误类型显示不同的提示
      const errorMessage = response?.error || 'Download failed';

      if (errorMessage.includes('积分') || errorMessage.includes('credits')) {
        // 积分相关错误，显示充值模态框
        const creditsModal = ModalManager.createCreditsModal(currentCredits);
        document.body.appendChild(creditsModal);
      } else {
        // 其他错误，显示错误提示
        ToastManager.showErrorToast(errorMessage);
      }

      updateButtonState('error', 'Failed');
    }

  } catch (error) {
    console.error('❌ 处理下载时发生错误:', error);
    ToastManager.showErrorToast(error.message || 'An error occurred');
    updateButtonState('error', 'Error');
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
