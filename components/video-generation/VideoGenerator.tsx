'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useCredits } from '@/hooks/useCredits';
import { useRouter } from 'next/navigation';
import { GoogleOneTap } from '@/components/auth';

interface VideoGeneratorProps {
  apiKey?: string;
}

interface TaskStatus {
  id: number;
  task_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  message: string;
  progress: {
    progress_pct: number;
  };
  result?: {
    output_url: string;
  };
}

export default function VideoGenerator({ apiKey }: VideoGeneratorProps) {
  // Auth & Credits
  const { user, loading: authLoading } = useAuth();
  const { credits, hasCredits, isLoggedIn, refresh: refreshCredits } = useCredits();
  const router = useRouter();

  // Form State
  const [model, setModel] = useState<'sora2' | 'sora2-unwm'>('sora2');
  const [prompt, setPrompt] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoCount, setVideoCount] = useState<1 | 6>(1); // 新增：视频数量选择

  // Task State
  const [loading, setLoading] = useState(false);
  const [taskIds, setTaskIds] = useState<string[]>([]); // 修改：支持多个任务ID
  const [taskStatuses, setTaskStatuses] = useState<TaskStatus[]>([]); // 修改：支持多个任务状态
  const [error, setError] = useState<string | null>(null);
  const [simulatedProgress, setSimulatedProgress] = useState(0);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 计算所需积分（单个视频）
  const creditsPerVideo = model === 'sora2' ? 1 : 2;
  // 总共需要的积分
  const requiredCredits = creditsPerVideo * videoCount;

  // 80秒模拟进度条
  useEffect(() => {
    if (loading && taskStatuses.length === 0) {
      // 开始模拟进度
      setSimulatedProgress(0);
      const duration = 80000; // 80秒
      const interval = 100; // 每100ms更新一次
      const increment = (100 / (duration / interval)); // 每次增加的百分比

      progressIntervalRef.current = setInterval(() => {
        setSimulatedProgress(prev => {
          const next = prev + increment;
          return next >= 95 ? 95 : next; // 最多到95%，等待真实进度
        });
      }, interval);

      return () => {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
      };
    } else if (taskStatuses.length > 0 || !loading) {
      // 有真实状态或不在加载时，清除模拟进度
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    }
  }, [loading, taskStatuses]);

  // 文件转 base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // 处理图片选择
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // 清除图片
  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 创建任务
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setTaskStatuses([]);

    // 1. 检查登录状态
    if (!user) {
      setError('请先登录后再使用视频生成功能');
      setTimeout(() => {
        router.push('/login?redirect=/video-generation');
      }, 2000);
      return;
    }

    // 2. 检查积分是否充足
    if (credits < requiredCredits) {
      setError(`积分不足！生成 ${videoCount} 个视频需要 ${requiredCredits} 积分，当前剩余 ${credits} 积分`);
      return;
    }

    setLoading(true);

    try {
      // 准备请求体
      const requestBody: {
        model: string;
        prompt: string;
        images?: string[];
        creditsToConsume: number;
        count?: number; // 新增：生成数量
      } = {
        model,
        prompt,
        creditsToConsume: creditsPerVideo, // 每个视频的积分
        count: videoCount // 生成的视频数量（1 或 6）
      };

      if (imageFile) {
        const base64Image = await fileToBase64(imageFile);
        requestBody.images = [base64Image];
      }

      const response = await fetch('/api/video-generation/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey && { 'x-api-key': apiKey })
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `请求失败: ${response.status}`);
      }

      console.log('Tasks created:', data);

      // 处理返回的多个任务
      if (!data.tasks || !Array.isArray(data.tasks) || data.tasks.length === 0) {
        throw new Error('API 未返回任务列表');
      }

      const newTaskIds = data.tasks.map((task: any) => task.id || task.task_id);

      // 刷新积分显示
      await refreshCredits();

      setTaskIds(newTaskIds);
      startPollingMultiple(newTaskIds);

    } catch (err) {
      setError(err instanceof Error ? err.message : '未知错误');
      setLoading(false);
    }
  };

  // 开始轮询多个任务状态
  const startPollingMultiple = (ids: string[]) => {
    let errorCount = 0; // 连续错误计数
    const maxErrors = 5; // 最大连续错误次数

    pollIntervalRef.current = setInterval(async () => {
      try {
        // 并行查询所有任务状态
        const responses = await Promise.all(
          ids.map(id =>
            fetch(`/api/video-generation/status/${id}`, {
              headers: {
                ...(apiKey && { 'x-api-key': apiKey })
              }
            })
          )
        );

        const dataArray: TaskStatus[] = await Promise.all(
          responses.map(res => res.json())
        );

        // 添加详细日志
        console.log('[VideoGenerator] 任务状态更新:', dataArray.map((data, idx) => ({
          taskId: ids[idx],
          status: data.status,
          message: data.message,
          progress: data.progress?.progress_pct
        })));

        // 检查是否有请求失败
        const failedResponse = responses.find(res => !res.ok);
        if (failedResponse) {
          const failedData = await failedResponse.json();
          throw new Error(failedData.message || `查询失败: ${failedResponse.status}`);
        }

        // 查询成功，重置错误计数
        errorCount = 0;

        setTaskStatuses(dataArray);

        // 检查是否所有任务都完成或失败
        const allFinished = dataArray.every(
          data => data.status === 'completed' || data.status === 'failed'
        );

        if (allFinished) {
          stopPolling();
          setLoading(false);

          // 检查是否有失败的任务
          const failedTasks = dataArray.filter(data => data.status === 'failed');
          if (failedTasks.length > 0) {
            const failureReasons = failedTasks.map(
              task => task.message || '未知原因'
            ).join(', ');
            console.error('[VideoGenerator] 部分任务失败:', failureReasons);
            setError(`有 ${failedTasks.length} 个任务失败: ${failureReasons}`);
          }
        }

      } catch (err) {
        // 只记录错误，不立即停止轮询
        errorCount++;
        console.warn(`[VideoGenerator] 查询失败（第 ${errorCount}/${maxErrors} 次），将继续重试:`, err);

        // 只有连续失败超过最大次数才停止
        if (errorCount >= maxErrors) {
          stopPolling();
          setLoading(false);
          setError('网络连接不稳定，请检查网络后重试');
          console.error('[VideoGenerator] 连续失败次数过多，停止轮询');
        }
      }
    }, 6000);
  };

  // 停止轮询
  const stopPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  };

  // 重置表单
  const handleReset = () => {
    stopPolling();
    setPrompt('');
    setImageFile(null);
    setImagePreview(null);
    setTaskIds([]);
    setTaskStatuses([]);
    setError(null);
    setLoading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 下载单个视频
  const [downloadingIndex, setDownloadingIndex] = useState<number | null>(null);
  const handleDownload = async (videoUrl: string, taskId: string, index: number) => {
    try {
      setDownloadingIndex(index);

      // 直接使用原始视频URL下载，不使用代理
      const response = await fetch(videoUrl);

      if (!response.ok) {
        throw new Error('下载失败');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai-video-${taskId}-${Date.now()}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('下载失败:', error);
      setError('下载失败，请重试');
    } finally {
      setDownloadingIndex(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 py-12">
      {/* Google One Tap - 右上角自动弹出登录 */}
      <GoogleOneTap />

      {/* 主体内容 - 左右分栏 */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* 左侧：输入区域 (40%) */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-8 sticky top-8">
              <form onSubmit={handleSubmit} className="space-y-6">

                {/* 用户信息提示 - 仅未登录时显示 */}
                {!authLoading && !isLoggedIn && (
                  <div className="p-4 rounded-xl border-2 bg-yellow-50 border-yellow-200">
                    <p className="text-sm text-yellow-800">
                      ⚠️ 请先<Link href="/login?redirect=/video-generation" className="underline font-bold">登录</Link>后使用
                    </p>
                  </div>
                )}

                {/* 模型选择 - 左右布局 */}
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-3">
                    视频模型
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setModel('sora2')}
                      disabled={loading}
                      className={`flex flex-col items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        model === 'sora2'
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/50 border-transparent'
                          : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                      }`}
                    >
                      <div className={`font-bold ${model === 'sora2' ? 'text-white' : 'text-gray-800'}`}>有水印版</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setModel('sora2-unwm')}
                      disabled={loading}
                      className={`flex flex-col items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        model === 'sora2-unwm'
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/50 border-transparent'
                          : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                      }`}
                    >
                      <div className={`font-bold ${model === 'sora2-unwm' ? 'text-white' : 'text-gray-800'}`}>去水印版</div>
                    </button>
                  </div>
                </div>

                {/* 生成数量选择 - 紧凑版 */}
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-3">
                    生成数量
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setVideoCount(1)}
                      disabled={loading}
                      className={`flex flex-col items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        videoCount === 1
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/50 border-transparent'
                          : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                      } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className={`font-bold ${videoCount === 1 ? 'text-white' : 'text-gray-800'}`}>1个</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setVideoCount(6)}
                      disabled={loading}
                      className={`flex flex-col items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        videoCount === 6
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/50 border-transparent'
                          : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                      } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className={`font-bold ${videoCount === 6 ? 'text-white' : 'text-gray-800'}`}>6个</div>
                    </button>
                  </div>
                </div>

                {/* 提示词输入与图片上传 - 上下布局 */}
                <div className="grid grid-cols-1 gap-4">
                  {/* 左侧：提示词 */}
                  <div className="md:col-span-1">
                    <label className="block text-sm font-bold text-gray-800 mb-3">
                      视频描述
                    </label>
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="描述您想要的视频内容，例如：一只可爱的猫咪在花园里玩耍..."
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all resize-none h-[180px]"
                      required
                      disabled={loading}
                    />
                    <p className="mt-2 text-xs text-gray-500">
                      💡 可控制视频横/竖屏、比例等
                    </p>
                  </div>

                  {/* 右侧：图片上传 */}
                  <div className="md:col-span-1">
                    <label className="block text-sm font-bold text-gray-800 mb-3">
                      参考图片（可选）
                    </label>

                    {!imagePreview ? (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-all h-[180px] flex flex-col items-center justify-center"
                      >
                        <div className="text-5xl mb-2">📎</div>
                        <p className="text-sm text-gray-600 font-medium mb-1">点击上传图片</p>
                        <p className="text-xs text-gray-400">PNG, JPG</p>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/png,image/jpeg,image/jpg"
                          onChange={handleImageChange}
                          className="hidden"
                          disabled={loading}
                        />
                      </div>
                    ) : (
                      <div className="relative rounded-xl overflow-hidden border-2 border-purple-300 h-[180px]">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={clearImage}
                          disabled={loading}
                          className="absolute top-2 right-2 bg-red-500 text-white w-8 h-8 rounded-full hover:bg-red-600 transition-colors flex items-center justify-center shadow-lg"
                        >
                          ✕
                        </button>
                      </div>
                    )}

                    <p className="mt-2 text-xs text-red-600 flex items-center gap-1">
                      <span>⚠️</span>
                      请勿上传真人照片
                    </p>
                  </div>
                </div>

                {/* 按钮组 */}
                <div className="space-y-3 pt-4">
                  <button
                    type="submit"
                    disabled={loading || !prompt || !isLoggedIn || credits < requiredCredits}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        生成中...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <span className="text-2xl">🚀</span>
                        生成 {videoCount} 个视频 ({requiredCredits} 积分)
                      </span>
                    )}
                  </button>

                  {(taskIds.length > 0 || error) && (
                    <button
                      type="button"
                      onClick={handleReset}
                      className="w-full py-3 px-6 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all"
                    >
                      🔄 重置表单
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* 右侧：结果展示区域 (60%) */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden min-h-[600px] flex items-center justify-center">

              {/* 初始状态 */}
              {taskStatuses.length === 0 && !error && !loading && (
                <div className="text-center px-8 py-16">
                  <div className="text-8xl mb-6 animate-bounce">📹</div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">准备好开始创作了吗？</h3>
                  <p className="text-gray-500 text-lg">填写左侧表单，点击生成按钮开始创作您的视频</p>
                </div>
              )}

              {/* 生成中状态 */}
              {loading && !error && (
                <div className="text-center px-8 py-16 w-full max-w-md">
                  <div className="text-7xl mb-6 animate-pulse">🎨</div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-6">AI 正在创作中...</h3>
                  <div className="w-full bg-gray-200 rounded-full h-4 mb-4 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 h-4 rounded-full transition-all duration-300"
                      style={{width: `${Math.round(simulatedProgress)}%`}}
                    ></div>
                  </div>
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <p className="text-3xl font-bold text-purple-600">
                      {Math.round(simulatedProgress)}%
                    </p>
                    {simulatedProgress >= 95 && (
                      <svg className="animate-spin h-8 w-8 text-purple-600" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                  </div>
                  <p className="text-gray-500">
                    {simulatedProgress >= 95 ? '正在等待视频生成完成...' : '请稍候，这可能需要几分钟时间'}
                  </p>
                </div>
              )}

              {/* 错误状态 */}
              {error && (
                <div className="text-center px-8 py-16 w-full max-w-md">
                  <div className="text-7xl mb-6">❌</div>
                  <h3 className="text-2xl font-bold text-red-600 mb-3">生成失败</h3>
                  <p className="text-gray-600 bg-red-50 rounded-lg p-4">{error}</p>
                  {!isLoggedIn ? (
                    <button
                      onClick={() => router.push('/login?redirect=/video-generation')}
                      className="mt-6 px-8 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors"
                    >
                      前往登录
                    </button>
                  ) : credits < requiredCredits ? (
                    <button
                      onClick={() => router.push('/pricing')}
                      className="mt-6 px-8 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors"
                    >
                      购买积分
                    </button>
                  ) : (
                    <button
                      onClick={handleReset}
                      className="mt-6 px-8 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors"
                    >
                      重新尝试
                    </button>
                  )}
                </div>
              )}

              {/* 完成状态 - 支持多个视频 */}
              {taskStatuses.length > 0 && taskStatuses.every(t => t.status === 'completed' || t.status === 'failed') && (
                <div className="w-full p-8">
                  <div className="mb-6 text-center">
                    <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-6 py-3 rounded-full font-bold text-lg">
                      <span className="text-2xl">✅</span>
                      生成完成！共 {taskStatuses.filter(t => t.status === 'completed').length} 个视频
                    </div>
                  </div>

                  {/* 视频网格显示 */}
                  <div className={`grid gap-6 ${taskStatuses.length === 1 ? 'grid-cols-1 max-w-xl mx-auto' : taskStatuses.length <= 3 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
                    {taskStatuses.map((task, index) => (
                      task.status === 'completed' && task.result?.output_url && (
                        <div key={taskIds[index]} className="rounded-2xl overflow-hidden shadow-xl bg-white">
                          <div className="p-3 bg-gradient-to-r from-purple-500 to-indigo-500">
                            <p className="text-white font-bold text-sm text-center">视频 #{index + 1}</p>
                          </div>

                          <div className="bg-black">
                            <video
                              controls
                              loop
                              className="w-full max-h-80 object-contain mx-auto"
                              src={`/api/video/proxy?url=${encodeURIComponent(task.result.output_url)}`}
                              preload="auto"
                            >
                              您的浏览器不支持视频播放。
                            </video>
                          </div>

                          <div className="p-4">
                            <button
                              onClick={() => handleDownload(task.result!.output_url, taskIds[index], index)}
                              disabled={downloadingIndex === index}
                              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-4 rounded-xl font-bold hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                            >
                              {downloadingIndex === index ? (
                                <>
                                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  下载中...
                                </>
                              ) : (
                                <>
                                  <span className="text-xl">📥</span>
                                  下载视频
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}