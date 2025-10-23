'use client';

import { useState } from 'react';
import Image from 'next/image';

interface PromptCardProps {
  prompt: {
    id: string;
    category: string;
    categoryLabel: string;
    categoryIcon: string;
    prompt: string;
    thumbnailUrl: string;
    videoUrl: string;
  };
  onOpenVideo: (prompt: PromptCardProps['prompt']) => void;
}

export function PromptCard({ prompt, onOpenVideo }: PromptCardProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // 复制提示词
  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();

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

  return (
    <div
      className="group bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 视频封面 */}
      <div
        className="relative aspect-video bg-gray-100 overflow-hidden"
        onClick={() => onOpenVideo(prompt)}
      >
        <Image
          src={prompt.thumbnailUrl}
          alt={prompt.prompt}
          fill
          className={`object-cover transition-transform duration-300 ${
            isHovered ? 'scale-110' : 'scale-100'
          }`}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* 播放按钮覆盖层 */}
        <div className={`absolute inset-0 bg-black/30 flex items-center justify-center transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center transform transition-transform duration-300 hover:scale-110">
            <svg
              className="w-8 h-8 text-indigo-600 ml-1"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>

      {/* 卡片内容 */}
      <div className="p-5">
        {/* 分类标签 */}
        <div className="mb-3">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(prompt.category)}`}>
            <span>{prompt.categoryIcon}</span>
            <span>{prompt.categoryLabel}</span>
          </span>
        </div>

        {/* 提示词文本 */}
        <p className="text-gray-700 text-sm leading-relaxed mb-4 line-clamp-3">
          {prompt.prompt}
        </p>

        {/* 复制按钮 */}
        <button
          onClick={handleCopy}
          className={`w-full py-2.5 px-4 rounded-lg font-medium transition-all duration-200 ${
            isCopied
              ? 'bg-green-500 text-white'
              : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
          }`}
        >
          {isCopied ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              已复制
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
  );
}
