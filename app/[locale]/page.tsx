'use client'

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { GoogleOneTap } from '@/components/auth'
import PromptGeneratorForm from '@/components/prompt-generator/PromptGeneratorForm';
import PromptResultsDisplay from '@/components/prompt-generator/PromptResultsDisplay';
import PromptGallery from '@/components/prompt-generator/PromptGallery';
import SoraIntroduction from '@/components/prompt-generator/SoraIntroduction';
import ProductAdvantages from '@/components/prompt-generator/ProductAdvantages';
import FAQ from '@/components/prompt-generator/FAQ';
import type { GeneratedPrompt } from '@/lib/prompt-generator/types';

export default function Home() {
  const t = useTranslations('home');
  const [prompts, setPrompts] = useState<GeneratedPrompt[]>([]);

  const handleGenerated = (generatedPrompts: GeneratedPrompt[]) => {
    setPrompts(generatedPrompts);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Google One Tap */}
      <GoogleOneTap />

      {/* Hero Section */}
      <div className="bg-gray-50 py-16 px-4 text-center border-b border-gray-200">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
          {t('hero.title')}
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
  )
}
