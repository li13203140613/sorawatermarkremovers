'use client';

import { useState } from 'react';
import PromptGeneratorForm from '@/components/prompt-generator/PromptGeneratorForm';
import PromptResultsDisplay from '@/components/prompt-generator/PromptResultsDisplay';
import PromptGallery from '@/components/prompt-generator/PromptGallery';
import SoraIntroduction from '@/components/prompt-generator/SoraIntroduction';
import ProductAdvantages from '@/components/prompt-generator/ProductAdvantages';
import FAQ from '@/components/prompt-generator/FAQ';
import type { GeneratedPrompt } from '@/lib/prompt-generator/types';

export default function PromptGeneratorPage() {
  const [prompts, setPrompts] = useState<GeneratedPrompt[]>([]);

  const handleGenerated = (generatedPrompts: GeneratedPrompt[]) => {
    setPrompts(generatedPrompts);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-purple-50 via-white to-green-50 py-8 px-4 border-b border-gray-200">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
              Sora AI 提示词生成器
            </span>
          </h1>
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-white py-10">
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
