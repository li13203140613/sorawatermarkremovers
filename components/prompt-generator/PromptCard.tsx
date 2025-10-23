'use client';

import { useState } from 'react';
import type { GeneratedPrompt } from '@/lib/prompt-generator/types';

interface PromptCardProps {
  prompt: GeneratedPrompt;
  index: number;
}

export default function PromptCard({ prompt, index }: PromptCardProps) {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
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
    const textContent = `Sora 提示词 #${index}\n\n温度: ${prompt.temperature}\nTokens: ${prompt.usage.totalTokens}\n成本: ¥${prompt.cost.totalCost.toFixed(6)}\n\n${prompt.prompt}`;
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sora-prompt-${index}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 如果生成失败
  if (!prompt.success) {
    return (
      <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-bold text-red-600">
            Prompt #{prompt.index}
          </span>
          <span className="text-xs text-red-500">
            生成失败
          </span>
        </div>
        <div className="text-sm text-red-700">
          {prompt.error || '生成失败，请重试'}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border-2 border-gray-200 rounded-lg p-6 shadow-md hover:shadow-xl transition-shadow">
      {/* Prompt Number & Stats */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-bold text-gray-500">
          Prompt #{prompt.index}
        </span>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span title={`温度: ${prompt.temperature}`}>
            🌡️ {prompt.temperature}
          </span>
          <span title={`Tokens: ${prompt.usage.totalTokens}`}>
            📊 {prompt.usage.totalTokens}
          </span>
          <span title={`成本: ¥${prompt.cost.totalCost.toFixed(6)} (${(prompt.cost.totalCost * 100).toFixed(4)}分)`}>
            💰 {(prompt.cost.totalCost * 100).toFixed(2)}分
          </span>
        </div>
      </div>

      {/* Prompt Content with left border */}
      <div className="border-l-4 border-green-500 pl-4 mb-6">
        <div className="text-sm text-gray-800 leading-relaxed min-h-[100px] whitespace-pre-wrap">
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
