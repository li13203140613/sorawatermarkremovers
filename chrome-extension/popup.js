/**
 * Popup 逻辑
 * 处理用户界面交互
 */

// === DOM 元素 ===
const loadingView = document.getElementById('loading')
const loginView = document.getElementById('login-view')
const mainView = document.getElementById('main-view')

const loginBtn = document.getElementById('login-btn')
const logoutBtn = document.getElementById('logout-btn')
const rechargeBtn = document.getElementById('recharge-btn')
const refreshBtn = document.getElementById('refresh-btn')

const userName = document.getElementById('user-name')
const userEmail = document.getElementById('user-email')
const userInitial = document.getElementById('user-initial')
const userAvatar = document.getElementById('user-avatar')
const creditsValue = document.getElementById('credits-value')

const errorToast = document.getElementById('error-toast')
const errorMessage = document.getElementById('error-message')

// === 工具函数 ===

function showView(view) {
  loadingView.style.display = 'none'
  loginView.style.display = 'none'
  mainView.style.display = 'none'

  if (view === 'loading') {
    loadingView.style.display = 'flex'
  } else if (view === 'login') {
    loginView.style.display = 'block'
  } else if (view === 'main') {
    mainView.style.display = 'block'
  }
}

function showError(message) {
  errorMessage.textContent = message
  errorToast.style.display = 'block'

  setTimeout(() => {
    errorToast.style.display = 'none'
  }, 3000)
}

function showSuccess(message) {
  errorMessage.textContent = message
  errorToast.classList.add('success')
  errorToast.style.display = 'block'

  setTimeout(() => {
    errorToast.style.display = 'none'
    errorToast.classList.remove('success')
  }, 3000)
}

function setLoading(button, isLoading) {
  if (isLoading) {
    button.disabled = true
    button.style.opacity = '0.7'
  } else {
    button.disabled = false
    button.style.opacity = '1'
  }
}

// === 发送消息到 background ===

async function sendMessage(action, data = {}) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      { action, ...data },
      (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message))
        } else {
          resolve(response)
        }
      }
    )
  })
}

// === 更新 UI ===

function updateUserUI(user, profile) {
  // 用户名
  const displayName = profile.name || user.email.split('@')[0]
  userName.textContent = displayName

  // 邮箱
  userEmail.textContent = user.email

  // 头像首字母
  userInitial.textContent = displayName.charAt(0).toUpperCase()

  // 如果有头像 URL，显示头像
  if (profile.avatar_url) {
    const img = document.createElement('img')
    img.src = profile.avatar_url
    img.alt = displayName
    userAvatar.innerHTML = ''
    userAvatar.appendChild(img)
  }

  // 积分
  creditsValue.textContent = profile.credits || 0
}

// === 登录 ===

async function login() {
  console.log('🔐 开始登录...')
  setLoading(loginBtn, true)

  try {
    const response = await sendMessage('login')

    if (response.success) {
      console.log('✅ 登录成功:', response.user.email)
      showSuccess('Login successful!')

      // 更新 UI
      updateUserUI(response.user, response.profile)

      // 切换到主视图
      showView('main')
    } else {
      console.error('❌ 登录失败:', response.error)
      showError(response.error || 'Login failed')
    }
  } catch (error) {
    console.error('❌ 登录异常:', error)
    showError(error.message || 'Login failed')
  } finally {
    setLoading(loginBtn, false)
  }
}

// === 退出登录 ===

async function logout() {
  console.log('🚪 退出登录...')

  const confirmed = confirm('Are you sure you want to sign out?')
  if (!confirmed) return

  setLoading(logoutBtn, true)

  try {
    const response = await sendMessage('logout')

    if (response.success) {
      console.log('✅ 退出成功')
      showSuccess('Signed out successfully')

      // 切换到登录视图
      showView('login')
    } else {
      console.error('❌ 退出失败:', response.error)
      showError(response.error || 'Sign out failed')
    }
  } catch (error) {
    console.error('❌ 退出异常:', error)
    showError(error.message || 'Sign out failed')
  } finally {
    setLoading(logoutBtn, false)
  }
}

// === 刷新积分 ===

async function refreshProfile() {
  console.log('🔄 刷新积分...')

  // 添加旋转动画
  refreshBtn.classList.add('rotating')
  setLoading(refreshBtn, true)

  try {
    const response = await sendMessage('getProfile')

    if (response.success) {
      console.log('✅ 刷新成功:', response.profile)

      // 更新积分显示
      creditsValue.textContent = response.profile.credits || 0

      showSuccess('Credits updated!')
    } else {
      console.error('❌ 刷新失败:', response.error)

      // 如果是未登录错误，切换到登录页面
      if (response.error.includes('登录')) {
        showView('login')
      } else {
        showError(response.error || 'Refresh failed')
      }
    }
  } catch (error) {
    console.error('❌ 刷新异常:', error)
    showError(error.message || 'Refresh failed')
  } finally {
    refreshBtn.classList.remove('rotating')
    setLoading(refreshBtn, false)
  }
}

// === 打开充值页面 ===

async function openRecharge() {
  console.log('💰 打开充值页面...')

  try {
    await sendMessage('openRecharge')
    window.close() // 关闭 popup
  } catch (error) {
    console.error('❌ 打开充值页面失败:', error)
    showError('Failed to open recharge page')
  }
}

// === 检查登录状态 ===

async function checkAuth() {
  console.log('🔍 检查登录状态...')
  showView('loading')

  try {
    const response = await sendMessage('checkAuth')

    if (response.isAuthenticated) {
      console.log('✅ 已登录:', response.user.email)

      // 获取用户信息
      const profileResponse = await sendMessage('getProfile')

      if (profileResponse.success) {
        updateUserUI(response.user, profileResponse.profile)
        showView('main')
      } else {
        // 获取信息失败，可能 token 过期
        console.error('❌ 获取用户信息失败:', profileResponse.error)
        showView('login')
      }
    } else {
      console.log('⚠️ 未登录')
      showView('login')
    }
  } catch (error) {
    console.error('❌ 检查登录状态失败:', error)
    showView('login')
  }
}

// === 事件监听 ===

loginBtn.addEventListener('click', login)
logoutBtn.addEventListener('click', logout)
refreshBtn.addEventListener('click', refreshProfile)
rechargeBtn.addEventListener('click', openRecharge)

// === 初始化 ===

console.log('🚀 Popup 已加载')
checkAuth()
