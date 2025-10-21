'use client';

import { PRODUCT_ADVANTAGES } from '@/lib/prompt-generator/constants';

interface ProductAdvantagesProps {
  locale?: string;
}

export default function ProductAdvantages({ locale = 'en' }: ProductAdvantagesProps) {
  return (
    <div className="py-10 px-4 bg-white border-t border-gray-200">
      <div className="max-w-5xl mx-auto">
        {/* Section Title */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800">
            ⭐ 为什么选择 Sora-Prompt 提示词生成器？
          </h2>
        </div>

        {/* Advantages Grid - 4 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PRODUCT_ADVANTAGES.map((advantage, index) => (
            <div
              key={index}
              className="text-center p-6 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
            >
              {/* Icon */}
              <div className="text-4xl mb-3">{advantage.icon}</div>

              {/* Title */}
              <h3 className="text-sm font-semibold text-gray-800 my-3">
                {advantage.title}
              </h3>

              {/* Description */}
              <p className="text-xs text-gray-600 leading-relaxed">
                {advantage.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
