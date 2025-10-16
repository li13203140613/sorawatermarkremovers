/**
 * Sora 视频页面内容脚本
 * 功能：在视频页面注入"Remove Watermark"按钮
 */

// === 配置 ===
const CONFIG = {
  buttonId: 'sora-remove-watermark-btn',
  checkInterval: 1000,  // 检查间隔（毫秒）
  maxAttempts: 15,      // 最大尝试次数
  debug: true           // 调试模式
}

let attemptCount = 0
let isInjected = false

// === 工具函数 ===
function log(...args) {
  if (CONFIG.debug) {
    console.log('[Sora Extension]', ...args)
  }
}

function isVideoPage() {
  // 根据 URL 判断是否为视频页面
  const url = window.location.href
  const pathname = window.location.pathname

  // Sora 视频页面：https://sora.chatgpt.com/p/s_xxxxx
  return url.includes('sora.chatgpt.com') && pathname.startsWith('/p/')
}

// === 查找注入位置 ===
function findInjectionPoint() {
  log('🔍 开始查找注入位置...')

  // 方案 1：通过 "Remixes" 文字查找（最准确）
  const remixesSpan = [...document.querySelectorAll('span')].find(span => {
    const text = span.textContent?.trim()
    return text === 'Remixes'
  })

  if (remixesSpan) {
    log('✅ 找到 Remixes 元素:', remixesSpan)

    // 获取它的父容器
    const container = remixesSpan.closest('.flex.w-full.items-center.justify-between')

    if (container) {
      log('✅ 找到注入容器:', container.className)
      return container
    }

    // 备选方案：直接返回 span 的父元素
    log('⚠️ 使用备选方案：返回 span 的父元素')
    return remixesSpan.parentElement
  }

  // 方案 2：通过 class 查找容器
  log('⚠️ 未找到 Remixes 元素，尝试通过 class 查找...')
  const containers = document.querySelectorAll('.flex.w-full.items-center.justify-between')

  for (const container of containers) {
    if (container.textContent?.includes('Remixes')) {
      log('✅ 通过 class 找到容器')
      return container
    }
  }

  // 方案 3：查找包含 "Remixes" 的任何容器
  log('⚠️ 尝试查找包含 Remixes 的任何元素...')
  const allElements = document.querySelectorAll('*')

  for (const el of allElements) {
    const text = el.textContent?.trim()
    if (text === 'Remixes' || text?.startsWith('Remixes')) {
      const parent = el.parentElement || el
      log('✅ 找到包含 Remixes 的元素:', parent.className)
      return parent
    }
  }

  log('❌ 未找到合适的注入位置')
  return null
}

