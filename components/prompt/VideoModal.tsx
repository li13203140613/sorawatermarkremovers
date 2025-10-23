'use client';

import { useEffect, useState } from 'react';

interface VideoModalProps {
  isOpen: boolean;
  prompt: {
    id: string;
    category: string;
    categoryLabel: string;
    categoryIcon: string;
    prompt: string;
    thumbnailUrl: string;
    videoUrl: string;
  };
  onClose: () => void;
}

export function VideoModal({ isOpen, prompt, onClose }: VideoModalProps) {
  const [isCopied, setIsCopied] = useState(false);

  // 处理 ESC 键关闭
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // 禁止背景滚动
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // 复制提示词
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt.prompt);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  // 获取分类颜色
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      animal: 'bg-yellow-100 text-yellow-800',
      people: 'bg-red-100 text-red-800',
      landscape: 'bg-green-100 text-green-800',
      tech: 'bg-purple-100 text-purple-800',
      art: 'bg-purple-100 text-purple-800',
      food: 'bg-orange-100 text-orange-800',
      architecture: 'bg-slate-100 text-slate-800',
      abstract: 'bg-pink-100 text-pink-800',
      action: 'bg-rose-100 text-rose-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* 弹窗内容 */}
      <div
        className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-all duration-200 shadow-lg hover:scale-110"
          aria-label="关闭"
        >
          <svg
            className="w-6 h-6 text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* 视频播放器 */}
        <div className="relative aspect-video bg-black">
          <video
            src={prompt.videoUrl}
            controls
            autoPlay
            className="w-full h-full"
            poster={prompt.thumbnailUrl}
          >
            您的浏览器不支持视频播放
          </video>
        </div>

        {/* 提示词信息 */}
        <div className="p-6">
          {/* 分类标签 */}
          <div className="mb-4">
            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${getCategoryColor(prompt.category)}`}>
              <span className="text-lg">{prompt.categoryIcon}</span>
              <span>{prompt.categoryLabel}</span>
            </span>
          </div>

          {/* 提示词文本 */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-500 mb-2">提示词</h3>
            <p className="text-gray-800 text-base leading-relaxed">
              {prompt.prompt}
            </p>
          </div>

          {/* 复制按钮 */}
          <button
            onClick={handleCopy}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
              isCopied
                ? 'bg-green-500 text-white'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {isCopied ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                已复制到剪贴板
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                复制提示词
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
