'use client';

import React, { useState, useRef } from 'react';

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
  const [model, setModel] = useState<'sora2' | 'sora2-unwm'>('sora2');
  const [prompt, setPrompt] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [taskStatus, setTaskStatus] = useState<TaskStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

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
      // 创建预览
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
    setTaskStatus(null);
    setLoading(true);

    try {
      const requestBody: {
        model: string;
        prompt: string;
        images?: string[];
      } = {
        model,
        prompt
      };

      if (imageFile) {
        const base64Image = await fileToBase64(imageFile);
        requestBody.images = [base64Image];
      }

      const response = await fetch('/api/aicoding/create', {
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

      console.log('Task created:', data);
      const actualTaskId = data.id || data.task_id;
      if (!actualTaskId) {
        throw new Error('API 未返回任务ID');
      }
      setTaskId(actualTaskId);
      startPolling(actualTaskId);

    } catch (err) {
      setError(err instanceof Error ? err.message : '未知错误');
      setLoading(false);
    }
  };

  // 开始轮询任务状态
  const startPolling = (id: string) => {
    let pollCount = 0;
    const maxPolls = 120;

    pollIntervalRef.current = setInterval(async () => {
      pollCount++;

      try {
        const response = await fetch(`/api/aicoding/status/${id}`, {
          headers: {
            ...(apiKey && { 'x-api-key': apiKey })
          }
        });

        const data: TaskStatus = await response.json();

        if (!response.ok) {
          throw new Error(data.message || `查询失败: ${response.status}`);
        }

        setTaskStatus(data);

        if (data.status === 'completed' || data.status === 'failed') {
          stopPolling();
          setLoading(false);

          if (data.status === 'failed') {
            setError(`任务失败: ${data.message}`);
          }
        }

        if (pollCount >= maxPolls) {
          stopPolling();
          setLoading(false);
          setError('生成超时，请稍后重试');
        }

      } catch (err) {
        stopPolling();
        setLoading(false);
        setError(err instanceof Error ? err.message : '查询失败');
      }
    }, 1000);
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
    setTaskId(null);
    setTaskStatus(null);
    setError(null);
    setLoading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 下载视频
  const handleDownload = () => {
    if (taskStatus?.result?.output_url) {
      const link = document.createElement('a');
      link.href = taskStatus.result.output_url;
      link.download = `ai-video-${taskId}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      {/* 顶部横幅 */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-4xl font-bold mb-3 flex items-center gap-3">
            <span className="text-5xl">🎬</span>
            AI 视频生成工作室
          </h1>
          <p className="text-purple-100 text-lg">使用先进的 AI 技术，将创意变为现实</p>
        </div>
      </div>

      {/* 主体内容 - 左右分栏 */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* 左侧：输入区域 (40%) */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-8 sticky top-8">
              <form onSubmit={handleSubmit} className="space-y-6">

                {/* 模型选择 */}
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="text-xl">📹</span>
                    视频模型
                  </label>
                  <div className="space-y-3">
                    <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      model === 'sora2'
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}>
                      <input
                        type="radio"
                        name="model"
                        value="sora2"
                        checked={model === 'sora2'}
                        onChange={(e) => setModel(e.target.value as 'sora2')}
                        disabled={loading}
                        className="w-5 h-5 text-purple-600"
                      />
                      <span className="ml-3 font-medium text-gray-800">标准版</span>
                    </label>

                    <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      model === 'sora2-unwm'
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}>
                      <input
                        type="radio"
                        name="model"
                        value="sora2-unwm"
                        checked={model === 'sora2-unwm'}
                        onChange={(e) => setModel(e.target.value as 'sora2-unwm')}
                        disabled={loading}
                        className="w-5 h-5 text-purple-600"
                      />
                      <span className="ml-3 font-medium text-gray-800">专业版（无水印）</span>
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
                    disabled={loading}
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    💡 提示：可以通过描述控制视频的横屏/竖屏、比例等
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
                      <p className="text-gray-600 font-medium mb-1">点击或拖拽上传图片</p>
                      <p className="text-xs text-gray-400">支持 PNG, JPG 格式</p>
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
                    <div className="relative rounded-xl overflow-hidden border-2 border-purple-300">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-48 object-cover"
                      />
                      <button
                        type="button"
                        onClick={clearImage}
                        disabled={loading}
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

                {/* 按钮组 */}
                <div className="space-y-3 pt-4">
                  <button
                    type="submit"
                    disabled={loading || !prompt}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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
                        开始生成视频
                      </span>
                    )}
                  </button>

                  {(taskId || error) && (
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
              {!taskStatus && !error && !loading && (
                <div className="text-center px-8 py-16">
                  <div className="text-8xl mb-6 animate-bounce">📹</div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">准备好开始创作了吗？</h3>
                  <p className="text-gray-500 text-lg">填写左侧表单，点击生成按钮开始创作您的视频</p>
                </div>
              )}

              {/* 生成中状态 */}
              {loading && !taskStatus && (
                <div className="text-center px-8 py-16 w-full max-w-md">
                  <div className="text-7xl mb-6 animate-pulse">🎨</div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-6">AI 正在创作中...</h3>
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-4 overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full animate-pulse" style={{width: '50%'}}></div>
                  </div>
                  <p className="text-gray-500">请稍候，这可能需要几分钟时间</p>
                </div>
              )}

              {/* 处理中状态（有进度） */}
              {taskStatus && taskStatus.status !== 'completed' && (
                <div className="text-center px-8 py-16 w-full max-w-md">
                  <div className="text-7xl mb-6">
                    {taskStatus.status === 'processing' ? '⚡' : '⏸️'}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">
                    {taskStatus.status === 'processing' ? 'AI 正在创作中...' : '等待处理...'}
                  </h3>

                  {taskStatus.status === 'processing' && (
                    <>
                      <div className="w-full bg-gray-200 rounded-full h-4 mb-4 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 h-4 rounded-full transition-all duration-500"
                          style={{width: `${taskStatus.progress.progress_pct}%`}}
                        ></div>
                      </div>
                      <p className="text-3xl font-bold text-purple-600 mb-2">
                        {taskStatus.progress.progress_pct}%
                      </p>
                    </>
                  )}

                  <p className="text-gray-600 mt-4">{taskStatus.message}</p>
                </div>
              )}

              {/* 错误状态 */}
              {error && (
                <div className="text-center px-8 py-16 w-full max-w-md">
                  <div className="text-7xl mb-6">❌</div>
                  <h3 className="text-2xl font-bold text-red-600 mb-3">生成失败</h3>
                  <p className="text-gray-600 bg-red-50 rounded-lg p-4">{error}</p>
                  <button
                    onClick={handleReset}
                    className="mt-6 px-8 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors"
                  >
                    重新尝试
                  </button>
                </div>
              )}

              {/* 完成状态 */}
              {taskStatus?.status === 'completed' && taskStatus.result?.output_url && (
                <div className="w-full p-8">
                  <div className="mb-6 text-center">
                    <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-6 py-3 rounded-full font-bold text-lg">
                      <span className="text-2xl">✅</span>
                      生成完成！
                    </div>
                  </div>

                  <div className="rounded-2xl overflow-hidden shadow-2xl mb-6">
                    <video
                      controls
                      autoPlay
                      loop
                      className="w-full"
                      src={taskStatus.result.output_url}
                    >
                      您的浏览器不支持视频播放。
                    </video>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={handleDownload}
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2"
                    >
                      <span className="text-2xl">📥</span>
                      下载视频
                    </button>

                    <button
                      onClick={handleReset}
                      className="flex-1 bg-gradient-to-r from-purple-500 to-blue-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2"
                    >
                      <span className="text-2xl">🔄</span>
                      重新生成
                    </button>
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
