'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import PromptGeneratorForm from '@/components/prompt-generator/PromptGeneratorForm';
import PromptResultsDisplay from '@/components/prompt-generator/PromptResultsDisplay';
import PromptGallery from '@/components/prompt-generator/PromptGallery';
import SoraIntroduction from '@/components/prompt-generator/SoraIntroduction';
import ProductAdvantages from '@/components/prompt-generator/ProductAdvantages';
import FAQ from '@/components/prompt-generator/FAQ';
import type { GeneratedPrompt } from '@/lib/prompt-generator/types';

export default function PromptGeneratorPage() {
  const t = useTranslations('promptGenerator');
  const [prompts, setPrompts] = useState<GeneratedPrompt[]>([]);

  const handleGenerated = (generatedPrompts: GeneratedPrompt[]) => {
    setPrompts(generatedPrompts);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gray-50 py-16 px-4 text-center border-b border-gray-200">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
          <span className="block">✨ 使用我们的免费生成器创建</span>
          <span className="block mt-2">精彩的 Sora AI 视频提示词</span>
        </h1>
      </div>

      {/* Input Section */}
      <div className="bg-white py-10 border-b border-gray-200">
        <PromptGeneratorForm onGenerated={handleGenerated} />
      </div>

      {/* Results Section */}
      <div id="results">
        <PromptResultsDisplay prompts={prompts} />
      </div>

      {/* Gallery Section */}
      <PromptGallery />

      {/* Sora Introduction Section */}
      <SoraIntroduction />

      {/* Product Advantages Section */}
      <ProductAdvantages />

      {/* FAQ Section */}
      <FAQ />
    </div>
  );
}
