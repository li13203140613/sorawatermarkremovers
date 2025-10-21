'use client';

import { useState } from 'react';
import { VideoType, PromptCount } from '@/lib/prompt-generator/types';
import { VIDEO_TYPES, PROMPT_COUNTS, DEFAULT_EXAMPLE_TEXT } from '@/lib/prompt-generator/constants';

interface PromptGeneratorFormProps {
  onSubmit: (videoIdea: string, videoType: VideoType, promptCount: PromptCount) => void;
  loading?: boolean;
  locale?: string;
}

export default function PromptGeneratorForm({ onSubmit, loading = false, locale = 'en' }: PromptGeneratorFormProps) {
  const [videoIdea, setVideoIdea] = useState('');
  const [videoType, setVideoType] = useState<VideoType | ''>('');
  const [promptCount, setPromptCount] = useState<PromptCount>(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!videoIdea.trim()) {
      alert('Please enter your video idea');
      return;
    }

    if (!videoType) {
      alert('Please select a video type');
      return;
    }

    onSubmit(videoIdea, videoType, promptCount);
  };

  return (
    <div className="max-w-2xl mx-auto my-10 px-4">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Video Idea Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            📝 输入您的视频创意
          </label>
          <textarea
            value={videoIdea}
            onChange={(e) => setVideoIdea(e.target.value)}
            placeholder={DEFAULT_EXAMPLE_TEXT}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent resize-y min-h-[100px]"
            disabled={loading}
          />
        </div>

        {/* Video Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            🎬 选择视频类型
          </label>
          <select
            value={videoType}
            onChange={(e) => setVideoType(e.target.value as VideoType)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
            disabled={loading}
          >
            <option value="">-- 选择类型 --</option>
            {VIDEO_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Prompt Count Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            🔢 生成提示词数量
          </label>
          <select
            value={promptCount}
            onChange={(e) => setPromptCount(Number(e.target.value) as PromptCount)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
            disabled={loading}
          >
            {PROMPT_COUNTS.map((count) => (
              <option key={count.value} value={count.value}>
                {count.label}
              </option>
            ))}
          </select>
        </div>

        {/* Submit Button */}
        <div className="text-center">
          <button
            type="submit"
            disabled={loading}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-md transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? '⏳ Generating...' : '🚀 Generate AI Prompt'}
          </button>
        </div>
      </form>
    </div>
  );
}
