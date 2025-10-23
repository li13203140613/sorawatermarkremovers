'use client';

import { useState } from 'react';
import Image from 'next/image';

export interface SoraPrompt {
  id: number;
  title: string;
  prompt: string;
  tags: string[];
  videoUrl: string | null;
  r2VideoUrl?: string | null;
  videoFile: string | null;
  crawledAt: string;
}

interface PromptCardProps {
  prompt: SoraPrompt;
}

export default function PromptCard({ prompt }: PromptCardProps) {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isPromptExpanded, setIsPromptExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const videoUrl = prompt.r2VideoUrl || prompt.videoUrl;
  const displayPrompt = isPromptExpanded ? prompt.prompt : prompt.prompt.substring(0, 150);
  const needsExpand = prompt.prompt.length > 150;

  // 复制提示词
  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(prompt.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
      {/* 视频区域 */}
      {videoUrl && (
        <div className="relative aspect-video bg-gray-100">
          <video
            className="w-full h-full object-cover"
            src={videoUrl}
            controls
            preload="metadata"
            onPlay={() => setIsVideoPlaying(true)}
            onPause={() => setIsVideoPlaying(false)}
          >
            您的浏览器不支持视频播放
          </video>
        </div>
      )}

      {/* 内容区域 */}
      <div className="p-4">
        {/* 标题 */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {prompt.title}
        </h3>

        {/* 标签 */}
        {prompt.tags && prompt.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {prompt.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* 提示词 */}
        <div className="mb-3">
          <p className="text-sm text-gray-700 leading-relaxed">
            {displayPrompt}
            {needsExpand && !isPromptExpanded && '...'}
          </p>
          {needsExpand && (
            <button
              onClick={() => setIsPromptExpanded(!isPromptExpanded)}
              className="text-sm text-purple-600 hover:text-purple-800 mt-1"
            >
              {isPromptExpanded ? '收起' : '展开'}
            </button>
          )}
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
          <button
            onClick={handleCopyPrompt}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors"
          >
            {copied ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                已复制
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                复制提示词
              </>
            )}
          </button>

          <span className="text-xs text-gray-500">
            ID: {prompt.id}
          </span>
        </div>
      </div>
    </div>
  );
}
