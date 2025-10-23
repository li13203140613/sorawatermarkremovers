'use client';

import { GeneratedPrompt } from '@/lib/prompt-generator';
import PromptCard from './PromptCard';

interface PromptResultsDisplayProps {
  prompts: GeneratedPrompt[];
}

export default function PromptResultsDisplay({ prompts }: PromptResultsDisplayProps) {
  if (prompts.length === 0) return null;

  return (
    <div className="bg-gray-50 py-12 px-4 border-t border-gray-200">
      <div className="max-w-6xl mx-auto">
        {/* Section Title */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            生成的提示词结果
          </h2>
          <p className="text-gray-600">
            系统已为您生成 {prompts.length} 个专业级 Sora 视频提示词
          </p>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {prompts.map((prompt, index) => (
            <PromptCard
              key={`${prompt.category}-${index}`}
              prompt={prompt}
              index={index + 1}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
