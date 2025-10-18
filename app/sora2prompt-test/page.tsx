'use client';

import { useState } from 'react';
import { PromptCard } from '@/components/prompt/PromptCard';
import { VideoModal } from '@/components/prompt/VideoModal';
import { CategoryFilter } from '@/components/prompt/CategoryFilter';

// 数据类型
interface PromptItem {
  id: string;
  category: string;
  categoryLabel: string;
  categoryIcon: string;
  prompt: string;
  thumbnailUrl: string;
  videoUrl: string;
}

// 使用内嵌的测试数据（不依赖 JSON 导入）
const TEST_PROMPTS: PromptItem[] = [
  {
    id: 'test-1',
    category: 'animal',
    categoryLabel: '动物',
    categoryIcon: '🐱',
    prompt: 'figure skater performs a triple axle with a cat on her head',
    thumbnailUrl: 'https://placehold.co/640x360/FCD34D/1A1A1A?text=🐱+动物',
    videoUrl: 'https://player.vimeo.com/video/913331489'
  },
  {
    id: 'test-2',
    category: 'people',
    categoryLabel: '人物',
    categoryIcon: '👤',
    prompt: 'a man does a backflip on a paddleboard',
    thumbnailUrl: 'https://placehold.co/640x360/F87171/1A1A1A?text=👤+人物',
    videoUrl: 'https://openaiassets.blob.core.windows.net/$web/nf2/blog-final/golden/6eda9a57-5d6d-4890-90ee-61f89e999719/paddleboard.mp4'
  },
  {
    id: 'test-3',
    category: 'landscape',
    categoryLabel: '风景',
    categoryIcon: '🌄',
    prompt: 'A bright, inviting Mediterranean villa exterior bathed in warm sunlight',
    thumbnailUrl: 'https://placehold.co/640x360/34D399/1A1A1A?text=🌄+风景',
    videoUrl: 'https://openaiassets.blob.core.windows.net/$web/nf2/blog-final/golden/6eda9a57-5d6d-4890-90ee-61f89e999719/villa.mp4'
  },
];

// 分类定义
const CATEGORIES = [
  { id: 'all', label: '全部', icon: '📋' },
  { id: 'animal', label: '动物', icon: '🐱' },
  { id: 'people', label: '人物', icon: '👤' },
  { id: 'landscape', label: '风景', icon: '🌄' },
];

export default function Sora2PromptTestPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPrompt, setSelectedPrompt] = useState<PromptItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 筛选提示词
  const filteredPrompts = selectedCategory === 'all'
    ? TEST_PROMPTS
    : TEST_PROMPTS.filter(p => p.category === selectedCategory);

  // 打开视频弹窗
  const handleOpenVideo = (prompt: PromptItem) => {
    setSelectedPrompt(prompt);
    setIsModalOpen(true);
  };

  // 关闭弹窗
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPrompt(null);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-indigo-50 to-white py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            🎬 Sora 2 提示词库 (测试版)
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            精选 AI 视频生成提示词，激发你的创意灵感
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <CategoryFilter
            categories={CATEGORIES}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>
      </section>

      {/* Prompt Cards Grid */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-4 text-center text-sm text-gray-500">
          测试页面 - 共 {filteredPrompts.length} 条提示词
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrompts.map((prompt) => (
            <PromptCard
              key={prompt.id}
              prompt={prompt}
              onOpenVideo={handleOpenVideo}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredPrompts.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              暂无提示词
            </h3>
            <p className="text-gray-600">
              该分类下还没有提示词，敬请期待
            </p>
          </div>
        )}
      </section>

      {/* Video Modal */}
      {selectedPrompt && (
        <VideoModal
          isOpen={isModalOpen}
          prompt={selectedPrompt}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
