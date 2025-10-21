'use client';

import { useState } from 'react';
import { GeneratedPrompt } from '@/lib/prompt-generator/types';
import { copyToClipboard, downloadAsTextFile, sharePrompt } from '@/lib/prompt-generator/api';

interface PromptCardProps {
  prompt: GeneratedPrompt;
  locale?: string;
}

export default function PromptCard({ prompt, locale = 'en' }: PromptCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(prompt.content);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    await sharePrompt(prompt.content, `Sora Prompt #${prompt.index}`);
  };

  const handleDownload = () => {
    downloadAsTextFile(prompt.content, `sora-prompt-${prompt.index}.txt`);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
      {/* Prompt Number */}
      <div className="text-xs text-gray-500 font-semibold mb-3">
        Prompt #{prompt.index}
      </div>

      {/* Prompt Content */}
      <div className="text-sm text-gray-800 leading-relaxed mb-4 min-h-[150px]">
        {prompt.content}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={handleCopy}
          className="bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-2 rounded transition-colors"
        >
          {copied ? '✅ Copied!' : '📋 Copy'}
        </button>

        <button
          onClick={handleShare}
          className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-2 rounded transition-colors"
        >
          🔗 Share
        </button>

        <button
          onClick={handleDownload}
          className="bg-orange-500 hover:bg-orange-600 text-white text-xs px-3 py-2 rounded transition-colors"
        >
          ⬇️ Download
        </button>
      </div>
    </div>
  );
}
