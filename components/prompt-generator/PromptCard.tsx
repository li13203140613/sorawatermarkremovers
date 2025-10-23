'use client';

import { useState } from 'react';
import type { GeneratedPrompt } from '@/lib/prompt-generator/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
        console.log('Share cancelled');
      }
    } else {
      handleCopy();
    }
  };

  const handleDownload = () => {
    const textContent = `Sora 提示词 #${prompt.index || index}\n\n温度: ${prompt.temperature}\n\n${prompt.prompt}`;
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sora-prompt-${prompt.index || index}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 如果生成失败
  if (!prompt.success) {
    return (
      <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-bold text-red-600">
            Prompt #{prompt.index || index}
          </span>
          <Badge variant="destructive" className="text-xs">
            生成失败
          </Badge>
        </div>
        <div className="text-sm text-red-700">
          {prompt.error || '生成失败，请重试'}
        </div>
      </div>
    );
  }

  // 根据 index 选择渐变颜色方案
  const gradientColors = [
    { from: 'from-purple-50', to: 'to-green-50', border: 'border-purple-500' },
    { from: 'from-purple-50', to: 'to-pink-50', border: 'border-purple-500' },
    { from: 'from-amber-50', to: 'to-orange-50', border: 'border-amber-500' },
  ];

  const colorScheme = gradientColors[(prompt.index || index) % gradientColors.length];

  // 获取推荐徽章（温度 < 0.75 的标记为推荐）
  const isRecommended = prompt.temperature < 0.75;
  const isFast = prompt.temperature < 0.65;

  return (
    <div className="relative rounded-xl p-6 hover:shadow-xl transition-shadow bg-white border-2 border-gray-200 flex flex-col">
      {/* Gradient Border Effect */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 opacity-0 hover:opacity-10 transition-opacity pointer-events-none"></div>

      {/* Header */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-500">Prompt #{prompt.index || index}</span>
          {isRecommended && !isFast && (
            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
              <i className="fas fa-star mr-1"></i>推荐
            </Badge>
          )}
          {isFast && (
            <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">
              <i className="fas fa-bolt mr-1"></i>快速
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <i className="fas fa-thermometer-half" title="温度"></i>
          <span>{prompt.temperature.toFixed(1)}</span>
        </div>
      </div>

      {/* Prompt Content with Fixed Height */}
      <div className="mb-6 flex-1 relative z-10">
        <div className={`bg-gradient-to-r ${colorScheme.from} ${colorScheme.to} border-l-4 ${colorScheme.border} pl-4 pr-3 py-4 rounded-r-lg h-48 overflow-y-auto`}>
          <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
            {prompt.prompt}
          </p>
        </div>
      </div>

      {/* Action Buttons - Fixed at Bottom */}
      <div className="flex gap-2 mt-auto relative z-10">
        <Button
          onClick={handleCopy}
          variant="default"
          className="flex-1 bg-primary hover:bg-primary/90 text-white"
          size="sm"
        >
          {copied ? (
            <>
              <i className="fas fa-check mr-2"></i>已复制
            </>
          ) : (
            <>
              <i className="fas fa-copy mr-2"></i>复制
            </>
          )}
        </Button>

        <Button
          onClick={handleShare}
          variant="secondary"
          className="flex-1"
          size="sm"
        >
          {shared ? (
            <>
              <i className="fas fa-check mr-2"></i>已分享
            </>
          ) : (
            <>
              <i className="fas fa-share-alt mr-2"></i>分享
            </>
          )}
        </Button>

        <Button
          onClick={handleDownload}
          variant="outline"
          className="flex-1"
          size="sm"
        >
          <i className="fas fa-download mr-2"></i>下载
        </Button>
      </div>
    </div>
  );
}
