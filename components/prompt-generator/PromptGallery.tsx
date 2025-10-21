'use client';

import { GALLERY_PROMPTS } from '@/lib/prompt-generator/constants';

interface PromptGalleryProps {
  locale?: string;
}

export default function PromptGallery({ locale = 'en' }: PromptGalleryProps) {
  return (
    <div className="py-10 px-4 bg-white border-t border-gray-200">
      <div className="max-w-5xl mx-auto">
        {/* Section Title */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            📚 最佳 Sora 提示词画廊 - 免费 AI 视频提示词库
          </h2>
          <p className="text-sm text-blue-700 bg-blue-50 border-l-4 border-blue-500 p-4 mt-4 rounded">
            💡 浏览热门 Sora 提示词，获取最佳 Sora 提示词实践灵感
          </p>
        </div>

        {/* Gallery Grid - 2 rows x 3 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {GALLERY_PROMPTS.map((item) => (
            <div
              key={item.id}
              className="bg-gray-50 p-5 rounded border-l-4 border-green-500 hover:shadow-md transition-shadow"
            >
              {/* Date */}
              <div className="text-xs text-gray-500 mb-2">{item.date}</div>

              {/* Title */}
              <h3 className="text-sm font-semibold text-gray-800 my-2">{item.title}</h3>

              {/* Description */}
              <p className="text-xs text-gray-600">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
