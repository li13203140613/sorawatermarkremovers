'use client';

import PromptCard from './PromptCard';

interface PromptResultsDisplayProps {
  prompts: any[];
}

export default function PromptResultsDisplay({ prompts }: PromptResultsDisplayProps) {
  if (prompts.length === 0) return null;

  return (
    <div className="bg-gray-50 py-12 px-4 border-t border-gray-200">
      <div className="max-w-6xl mx-auto">
        {/* Section Title */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            <i className="fas fa-check-circle text-green-600 mr-2"></i>
            生成成功！
          </h2>
        </div>

        {/* Results Grid with Stagger Animation */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {prompts.map((prompt: any, index) => (
            <div
              key={`prompt-${index}`}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <PromptCard
                prompt={prompt}
                index={prompt.index || index + 1}
              />
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
