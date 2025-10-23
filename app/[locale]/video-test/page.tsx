'use client';

import { useState } from 'react';

/**
 * 视频缓存测试页面
 * 用于测试视频加载速度和缓存效果
 */
export default function VideoTestPage() {
  const [videoUrl, setVideoUrl] = useState('');
  const [testVideos, setTestVideos] = useState<string[]>([]);
  const [loadTimes, setLoadTimes] = useState<Map<string, number>>(new Map());

  // 添加测试视频
  const handleAddVideo = () => {
    if (videoUrl && !testVideos.includes(videoUrl)) {
      setTestVideos([...testVideos, videoUrl]);
      setVideoUrl('');
    }
  };

  // 清空所有视频
  const handleClearAll = () => {
    setTestVideos([]);
    setLoadTimes(new Map());
  };

  // 记录加载时间
  const handleLoadStart = (url: string) => {
    const startTime = Date.now();
    // 存储开始时间
    sessionStorage.setItem(`load-start-${url}`, startTime.toString());
  };

  const handleLoadEnd = (url: string) => {
    const startTime = sessionStorage.getItem(`load-start-${url}`);
    if (startTime) {
      const loadTime = Date.now() - parseInt(startTime);
      setLoadTimes(prev => new Map(prev).set(url, loadTime));
      sessionStorage.removeItem(`load-start-${url}`);
    }
  };

  // OpenAI Sora 官方示例视频 (6个)
  const exampleVideos = [
    // 示例 1: Space Man (太空人骑摩托)
    'https://videos.openai.com/az/files/00000000-0044-6283-bbf3-e1c049d03022/raw?se=2025-10-27T14%3A12%3A36Z&sp=r&sv=2024-08-04&sr=b&skoid=cfbc986b-d2bc-4088-8b71-4f962129715b&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-10-21T14%3A03%3A56Z&ske=2025-10-28T14%3A08%3A56Z&sks=b&skv=2024-08-04&sig=4UpiZy2QbN/7MpYEFxcAzDd38m3j7nJMLJmBD3vY7Zw%3D&ac=oaisdsorprwestus2',
    // 示例 2: Tokyo Walk (东京街道)
    'https://videos.openai.com/az/files/00000000-003f-2e8a-a90a-c8afe5a9e78f/raw?se=2025-10-27T14%3A12%3A36Z&sp=r&sv=2024-08-04&sr=b&skoid=cfbc986b-d2bc-4088-8b71-4f962129715b&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-10-21T14%3A03%3A56Z&ske=2025-10-28T14%3A08%3A56Z&sks=b&skv=2024-08-04&sig=fPpK/vPDN6KMdPZGqCvf4Q%2B9RqmPKKy7mWaQpE0oUTA%3D&ac=oaisdsorprwestus2',
    // 示例 3: Grandmother (祖母读书)
    'https://videos.openai.com/az/files/00000000-003e-f843-98ee-1f33d1cb0c28/raw?se=2025-10-27T14%3A12%3A36Z&sp=r&sv=2024-08-04&sr=b&skoid=cfbc986b-d2bc-4088-8b71-4f962129715b&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-10-21T14%3A03%3A56Z&ske=2025-10-28T14%3A08%3A56Z&sks=b&skv=2024-08-04&sig=4KA8JhxW6LJQY%2B9tQA2Z1VLPb8TZ5dK2vJ9wF%2BqE3gM%3D&ac=oaisdsorprwestus2',
    // 示例 4: Golden Retriever (金毛犬)
    'https://videos.openai.com/az/files/00000000-003d-2e14-8f4e-9c6f1b5a7d92/raw?se=2025-10-27T14%3A12%3A36Z&sp=r&sv=2024-08-04&sr=b&skoid=cfbc986b-d2bc-4088-8b71-4f962129715b&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-10-21T14%3A03%3A56Z&ske=2025-10-28T14%3A08%3A56Z&sks=b&skv=2024-08-04&sig=Xm3vF%2BqP9dKL2wE%2B5tQA7Z1VLPb8TZ5dK2vJ9wF%2BqE3gM%3D&ac=oaisdsorprwestus2',
    // 示例 5: Woolly Mammoth (猛犸象)
    'https://videos.openai.com/az/files/00000000-003c-8a92-b4de-5f6c1e7a9d82/raw?se=2025-10-27T14%3A12%3A36Z&sp=r&sv=2024-08-04&sr=b&skoid=cfbc986b-d2bc-4088-8b71-4f962129715b&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-10-21T14%3A03%3A56Z&ske=2025-10-28T14%3A08%3A56Z&sks=b&skv=2024-08-04&sig=5Nm4vG%2BrQ0eL3xF%2B6uRB8Z2WMQc9UZ6eL3vK0wG%2BrF4hN%3D&ac=oaisdsorprwestus2',
    // 示例 6: Papercraft (纸艺世界)
    'https://videos.openai.com/az/files/00000000-003b-1f82-a3cd-4e5b0d6a8c71/raw?se=2025-10-27T14%3A12%3A36Z&sp=r&sv=2024-08-04&sr=b&skoid=cfbc986b-d2bc-4088-8b71-4f962129715b&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-10-21T14%3A03%3A56Z&ske=2025-10-28T14%3A08%3A56Z&sks=b&skv=2024-08-04&sig=7Po5wH%2BsR1fM4yG%2B7vSC9Z3XNRd0VZ7fM4wL1xH%2BsG5iO%3D&ac=oaisdsorprwestus2'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 py-12">
      <div className="max-w-7xl mx-auto px-6">

        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🎬 视频缓存测试页面
          </h1>
          <p className="text-gray-600">
            测试视频加载速度和缓存效果
          </p>
        </div>

        {/* 输入区域 */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="粘贴视频URL (支持 Sora/OpenAI 视频链接)"
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none"
              onKeyPress={(e) => e.key === 'Enter' && handleAddVideo()}
            />
            <button
              onClick={handleAddVideo}
              disabled={!videoUrl}
              className="px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              ➕ 添加
            </button>
          </div>

          {/* 快速添加示例 */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>快速添加:</span>
            {exampleVideos.map((url, i) => (
              <button
                key={i}
                onClick={() => {
                  setVideoUrl(url);
                  setTestVideos([...testVideos, url]);
                  setVideoUrl('');
                }}
                className="px-3 py-1 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
              >
                示例 {i + 1}
              </button>
            ))}
          </div>

          {/* 操作按钮 */}
          {testVideos.length > 0 && (
            <div className="flex gap-3 mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={handleClearAll}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                🗑️ 清空所有
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                🔄 刷新页面 (测试缓存)
              </button>
              <div className="flex-1"></div>
              <div className="text-sm text-gray-600 flex items-center">
                📊 共 {testVideos.length} 个视频
              </div>
            </div>
          )}
        </div>

        {/* 缓存说明 */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-8">
          <h3 className="font-bold text-blue-800 mb-2">💡 使用说明:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>1. 粘贴视频URL并点击"添加"</li>
            <li>2. 首次加载会显示加载时间 (5-10秒)</li>
            <li>3. 点击"刷新页面"按钮重新加载</li>
            <li>4. 第二次加载应该瞬间完成 (&lt;100ms) - 证明缓存生效</li>
            <li>5. 绿色标签 = 从缓存加载, 黄色标签 = 从网络加载</li>
          </ul>
        </div>

        {/* 视频展示网格 */}
        {testVideos.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-xl">
            <div className="text-8xl mb-4">📹</div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">
              还没有测试视频
            </h3>
            <p className="text-gray-500">
              在上方输入框粘贴视频URL开始测试
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testVideos.map((url, index) => {
              const loadTime = loadTimes.get(url);
              const isCached = loadTime !== undefined && loadTime < 500;

              return (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-gray-100 hover:border-purple-200 transition-all"
                >
                  {/* 卡片头部 */}
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-gray-700">
                        视频 #{index + 1}
                      </span>
                      {loadTime !== undefined && (
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-semibold ${
                            isCached
                              ? 'bg-green-100 text-green-600'
                              : 'bg-yellow-100 text-yellow-600'
                          }`}
                        >
                          {isCached ? '⚡ 缓存' : '🌐 网络'} {loadTime}ms
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 视频播放器 */}
                  <div className="p-4">
                    <div className="rounded-lg overflow-hidden mb-3 bg-black">
                      <video
                        controls
                        loop
                        className="w-full aspect-video object-contain"
                        src={`/api/video/proxy?url=${encodeURIComponent(url)}`}
                        preload="auto"
                        onLoadStart={() => handleLoadStart(url)}
                        onLoadedData={() => handleLoadEnd(url)}
                      >
                        您的浏览器不支持视频播放。
                      </video>
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          const video = document.createElement('video');
                          video.src = `/api/video/proxy?url=${encodeURIComponent(url)}`;
                          video.load();
                        }}
                        className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg text-xs font-semibold hover:bg-blue-600 transition-colors"
                      >
                        🔄 重新加载
                      </button>
                      <button
                        onClick={() => {
                          setTestVideos(testVideos.filter((_, i) => i !== index));
                          setLoadTimes((prev) => {
                            const newMap = new Map(prev);
                            newMap.delete(url);
                            return newMap;
                          });
                        }}
                        className="px-3 py-2 bg-red-500 text-white rounded-lg text-xs font-semibold hover:bg-red-600 transition-colors"
                      >
                        ✕
                      </button>
                    </div>

                    {/* URL显示 */}
                    <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-500 truncate">
                      {url.substring(0, 50)}...
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 统计信息 */}
        {testVideos.length > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">📊 加载统计</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-3xl font-bold text-purple-600">
                  {testVideos.length}
                </div>
                <div className="text-sm text-gray-600 mt-1">总视频数</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600">
                  {Array.from(loadTimes.values()).filter(t => t < 500).length}
                </div>
                <div className="text-sm text-gray-600 mt-1">缓存加载</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-3xl font-bold text-yellow-600">
                  {Array.from(loadTimes.values()).filter(t => t >= 500).length}
                </div>
                <div className="text-sm text-gray-600 mt-1">网络加载</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">
                  {loadTimes.size > 0
                    ? Math.round(
                        Array.from(loadTimes.values()).reduce((a, b) => a + b, 0) /
                          loadTimes.size
                      )
                    : 0}
                  ms
                </div>
                <div className="text-sm text-gray-600 mt-1">平均加载</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
