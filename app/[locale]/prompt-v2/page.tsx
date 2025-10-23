'use client';

import { useState } from 'react';
import PromptGeneratorV2 from '@/components/prompt-generator/PromptGeneratorV2';
import type { GeneratedPrompt } from '@/lib/prompt-generator/types';

export default function PromptV2Page() {
  const [prompts, setPrompts] = useState<GeneratedPrompt[]>([]);

  const handleGenerated = (generatedPrompts: GeneratedPrompt[]) => {
    setPrompts(generatedPrompts);
    console.log('Generated prompts:', generatedPrompts);
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-12 md:py-20">
        <div className="mx-auto max-w-4xl">
          {/* Hero Section - V0 风格 */}
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-balance md:text-5xl lg:text-6xl">
              Sora AI 提示词免费生成器
            </h1>
            <p className="text-lg text-muted-foreground text-balance">
              使用 AI 技术快速生成高质量的 Sora 视频提示词
            </p>
          </div>

          {/* Prompt Generator V2 Component */}
          <PromptGeneratorV2 onGenerated={handleGenerated} />

          {/* 演示标识 */}
          <div className="mt-8 rounded-lg bg-blue-50 border-2 border-blue-200 p-4 text-center">
            <p className="text-sm font-semibold text-blue-900">
              📐 这是 V0 风格的演示页面
            </p>
            <p className="mt-2 text-xs text-blue-700">
              • 紧凑的生成数量控件（32×32px 按钮）<br />
              • 响应式分类网格布局（2/3/4 列）<br />
              • Tabs 组件模式切换<br />
              • 语义化颜色系统（primary/secondary/muted）
            </p>
            <p className="mt-3 text-xs text-blue-600">
              当前路径: <code className="bg-white px-2 py-1 rounded">/zh/prompt-v2</code>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
