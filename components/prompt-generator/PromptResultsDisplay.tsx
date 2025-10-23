'use client';

import PromptCard from './PromptCard';

interface PromptResultsDisplayProps {
  prompts: any[]; // 临时使用 any 来兼容新旧两种格式
}

export default function PromptResultsDisplay({ prompts }: PromptResultsDisplayProps) {
  if (prompts.length === 0) return null;

  // 计算统计数据
  const successCount = prompts.filter((p: any) => p.success !== false).length;
  const totalCost = prompts.reduce((sum: number, p: any) => sum + (p.cost?.totalCost || 0), 0);
  const totalTokens = prompts.reduce((sum: number, p: any) => sum + (p.usage?.totalTokens || 0), 0);

  return (
    <div className="bg-gray-50 py-12 px-4 border-t border-gray-200">
      <div className="max-w-6xl mx-auto">
        {/* Section Title */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            生成的提示词结果
          </h2>
          <p className="text-gray-600 mb-4">
            系统已为您生成 {prompts.length} 个专业级 Sora 视频提示词
            {successCount < prompts.length && (
              <span className="text-orange-600">
                （成功 {successCount} 个）
              </span>
            )}
          </p>

          {/* Statistics */}
          <div className="flex justify-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span className="font-semibold">总Token:</span>
              <span>{totalTokens}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">总成本:</span>
              <span>¥{totalCost.toFixed(6)} ({(totalCost * 100).toFixed(4)}分)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">平均成本:</span>
              <span>¥{(totalCost / prompts.length).toFixed(6)}/个</span>
            </div>
          </div>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {prompts.map((prompt: any, index) => (
            <PromptCard
              key={`prompt-${index}`}
              prompt={prompt}
              index={prompt.index || index + 1}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