// === 创建下载按钮 ===
function createDownloadButton() {
  const button = document.createElement('button')
  button.id = CONFIG.buttonId
  button.className = 'sora-remove-watermark-btn'
  button.setAttribute('type', 'button')

  button.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 16L7 11L8.4 9.6L11 12.2V4H13V12.2L15.6 9.6L17 11L12 16Z" fill="currentColor"/>
      <path d="M5 20H19V18H5V20Z" fill="currentColor"/>
    </svg>
    <span>Remove Watermark</span>
  `

  // 绑定点击事件
  button.addEventListener('click', handleButtonClick)

  log('✅ 按钮创建成功')
  return button
}

// === 处理按钮点击 ===
async function handleButtonClick(event) {
  const button = event.currentTarget

  // 防止重复点击
  if (button.disabled) {
    log('⚠️ 按钮已禁用，忽略点击')
    return
  }

  log('🎬 用户点击下载按钮')

  // 禁用按钮
  button.disabled = true

  // 保存原始内容
  const originalHTML = button.innerHTML

  // 更新为加载状态
  button.innerHTML = `
    <svg class="spinner" width="16" height="16" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" opacity="0.25"/>
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="4" fill="none" stroke-linecap="round"/>
    </svg>
    <span>Processing...</span>
  `
  button.classList.add('loading')

  try {
    // 获取当前视频 URL
    const videoUrl = window.location.href
    log('📹 视频 URL:', videoUrl)

    // 发送消息到 background script
    log('📤 发送下载请求到 background...')

    const response = await new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        {
          action: 'downloadVideo',
          url: videoUrl,
          timestamp: Date.now()
        },
        (response) => {
          if (chrome.runtime.lastError) {
            log('❌ Chrome runtime error:', chrome.runtime.lastError.message)
            reject(new Error(chrome.runtime.lastError.message))
          } else {
            log('📥 收到响应:', response)
            resolve(response)
          }
        }
      )
    })

    // 处理响应
    if (response.success) {
      log('✅ 下载成功!')

      // 显示成功状态
      button.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" fill="currentColor"/>
        </svg>
        <span>Success!</span>
      `
      button.classList.remove('loading')
      button.classList.add('success')

      // 显示通知
      showNotification('Download started successfully!', 'success')

      // 2秒后恢复
      setTimeout(() => {
        button.innerHTML = originalHTML
        button.classList.remove('success')
        button.disabled = false
      }, 2000)

    } else {
      log('❌ 下载失败:', response.error)

      // 显示失败状态
      button.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>
        </svg>
        <span>Failed</span>
      `
      button.classList.remove('loading')
      button.classList.add('error')

      // 显示错误通知
      const errorMsg = response.error || 'Unknown error'
      showNotification(errorMsg, 'error')

      // 如果是积分不足，显示充值提示
      if (response.needRecharge) {
        setTimeout(() => {
          showRechargePrompt()
        }, 500)
      }

      // 2秒后恢复
      setTimeout(() => {
        button.innerHTML = originalHTML
        button.classList.remove('error')
        button.disabled = false
      }, 2000)
    }

  } catch (error) {
    log('❌ 处理异常:', error)

    // 恢复按钮
    button.innerHTML = originalHTML
    button.classList.remove('loading')
    button.disabled = false

    // 显示错误
    showNotification(error.message || 'Network error', 'error')
  }
}

// === 显示通知 ===
function showNotification(message, type = 'info') {
  log('📢 显示通知:', type, message)

  // 移除旧通知
  const oldNotification = document.querySelector('.sora-notification')
  if (oldNotification) {
    oldNotification.remove()
  }

  // 创建新通知
  const notification = document.createElement('div')
  notification.className = `sora-notification sora-notification-${type}`
  notification.textContent = message

  document.body.appendChild(notification)

  // 3秒后移除
  setTimeout(() => {
    notification.classList.add('fade-out')
    setTimeout(() => notification.remove(), 300)
  }, 3000)
}

// === 显示充值提示 ===
function showRechargePrompt() {
  log('💰 显示充值提示')

  const overlay = document.createElement('div')
  overlay.className = 'sora-recharge-overlay'
  overlay.innerHTML = `
    <div class="sora-recharge-dialog">
      <h3>💎 Credits Insufficient</h3>
      <p>You need more credits to download this video.</p>
      <div class="buttons">
        <button id="sora-recharge-btn" class="primary">Recharge Now</button>
        <button id="sora-cancel-btn" class="secondary">Cancel</button>
      </div>
    </div>
  `

  document.body.appendChild(overlay)

  // 充值按钮
  document.getElementById('sora-recharge-btn').addEventListener('click', () => {
    log('💳 用户点击充值')
    chrome.runtime.sendMessage({ action: 'openRecharge' })
    overlay.remove()
  })

  // 取消按钮
  document.getElementById('sora-cancel-btn').addEventListener('click', () => {
    log('❌ 用户取消充值')
    overlay.remove()
  })

  // 点击背景关闭
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.remove()
    }
  })
}

// === 注入按钮 ===
function injectButton() {
  // 检查是否为视频页面
  if (!isVideoPage()) {
    log('⏭️ 不是视频页面，跳过')
    return false
  }

  // 避免重复注入
  if (document.getElementById(CONFIG.buttonId)) {
    if (!isInjected) {
      log('✅ 按钮已存在（可能是重复调用）')
      isInjected = true
    }
    return true
  }

  // 查找注入位置
  const injectionPoint = findInjectionPoint()

  if (!injectionPoint) {
    attemptCount++

    if (attemptCount < CONFIG.maxAttempts) {
      log(`⏳ 未找到注入位置，${CONFIG.checkInterval}ms 后重试 (${attemptCount}/${CONFIG.maxAttempts})`)
      setTimeout(injectButton, CONFIG.checkInterval)
    } else {
      log('❌ 达到最大尝试次数，停止注入')
    }

    return false
  }

  // 创建按钮
  const button = createDownloadButton()

  // 插入按钮到容器末尾
  injectionPoint.appendChild(button)

  log('🎉 按钮注入成功！')
  isInjected = true
  attemptCount = 0

  return true
}

// === 监听 URL 变化（SPA 应用） ===
let lastUrl = window.location.href

function checkUrlChange() {
  const currentUrl = window.location.href

  if (currentUrl !== lastUrl) {
    log('🔄 URL 变化:', currentUrl)
    lastUrl = currentUrl

    // 重置状态
    isInjected = false
    attemptCount = 0

    // 移除旧按钮
    const oldButton = document.getElementById(CONFIG.buttonId)
    if (oldButton) {
      oldButton.remove()
      log('🗑️ 移除旧按钮')
    }

    // 延迟后重新注入
    setTimeout(injectButton, 500)
  }
}

// 使用 MutationObserver 监听页面变化
const observer = new MutationObserver(() => {
  checkUrlChange()
})

// === 初始化 ===
function init() {
  log('🚀 Sora Remove Watermark Extension Loaded')
  log('📍 当前 URL:', window.location.href)

  // 页面加载完成后注入
  if (document.readyState === 'loading') {
    log('⏳ 等待 DOMContentLoaded...')
    document.addEventListener('DOMContentLoaded', () => {
      log('✅ DOM 加载完成')
      setTimeout(injectButton, 1000)
    })
  } else {
    log('✅ DOM 已加载')
    setTimeout(injectButton, 1000)
  }

  // 监听页面变化（SPA）
  observer.observe(document.body, {
    childList: true,
    subtree: true
  })

  // 定期检查 URL（备用方案）
  setInterval(checkUrlChange, 1000)
}

// 启动
init()
