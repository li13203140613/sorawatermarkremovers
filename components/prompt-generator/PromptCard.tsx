'use client';

import { useState } from 'react';
import { GeneratedPrompt, copyToClipboard, exportAsText } from '@/lib/prompt-generator';

interface PromptCardProps {
  prompt: GeneratedPrompt;
  index: number;
}

export default function PromptCard({ prompt, index }: PromptCardProps) {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(prompt.prompt);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Sora 提示词 #${index}`,
          text: prompt.prompt,
        });
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      } catch (error) {
        // 用户取消分享或不支持
        console.log('Share cancelled');
      }
    } else {
      // 降级到复制
      handleCopy();
    }
  };

  const handleDownload = () => {
    const textContent = exportAsText(prompt);
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sora-prompt-${index}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white border-2 border-gray-200 rounded-lg p-6 shadow-md hover:shadow-xl transition-shadow">
      {/* Prompt Number */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-bold text-gray-500">
          Prompt #{index}
        </span>
        <span className="text-xs text-gray-400">
          {prompt.categoryName}
        </span>
      </div>

      {/* Prompt Content with left border */}
      <div className="border-l-4 border-green-500 pl-4 mb-6">
        <div className="text-sm text-gray-800 leading-relaxed min-h-[100px]">
          {prompt.prompt}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={handleCopy}
          className="flex-1 bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-4 py-2 rounded transition-colors"
        >
          {copied ? '✅ 已复制' : '📋 复制'}
        </button>

        <button
          onClick={handleShare}
          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded transition-colors"
        >
          {shared ? '✅ 已分享' : '🔗 分享'}
        </button>

        <button
          onClick={handleDownload}
          className="flex-1 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded transition-colors"
        >
          ⬇️ 下载
        </button>
      </div>
    </div>
  );
}
