'use client';

import { PRODUCT_ADVANTAGES } from '@/lib/prompt-generator/constants';

interface ProductAdvantagesProps {
  locale?: string;
}

export default function ProductAdvantages({ locale = 'zh' }: ProductAdvantagesProps) {
  const iconColors = ['bg-primary', 'bg-green-600', 'bg-purple-600', 'bg-amber-600'];

  return (
    <div className="bg-white py-16 px-4 border-t border-gray-200">
      <div className="max-w-6xl mx-auto">
        {/* Section Title */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-3">
            <i className="fas fa-star text-amber-500 mr-2"></i>
            为什么选择我们？
          </h2>
          <p className="text-xl text-gray-600">专业、高效、易用的 AI 提示词生成工具</p>
        </div>

        {/* Advantages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {PRODUCT_ADVANTAGES.map((advantage, index) => (
            <div
              key={index}
              className="group text-center p-6 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-lg transition-all"
            >
              <div className={`w-16 h-16 mx-auto mb-4 ${iconColors[index % iconColors.length]} rounded-full flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <i className={`${advantage.icon} text-white text-2xl`}></i>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">
                {advantage.title}
              </h3>
              <p className="text-sm text-gray-600">
                {advantage.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
