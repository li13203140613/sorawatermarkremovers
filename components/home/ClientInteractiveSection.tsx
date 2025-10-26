/**
 * 客户端交互区域
 * 包含所有需要客户端状态管理的组件
 */
'use client';

import { useState } from 'react';
import { GoogleOneTap } from '@/components/auth';
import PromptGeneratorV2 from '@/components/prompt-generator/PromptGeneratorV2';
import PromptResultsDisplay from '@/components/prompt-generator/PromptResultsDisplay';
import PromptGallery from '@/components/prompt-generator/PromptGallery';
import FAQ from '@/components/prompt-generator/FAQ';
import type { GeneratedPrompt } from '@/lib/prompt-generator/types';

export default function ClientInteractiveSection() {
  const [prompts, setPrompts] = useState<GeneratedPrompt[]>([]);

  const handleGenerated = (generatedPrompts: GeneratedPrompt[]) => {
    setPrompts(generatedPrompts);
  };

  return (
    <>
      {/* Google One Tap - 客户端认证 */}
      <GoogleOneTap />

      {/* Input Section - 客户端表单交互 */}
      <div className="bg-white py-10 border-b border-gray-200">
        <div className="container mx-auto px-4 max-w-4xl">
          <PromptGeneratorV2 onGenerated={handleGenerated} />
        </div>
      </div>

      {/* Results Section - 客户端动态结果 */}
      <div id="results">
        <PromptResultsDisplay prompts={prompts} />
      </div>

      {/* Gallery Section - 客户端画廊（可能有交互） */}
      <PromptGallery />

      {/* FAQ Section - 客户端折叠面板 */}
      <FAQ />
    </>
  );
}
