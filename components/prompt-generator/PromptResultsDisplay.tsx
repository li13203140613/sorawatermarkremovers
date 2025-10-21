'use client';

import { GeneratedPrompt } from '@/lib/prompt-generator/types';
import PromptCard from './PromptCard';

interface PromptResultsDisplayProps {
  prompts: GeneratedPrompt[];
  locale?: string;
}

export default function PromptResultsDisplay({ prompts, locale = 'en' }: PromptResultsDisplayProps) {
  if (prompts.length === 0) return null;

  // Determine grid layout based on number of prompts
  const getGridClass = () => {
    if (prompts.length <= 3) {
      return 'grid-cols-1'; // Single column for 1-3 prompts
    } else if (prompts.length <= 6) {
      return 'grid-cols-1 md:grid-cols-2'; // 2 columns for 4-6 prompts
    } else {
      return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'; // 3 columns for 7-9 prompts
    }
  };

  return (
    <div className="bg-gray-50 py-10 px-4 border-t border-gray-200">
      <div className="max-w-5xl mx-auto">
        {/* Section Title */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            ✅ 您优化的 Sora AI 提示词结果 - 专业级 Sora 提示词
          </h2>
        </div>

        {/* Results Grid */}
        <div className={`grid ${getGridClass()} gap-6`}>
          {prompts.map((prompt) => (
            <PromptCard key={prompt.id} prompt={prompt} locale={locale} />
          ))}
        </div>
      </div>
    </div>
  );
}
