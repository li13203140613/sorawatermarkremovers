'use client'

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { GoogleOneTap } from '@/components/auth'
import {
  type PromptCategory,
  type GeneratedPrompt,
  generatePromptVariants,
} from '@/lib/prompt-generator';
import PromptGeneratorForm from '@/components/prompt-generator/PromptGeneratorForm';
import PromptResultsDisplay from '@/components/prompt-generator/PromptResultsDisplay';
import PromptGallery from '@/components/prompt-generator/PromptGallery';
import SoraIntroduction from '@/components/prompt-generator/SoraIntroduction';
import ProductAdvantages from '@/components/prompt-generator/ProductAdvantages';
import FAQ from '@/components/prompt-generator/FAQ';

export default function Home() {
  const t = useTranslations('home');
  const [loading, setLoading] = useState(false);
  const [prompts, setPrompts] = useState<GeneratedPrompt[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (
    category: PromptCategory,
    values: Record<string, string>,
    promptCount: number
  ) => {
    setLoading(true);
    setError(null);

    try {
      // 使用本地生成
      const generatedPrompts = generatePromptVariants(
        { category, values },
        promptCount
      );

      setPrompts(generatedPrompts);

      // Scroll to results
      setTimeout(() => {
        const resultsSection = document.getElementById('results');
        if (resultsSection) {
          resultsSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } catch (err) {
      console.error('Error generating prompts:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
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
        <PromptGeneratorForm onSubmit={handleGenerate} loading={loading} />

        {/* Error Message */}
        {error && (
          <div className="max-w-2xl mx-auto px-4 mt-4">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          </div>
        )}
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
