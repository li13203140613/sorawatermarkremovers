'use client';

import React from 'react';

export type TaskStatus = 'idle' | 'creating' | 'polling' | 'completed' | 'failed';

export interface VideoTask {
  id: string;
  status: TaskStatus;
  taskId?: string;
  videoUrl?: string;
  error?: string;
  progress: number; // 0-100
}

interface VideoTaskCardProps {
  task: VideoTask;
  index: number;
  onDownload?: (task: VideoTask) => void;
  onRetry?: (task: VideoTask) => void;
}

export default function VideoTaskCard({ task, index, onDownload, onRetry }: VideoTaskCardProps) {
  const getStatusBadge = () => {
    switch (task.status) {
      case 'idle':
        return (
          <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-semibold">
            <span>⏳</span>
            <span>等待生成</span>
          </span>
        );
      case 'creating':
        return (
          <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-xs font-semibold">
            <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>创建中</span>
          </span>
        );
      case 'polling':
        return (
          <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-xs font-semibold">
            <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>生成中</span>
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 bg-green-100 text-green-600 px-3 py-1 rounded-full text-xs font-semibold">
            <span>✅</span>
            <span>完成</span>
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-semibold">
            <span>❌</span>
            <span>失败</span>
          </span>
        );
    }
  };

  const getStatusIcon = () => {
    switch (task.status) {
      case 'idle':
        return '📹';
      case 'creating':
      case 'polling':
        return '🎨';
      case 'completed':
        return '🎬';
      case 'failed':
        return '⚠️';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-gray-100 hover:border-purple-200 transition-all">
      {/* 卡片头部 */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-gray-700">视频 #{index + 1}</span>
          {getStatusBadge()}
        </div>
      </div>

      {/* 卡片内容 */}
      <div className="p-4">

        {/* 空闲状态 */}
        {task.status === 'idle' && (
          <div className="text-center py-8">
            <div className="text-6xl mb-3">{getStatusIcon()}</div>
            <p className="text-sm text-gray-500">等待生成...</p>
          </div>
        )}

        {/* 创建中/生成中 */}
        {(task.status === 'creating' || task.status === 'polling') && (
          <div className="text-center py-6">
            <div className="text-5xl mb-4 animate-pulse">{getStatusIcon()}</div>

            {/* 进度条 */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300 animate-pulse"
                style={{ width: `${Math.round(task.progress)}%` }}
              ></div>
            </div>

            <p className="text-xl font-bold text-purple-600 mb-1">
              {Math.round(task.progress)}%
            </p>
            <p className="text-xs text-gray-500">
              {task.status === 'creating' ? '正在创建任务...' : 'AI 正在创作中...'}
            </p>
          </div>
        )}

        {/* 失败状态 */}
        {task.status === 'failed' && (
          <div className="text-center py-6">
            <div className="text-5xl mb-3">{getStatusIcon()}</div>
            <p className="text-sm font-semibold text-red-600 mb-2">生成失败</p>
            {task.error && (
              <p className="text-xs text-gray-500 bg-red-50 rounded-lg p-2 mb-3 line-clamp-2">
                {task.error}
              </p>
            )}
            {onRetry && (
              <button
                onClick={() => onRetry(task)}
                className="text-xs px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                🔄 重试
              </button>
            )}
          </div>
        )}

        {/* 完成状态 */}
        {task.status === 'completed' && task.videoUrl && (
          <div>
            {/* 视频预览 - 使用代理 + 强缓存 + 自动预加载 */}
            <div className="rounded-lg overflow-hidden mb-3 bg-black">
              <video
                controls
                loop
                className="w-full aspect-video object-contain"
                src={`/api/video/proxy?url=${encodeURIComponent(task.videoUrl)}`}
                preload="auto"
                poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 225'%3E%3Crect fill='%23000' width='400' height='225'/%3E%3Ctext fill='%23fff' x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-family='Arial' font-size='20'%3E点击播放视频%3C/text%3E%3C/svg%3E"
              >
                您的浏览器不支持视频播放。
              </video>
            </div>

            {/* 视频链接显示 */}
            <div className="mb-3 p-2 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-start gap-2">
                <span className="text-xs text-gray-500 flex-shrink-0 pt-1">🔗</span>
                <input
                  type="text"
                  value={task.videoUrl}
                  readOnly
                  className="flex-1 text-xs text-gray-600 bg-transparent border-none outline-none cursor-text"
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(task.videoUrl || '');
                    alert('✅ 视频链接已复制！');
                  }}
                  className="flex-shrink-0 text-xs px-2 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
                  title="复制链接"
                >
                  📋
                </button>
              </div>
            </div>

            {/* 下载按钮 */}
            {onDownload && (
              <button
                onClick={() => onDownload(task)}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2 px-4 rounded-lg font-semibold text-sm hover:shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2"
              >
                <span>📥</span>
                <span>下载视频</span>
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
