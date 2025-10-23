'use client';

import { GALLERY_PROMPTS } from '@/lib/prompt-generator/constants';

interface PromptGalleryProps {
  locale?: string;
}

export default function PromptGallery({ locale = 'zh' }: PromptGalleryProps) {
  return (
    <div className="bg-white py-16 px-4 border-t border-gray-200">
      <div className="max-w-6xl mx-auto">
        {/* Section Title */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-3">
            <i className="fas fa-images text-primary mr-2"></i>
            提示词画廊
          </h2>
          <p className="text-xl text-gray-600">浏览精选的优质提示词，获取创作灵感</p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {GALLERY_PROMPTS.map((item) => (
            <div
              key={item.id}
              className="group bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border-2 border-purple-200 hover:border-purple-400 hover:shadow-lg transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2 mb-3">
                <i className="fas fa-calendar-alt text-purple-600 text-sm"></i>
                <span className="text-xs text-purple-700 font-medium">{item.date}</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                {item.title}
              </h3>
              <p className="text-sm text-gray-700 line-clamp-3">
                {item.description}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <button className="px-8 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors">
            查看更多示例
            <i className="fas fa-arrow-right ml-2"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
