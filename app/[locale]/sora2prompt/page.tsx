'use client';

import { useState } from 'react';
import { PromptCard } from '@/components/prompt/PromptCard';
import { VideoModal } from '@/components/prompt/VideoModal';
import { CategoryFilter } from '@/components/prompt/CategoryFilter';
// 导入真实数据
import promptsData from '@/data/sora2-prompts.json';

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

// 获取分类颜色作为占位图背景
function getCategoryPlaceholderColor(category: string): string {
  const colors: Record<string, string> = {
    animal: 'FCD34D',
    people: 'F87171',
    landscape: '34D399',
    tech: '60A5FA',
    art: 'C084FC',
    food: 'FB923C',
    architecture: '94A3B8',
    abstract: 'E879F9',
    action: 'EF4444',
  };
  return colors[category] || '9CA3AF';
}

// 处理真实数据：为没有缩略图的视频添加占位图
const REAL_PROMPTS: PromptItem[] = promptsData.prompts.map((p: any) => ({
  id: p.id,
  category: p.category,
  categoryLabel: p.categoryLabel,
  categoryIcon: p.categoryIcon,
  prompt: p.prompt,
  thumbnailUrl: p.thumbnailUrl || `https://placehold.co/640x360/${getCategoryPlaceholderColor(p.category)}/1A1A1A?text=${encodeURIComponent(p.categoryIcon + ' ' + p.categoryLabel)}`,
  videoUrl: p.videoUrl || p.embedUrl,
}));

// 临时假数据（备用）
const MOCK_PROMPTS: PromptItem[] = [
  {
    id: '1',
    category: 'animal',
    categoryLabel: '动物',
    categoryIcon: '🐱',
    prompt: '一只橘色的猫咪戴着墨镜，驾驶一辆红色的敞篷跑车，在沙漠公路上疾驰，夕阳西下，镜头跟随拍摄',
    thumbnailUrl: 'https://placehold.co/640x360/FCD34D/1A1A1A?text=Cat+Driving',
    videoUrl: 'https://videos.openai.com/vg-assets/example-cat.mp4'
  },
  {
    id: '2',
    category: 'landscape',
    categoryLabel: '风景',
    categoryIcon: '🌄',
    prompt: '日落时分的海滩，海浪轻拍沙滩，天空呈现出橙红色渐变，远处有几只海鸥飞过，4K 高清画质',
    thumbnailUrl: 'https://placehold.co/640x360/34D399/1A1A1A?text=Beach+Sunset',
    videoUrl: 'https://videos.openai.com/vg-assets/example-beach.mp4'
  },
  {
    id: '3',
    category: 'tech',
    categoryLabel: '科技',
    categoryIcon: '🚀',
    prompt: '未来科幻城市景观，高楼林立，飞行汽车穿梭其中，霓虹灯闪烁，赛博朋克风格，电影级画质',
    thumbnailUrl: 'https://placehold.co/640x360/60A5FA/1A1A1A?text=Sci-Fi+City',
    videoUrl: 'https://videos.openai.com/vg-assets/example-city.mp4'
  },
  {
    id: '4',
    category: 'people',
    categoryLabel: '人物',
    categoryIcon: '👤',
    prompt: '一位年轻女性在东京街头漫步，穿着时尚的街头服饰，背景是繁华的涩谷街景，慢动作拍摄',
    thumbnailUrl: 'https://placehold.co/640x360/F87171/1A1A1A?text=Tokyo+Street',
    videoUrl: 'https://videos.openai.com/vg-assets/example-person.mp4'
  },
  {
    id: '5',
    category: 'art',
    categoryLabel: '艺术',
    categoryIcon: '🎨',
    prompt: '抽象艺术动画，色彩斑斓的液体在黑色背景中流动变幻，形成各种梦幻图案，4K 超清',
    thumbnailUrl: 'https://placehold.co/640x360/C084FC/1A1A1A?text=Abstract+Art',
    videoUrl: 'https://videos.openai.com/vg-assets/example-art.mp4'
  },
  {
    id: '6',
    category: 'food',
    categoryLabel: '美食',
    categoryIcon: '🍕',
    prompt: '顶级厨师制作意大利披萨的过程，面团在空中旋转，奶酪拉丝特写，慢镜头呈现美食诱人细节',
    thumbnailUrl: 'https://placehold.co/640x360/FB923C/1A1A1A?text=Pizza+Making',
    videoUrl: 'https://videos.openai.com/vg-assets/example-food.mp4'
  },
  {
    id: '7',
    category: 'architecture',
    categoryLabel: '建筑',
    categoryIcon: '🏛️',
    prompt: '雄伟的古罗马竞技场，晨光照射在石柱上，游客稀少，空镜头缓慢移动展现建筑细节',
    thumbnailUrl: 'https://placehold.co/640x360/94A3B8/1A1A1A?text=Colosseum',
    videoUrl: 'https://videos.openai.com/vg-assets/example-building.mp4'
  },
  {
    id: '8',
    category: 'abstract',
    categoryLabel: '抽象',
    categoryIcon: '✨',
    prompt: '几何图形在三维空间中不断变换组合，配合电子音乐节奏，呈现视觉冲击力强的抽象动画',
    thumbnailUrl: 'https://placehold.co/640x360/E879F9/1A1A1A?text=Geometric',
    videoUrl: 'https://videos.openai.com/vg-assets/example-abstract.mp4'
  },
  {
    id: '9',
    category: 'action',
    categoryLabel: '动作',
    categoryIcon: '🏃',
    prompt: '滑板运动员在城市街道上表演高难度动作，慢动作捕捉每一个翻转细节，运动相机跟拍',
    thumbnailUrl: 'https://placehold.co/640x360/EF4444/1A1A1A?text=Skateboard',
    videoUrl: 'https://videos.openai.com/vg-assets/example-action.mp4'
  },
];

// 分类定义
const CATEGORIES = [
  { id: 'all', label: '全部', icon: '📋' },
  { id: 'animal', label: '动物', icon: '🐱' },
  { id: 'people', label: '人物', icon: '👤' },
  { id: 'landscape', label: '风景', icon: '🌄' },
  { id: 'tech', label: '科技', icon: '🚀' },
  { id: 'art', label: '艺术', icon: '🎨' },
  { id: 'food', label: '美食', icon: '🍕' },
  { id: 'architecture', label: '建筑', icon: '🏛️' },
  { id: 'abstract', label: '抽象', icon: '✨' },
  { id: 'action', label: '动作', icon: '🏃' },
];

export default function Sora2PromptPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPrompt, setSelectedPrompt] = useState<PromptItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 筛选提示词（使用真实数据）
  const filteredPrompts = selectedCategory === 'all'
    ? REAL_PROMPTS
    : REAL_PROMPTS.filter(p => p.category === selectedCategory);

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
            🎬 Sora 2 提示词库
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
