'use client';

interface SoraIntroductionProps {
  locale?: string;
}

export default function SoraIntroduction({ locale = 'en' }: SoraIntroductionProps) {
  return (
    <div className="py-10 px-4 bg-blue-50 border-t border-gray-200">
      <div className="max-w-5xl mx-auto">
        {/* Section Title */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-blue-900">
            🎬 什么是 Sora 2？- 完整的 AI 视频生成器指南
          </h2>
        </div>

        {/* Content */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            📹 Sora 2 AI 视频生成器 - OpenAI 最新技术
          </h3>
          <p className="text-sm text-gray-700 leading-relaxed">
            Sora 2 是 OpenAI 最新推出的 AI 视频生成模型。您只需输入简单的文字描述，Sora 2 就能根据您的 Sora 提示词生成高质量的视频内容。无论是电影级特效、真实场景还是创意动画，我们的 Sora 提示词生成器都能帮您创建最完美的 Sora 提示词。
          </p>
        </div>
      </div>
    </div>
  );
}
