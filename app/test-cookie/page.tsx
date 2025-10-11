'use client'

import { useState, useEffect } from 'react'
import Cookies from 'js-cookie'

export default function TestCookiePage() {
  const [cookieKey, setCookieKey] = useState('test-key')
  const [cookieValue, setCookieValue] = useState('test-value')
  const [allCookies, setAllCookies] = useState<Record<string, string>>({})
  const [retrievedValue, setRetrievedValue] = useState<string>('')
  const [logMessages, setLogMessages] = useState<string[]>([])

  // 添加日志
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString('zh-CN')
    console.log(`[${timestamp}] ${message}`)
    setLogMessages((prev) => [`[${timestamp}] ${message}`, ...prev.slice(0, 19)])
  }

  // 刷新 Cookie 列表
  const refreshCookies = () => {
    const cookies = Cookies.get()
    console.log('All cookies:', cookies)
    setAllCookies(cookies)
    addLog('✅ 已刷新 Cookie 列表')
  }

  // 初始加载
  useEffect(() => {
    addLog('🚀 页面已加载')
    refreshCookies()
  }, [])

  // 1. 设置普通 Cookie
  const handleSetCookie = () => {
    try {
      console.log('Setting cookie:', cookieKey, '=', cookieValue)
      Cookies.set(cookieKey, cookieValue)
      addLog(`📝 设置 Cookie: ${cookieKey} = ${cookieValue}`)
      refreshCookies()
    } catch (error) {
      console.error('Error:', error)
      addLog(`❌ 错误: ${error}`)
    }
  }

  // 2. 获取 Cookie
  const handleGetCookie = () => {
    try {
      console.log('Getting cookie:', cookieKey)
      const value = Cookies.get(cookieKey)
      console.log('Retrieved:', value)
      setRetrievedValue(value || '(未找到)')
      addLog(`🔍 获取 Cookie: ${cookieKey} = ${value || '(未找到)'}`)
    } catch (error) {
      console.error('Error:', error)
      addLog(`❌ 错误: ${error}`)
    }
  }

  // 3. 删除 Cookie
  const handleRemoveCookie = () => {
    try {
      Cookies.remove(cookieKey)
      addLog(`🗑️ 删除 Cookie: ${cookieKey}`)
      refreshCookies()
    } catch (error) {
      console.error('Error:', error)
      addLog(`❌ 错误: ${error}`)
    }
  }

  // 4. 设置带过期时间
  const handleSetWithExpiry = () => {
    try {
      Cookies.set(cookieKey, cookieValue, { expires: 7 })
      addLog(`⏰ 设置 Cookie (7天): ${cookieKey} = ${cookieValue}`)
      refreshCookies()
    } catch (error) {
      console.error('Error:', error)
      addLog(`❌ 错误: ${error}`)
    }
  }

  // 5. 测试按钮
  const handleTestButton = () => {
    console.log('Test button clicked!')
    alert('按钮点击成功! 请查看控制台')
    addLog('✅ 测试按钮被点击')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🍪 js-cookie 简化测试页面
          </h1>
          <p className="text-gray-600">直接使用 js-cookie 进行测试</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左侧：操作区 */}
          <div className="space-y-6">
            {/* 测试按钮 */}
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-yellow-800">
                🧪 测试按钮是否工作
              </h2>
              <button
                onClick={handleTestButton}
                className="w-full px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition text-lg font-bold"
              >
                点击我测试
              </button>
              <p className="text-sm text-yellow-700 mt-2">
                如果弹出提示框，说明按钮工作正常
              </p>
            </div>

            {/* 基础操作 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                📝 Cookie 操作
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cookie Key
                  </label>
                  <input
                    type="text"
                    value={cookieKey}
                    onChange={(e) => setCookieKey(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="test-key"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cookie Value
                  </label>
                  <input
                    type="text"
                    value={cookieValue}
                    onChange={(e) => setCookieValue(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="test-value"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleSetCookie}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    设置
                  </button>
                  <button
                    onClick={handleGetCookie}
                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                  >
                    获取
                  </button>
                  <button
                    onClick={handleRemoveCookie}
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    删除
                  </button>
                  <button
                    onClick={handleSetWithExpiry}
                    className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600"
                  >
                    7天过期
                  </button>
                </div>
                <button
                  onClick={refreshCookies}
                  className="w-full px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                >
                  🔄 刷新列表
                </button>
              </div>
            </div>
          </div>

          {/* 右侧：显示区 */}
          <div className="space-y-6">
            {/* 获取结果 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                🔍 获取结果
              </h2>
              <div className="bg-gray-50 rounded-lg p-4 min-h-[80px] flex items-center justify-center">
                <pre className="text-sm text-gray-800 font-mono">
                  {retrievedValue || '(点击"获取"按钮)'}
                </pre>
              </div>
            </div>

            {/* 当前所有 Cookie */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                📋 当前所有 Cookie ({Object.keys(allCookies).length})
              </h2>
              <div className="bg-gray-50 rounded-lg p-4 max-h-80 overflow-y-auto">
                {Object.keys(allCookies).length === 0 ? (
                  <p className="text-gray-500 text-center py-8">暂无 Cookie</p>
                ) : (
                  <div className="space-y-2">
                    {Object.entries(allCookies).map(([key, value]) => (
                      <div
                        key={key}
                        className="bg-white p-3 rounded border border-gray-200"
                      >
                        <div className="font-mono text-xs break-all">
                          <span className="font-bold text-blue-600">{key}</span>
                          <span className="text-gray-500 mx-2">=</span>
                          <span className="text-gray-800">{value}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 操作日志 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                📝 操作日志
              </h2>
              <div className="bg-gray-900 rounded-lg p-4 max-h-60 overflow-y-auto">
                {logMessages.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">暂无日志</p>
                ) : (
                  <div className="space-y-1 font-mono text-xs">
                    {logMessages.map((msg, index) => (
                      <div key={index} className="text-green-400">
                        {msg}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 调试信息 */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            🔧 调试步骤
          </h3>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>先点击黄色"点击我测试"按钮，确认按钮可以点击</li>
            <li>打开浏览器控制台 (F12 → Console)</li>
            <li>点击"设置"按钮，查看控制台是否有输出</li>
            <li>点击"获取"按钮，查看控制台和获取结果</li>
            <li>打开 DevTools → Application → Cookies → localhost:3005</li>
            <li>查看 Cookie 是否真实存在</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
