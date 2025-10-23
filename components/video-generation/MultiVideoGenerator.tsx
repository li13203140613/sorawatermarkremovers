'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useCredits } from '@/hooks/useCredits';
import { useRouter } from 'next/navigation';
import { GoogleOneTap } from '@/components/auth';
import VideoTaskCard, { VideoTask, TaskStatus } from './VideoTaskCard';

interface MultiVideoGeneratorProps {
  apiKey?: string;
}

const TOTAL_VIDEOS = 6; // 生成6个视频
const POLLING_INTERVAL = 6000; // 6秒轮询间隔
const PROGRESS_DURATION = 80000; // 80秒模拟进度
const MAX_POLL_ERRORS = 5; // 最大连续失败次数

export default function MultiVideoGenerator({ apiKey }: MultiVideoGeneratorProps) {
  // Auth & Credits
  const { user, loading: authLoading } = useAuth();
  const { credits, hasCredits, isLoggedIn, refresh: refreshCredits } = useCredits();
  const router = useRouter();

  // Form State
  const [model, setModel] = useState<'sora2' | 'sora2-unwm'>('sora2');
  const [prompt, setPrompt] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Tasks State
  const [tasks, setTasks] = useState<VideoTask[]>(
    Array.from({ length: TOTAL_VIDEOS }, (_, i) => ({
      id: `task-${i}`,
      status: 'idle',
      progress: 0
    }))
  );

  const [isGenerating, setIsGenerating] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollIntervalsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const progressIntervalsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const errorCountsRef = useRef<Map<string, number>>(new Map());

  // 计算所需积分
  const requiredCreditsPerVideo = model === 'sora2' ? 1 : 2;
  const totalRequiredCredits = requiredCreditsPerVideo * TOTAL_VIDEOS;

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

  // 更新单个任务状态
  const updateTask = (taskId: string, updates: Partial<VideoTask>) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === taskId ? { ...task, ...updates } : task
      )
    );
  };

  // 开始模拟进度条
  const startProgress = (taskId: string) => {
    const interval = 100; // 每100ms更新一次
    const increment = (100 / (PROGRESS_DURATION / interval));

    const progressInterval = setInterval(() => {
      setTasks(prev =>
        prev.map(task => {
          if (task.id === taskId && task.status === 'polling') {
            const nextProgress = task.progress + increment;
            return {
              ...task,
              progress: nextProgress >= 95 ? 95 : nextProgress
            };
          }
          return task;
        })
      );
    }, interval);

    progressIntervalsRef.current.set(taskId, progressInterval);
  };

  // 停止进度条
  const stopProgress = (taskId: string) => {
    const interval = progressIntervalsRef.current.get(taskId);
    if (interval) {
      clearInterval(interval);
      progressIntervalsRef.current.delete(taskId);
    }
  };

  // 开始轮询任务状态
  const startPolling = (taskId: string, apiTaskId: string) => {
    errorCountsRef.current.set(taskId, 0);

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/video-generation/status/${apiTaskId}`, {
          headers: {
            ...(apiKey && { 'x-api-key': apiKey })
          }
        });

        const data = await response.json();

        console.log(`[MultiVideoGenerator] 任务 ${taskId} 状态:`, {
          apiTaskId,
          status: data.status,
          progress: data.progress?.progress_pct
        });

        if (!response.ok) {
          throw new Error(data.message || `查询失败: ${response.status}`);
        }

        // 查询成功，重置错误计数
        errorCountsRef.current.set(taskId, 0);

        // 更新任务状态
        if (data.status === 'completed') {
          stopPolling(taskId);
          stopProgress(taskId);
          updateTask(taskId, {
            status: 'completed',
            videoUrl: data.result?.output_url,
            progress: 100
          });
        } else if (data.status === 'failed') {
          stopPolling(taskId);
          stopProgress(taskId);
          updateTask(taskId, {
            status: 'failed',
            error: data.message || '未知原因',
            progress: 0
          });
        }

      } catch (err) {
        const currentErrors = (errorCountsRef.current.get(taskId) || 0) + 1;
        errorCountsRef.current.set(taskId, currentErrors);

        console.warn(`[MultiVideoGenerator] 任务 ${taskId} 查询失败 (${currentErrors}/${MAX_POLL_ERRORS}):`, err);

        if (currentErrors >= MAX_POLL_ERRORS) {
          stopPolling(taskId);
          stopProgress(taskId);
          updateTask(taskId, {
            status: 'failed',
            error: '网络连接不稳定，请检查网络后重试',
            progress: 0
          });
        }
      }
    }, POLLING_INTERVAL);

    pollIntervalsRef.current.set(taskId, pollInterval);
  };

  // 停止轮询
  const stopPolling = (taskId: string) => {
    const interval = pollIntervalsRef.current.get(taskId);
    if (interval) {
      clearInterval(interval);
      pollIntervalsRef.current.delete(taskId);
    }
  };

  // 停止所有轮询
  const stopAllPolling = () => {
    pollIntervalsRef.current.forEach(interval => clearInterval(interval));
    pollIntervalsRef.current.clear();
    progressIntervalsRef.current.forEach(interval => clearInterval(interval));
    progressIntervalsRef.current.clear();
    errorCountsRef.current.clear();
  };

  // 创建单个视频任务
  const createVideoTask = async (taskId: string): Promise<void> => {
    try {
      updateTask(taskId, { status: 'creating', progress: 0 });

      const requestBody: {
        model: string;
        prompt: string;
        images?: string[];
        creditsToConsume: number;
      } = {
        model,
        prompt,
        creditsToConsume: requiredCreditsPerVideo
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

      const apiTaskId = data.id || data.task_id;
      if (!apiTaskId) {
        throw new Error('API 未返回任务ID');
      }

      console.log(`[MultiVideoGenerator] 任务 ${taskId} 创建成功:`, apiTaskId);

      // 切换到轮询状态
      updateTask(taskId, {
        status: 'polling',
        taskId: apiTaskId,
        progress: 0
      });

      // 开始轮询和进度条
      startProgress(taskId);
      startPolling(taskId, apiTaskId);

    } catch (err) {
      console.error(`[MultiVideoGenerator] 任务 ${taskId} 创建失败:`, err);
      updateTask(taskId, {
        status: 'failed',
        error: err instanceof Error ? err.message : '未知错误',
        progress: 0
      });
    }
  };

  // 主提交逻辑 - 并行创建6个任务
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError(null);

    // 1. 检查登录状态
    if (!user) {
      setGlobalError('请先登录后再使用视频生成功能');
      setTimeout(() => {
        router.push('/login?redirect=/video-generation');
      }, 2000);
      return;
    }

    // 2. 检查积分是否充足
    if (credits < totalRequiredCredits) {
      setGlobalError(
        `积分不足！生成 ${TOTAL_VIDEOS} 个视频需要 ${totalRequiredCredits} 积分，当前剩余 ${credits} 积分`
      );
      return;
    }

    setIsGenerating(true);

    try {
      // 并行创建所有任务（使用 Promise.allSettled 确保单个失败不影响其他）
      const promises = tasks.map(task => createVideoTask(task.id));
      await Promise.allSettled(promises);

      // 刷新积分显示
      await refreshCredits();

    } catch (err) {
      setGlobalError(err instanceof Error ? err.message : '批量生成失败');
    } finally {
      setIsGenerating(false);
    }
  };

  // 重置表单
  const handleReset = () => {
    stopAllPolling();
    setPrompt('');
    setImageFile(null);
    setImagePreview(null);
    setGlobalError(null);
    setIsGenerating(false);
    setTasks(
      Array.from({ length: TOTAL_VIDEOS }, (_, i) => ({
        id: `task-${i}`,
        status: 'idle',
        progress: 0
      }))
    );
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 下载单个视频
  const handleDownload = async (task: VideoTask) => {
    if (!task.videoUrl) return;

    try {
      const downloadUrl = `/api/video/download?url=${encodeURIComponent(task.videoUrl)}`;
      const response = await fetch(downloadUrl);

      if (!response.ok) {
        throw new Error('下载失败');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai-video-${task.id}-${Date.now()}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('下载失败:', error);
      updateTask(task.id, { error: '下载失败，请重试' });
    }
  };

  // 批量下载所有成功的视频
  const handleDownloadAll = async () => {
    const completedTasks = tasks.filter(t => t.status === 'completed' && t.videoUrl);

    if (completedTasks.length === 0) {
      alert('没有已完成的视频可下载');
      return;
    }

    for (const task of completedTasks) {
      await handleDownload(task);
      // 稍微延迟，避免浏览器阻止多个下载
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  // 重试单个任务
  const handleRetry = async (task: VideoTask) => {
    if (credits < requiredCreditsPerVideo) {
      setGlobalError(`积分不足！需要 ${requiredCreditsPerVideo} 积分`);
      return;
    }

    await createVideoTask(task.id);
  };

  // 统计各状态任务数量
  const stats = {
    total: TOTAL_VIDEOS,
    idle: tasks.filter(t => t.status === 'idle').length,
    creating: tasks.filter(t => t.status === 'creating').length,
    polling: tasks.filter(t => t.status === 'polling').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    failed: tasks.filter(t => t.status === 'failed').length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 py-12">
      {/* Google One Tap - 右上角自动弹出登录 */}
      <GoogleOneTap />

      {/* 主体内容 - 左右分栏 */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* 左侧：输入区域 (33%) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-8 sticky top-8">
              <form onSubmit={handleSubmit} className="space-y-6">

                {/* 用户信息提示 */}
                {!authLoading && (
                  <div className={`p-4 rounded-xl border-2 ${
                    isLoggedIn
                      ? 'bg-green-50 border-green-200'
                      : 'bg-yellow-50 border-yellow-200'
                  }`}>
                    {isLoggedIn ? (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-green-800">
                          ✅ 已登录
                        </span>
                        <span className="text-sm font-bold text-green-800">
                          💎 剩余积分: {credits}
                        </span>
                      </div>
                    ) : (
                      <p className="text-sm text-yellow-800">
                        ⚠️ 请先<Link href="/login?redirect=/video-generation" className="underline font-bold">登录</Link>后使用
                      </p>
                    )}
                  </div>
                )}

                {/* 模型选择 */}
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="text-xl">📹</span>
                    视频模型
                  </label>
                  <div className="space-y-3">
                    <label className={`flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      model === 'sora2'
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}>
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name="model"
                          value="sora2"
                          checked={model === 'sora2'}
                          onChange={(e) => setModel(e.target.value as 'sora2')}
                          disabled={isGenerating}
                          className="w-5 h-5 text-purple-600"
                        />
                        <span className="ml-3 font-medium text-gray-800">标准版</span>
                      </div>
                      <span className="text-xs bg-purple-100 text-purple-800 px-3 py-1 rounded-full font-bold">
                        1 积分/个
                      </span>
                    </label>

                    <label className={`flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      model === 'sora2-unwm'
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}>
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name="model"
                          value="sora2-unwm"
                          checked={model === 'sora2-unwm'}
                          onChange={(e) => setModel(e.target.value as 'sora2-unwm')}
                          disabled={isGenerating}
                          className="w-5 h-5 text-purple-600"
                        />
                        <span className="ml-3 font-medium text-gray-800">专业版（无水印）</span>
                      </div>
                      <span className="text-xs bg-purple-100 text-purple-800 px-3 py-1 rounded-full font-bold">
                        2 积分/个
                      </span>
                    </label>
                  </div>
                </div>

                {/* 提示词输入 */}
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <span className="text-xl">✍️</span>
                    视频描述
                  </label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="描述您想要的视频内容，例如：一只可爱的猫咪在花园里玩耍..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all resize-none min-h-[140px]"
                    required
                    disabled={isGenerating}
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    💡 提示：所有 {TOTAL_VIDEOS} 个视频将使用相同的描述
                  </p>
                </div>

                {/* 图片上传 */}
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <span className="text-xl">🖼️</span>
                    参考图片（可选）
                  </label>

                  {!imagePreview ? (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-all"
                    >
                      <div className="text-6xl mb-3">📎</div>
                      <p className="text-gray-600 font-medium mb-1">点击上传图片</p>
                      <p className="text-xs text-gray-400">支持 PNG, JPG 格式</p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/jpg"
                        onChange={handleImageChange}
                        className="hidden"
                        disabled={isGenerating}
                      />
                    </div>
                  ) : (
                    <div className="relative rounded-xl overflow-hidden border-2 border-purple-300">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-48 object-cover"
                      />
                      <button
                        type="button"
                        onClick={clearImage}
                        disabled={isGenerating}
                        className="absolute top-2 right-2 bg-red-500 text-white w-8 h-8 rounded-full hover:bg-red-600 transition-colors flex items-center justify-center"
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  <p className="mt-2 text-xs text-red-600 flex items-center gap-1">
                    <span>⚠️</span>
                    注意：请勿上传真人照片，否则可能生成失败
                  </p>
                </div>

                {/* 积分消耗提示 */}
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                  <p className="text-sm text-blue-800">
                    <span className="font-bold">💳 积分消耗:</span>
                    {' '}{requiredCreditsPerVideo} 积分/个 × {TOTAL_VIDEOS} 个 = <span className="font-bold text-lg">{totalRequiredCredits}</span> 积分
                  </p>
                </div>

                {/* 全局错误提示 */}
                {globalError && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                    <p className="text-sm text-red-600">{globalError}</p>
                  </div>
                )}

                {/* 按钮组 */}
                <div className="space-y-3 pt-4">
                  <button
                    type="submit"
                    disabled={isGenerating || !prompt || !isLoggedIn || credits < totalRequiredCredits}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {isGenerating ? (
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
                        生成 {TOTAL_VIDEOS} 个视频 ({totalRequiredCredits} 积分)
                      </span>
                    )}
                  </button>

                  {stats.completed > 0 && (
                    <button
                      type="button"
                      onClick={handleDownloadAll}
                      className="w-full py-3 px-6 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-all"
                    >
                      📥 下载全部 ({stats.completed} 个视频)
                    </button>
                  )}

                  {(stats.completed > 0 || stats.failed > 0) && (
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

          {/* 右侧：6宫格视频展示区域 (67%) */}
          <div className="lg:col-span-2">
            {/* 状态统计栏 */}
            <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-800">生成进度</h3>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 bg-gray-300 rounded-full"></span>
                    <span className="text-gray-600">等待: {stats.idle}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></span>
                    <span className="text-gray-600">生成中: {stats.creating + stats.polling}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                    <span className="text-gray-600">完成: {stats.completed}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                    <span className="text-gray-600">失败: {stats.failed}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* 6宫格布局 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tasks.map((task, index) => (
                <VideoTaskCard
                  key={task.id}
                  task={task}
                  index={index}
                  onDownload={handleDownload}
                  onRetry={handleRetry}
                />
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
