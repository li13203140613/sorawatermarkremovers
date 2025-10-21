/**
 * Prompt Generator Constants
 * Configuration and constant values for Sora Prompt Generator
 */

import { VideoType, PromptCount, ProductAdvantage } from './types';

export const VIDEO_TYPES: { value: VideoType; label: string }[] = [
  { value: 'animation', label: 'Animation' },
  { value: 'realistic', label: 'Realistic' },
  { value: 'cartoon', label: 'Cartoon' },
  { value: 'movie', label: 'Movie' },
];

export const PROMPT_COUNTS: { value: PromptCount; label: string }[] = [
  { value: 1, label: '1 - Single prompt' },
  { value: 2, label: '2 - Two variations' },
  { value: 3, label: '3 - Three variations' },
  { value: 4, label: '4 - Four variations' },
  { value: 5, label: '5 - Five variations' },
  { value: 6, label: '6 - Six variations' },
  { value: 7, label: '7 - Seven variations' },
  { value: 8, label: '8 - Eight variations' },
  { value: 9, label: '9 - Nine variations' },
];

export const PRODUCT_ADVANTAGES: ProductAdvantage[] = [
  {
    icon: '⚡',
    title: '🚀 超快速 Sora 提示词生成',
    description: '仅需 3 秒生成专业级 Sora 提示词，比手动输入快 100 倍',
  },
  {
    icon: '🎯',
    title: '🎨 高度定制化提示词',
    description: '根据您的创意需求精确生成优化的 Sora AI 提示词',
  },
  {
    icon: '🔥',
    title: '📱 走红内容优化',
    description: 'AI 分析帮助您生成更容易走红的 Sora 视频提示词',
  },
  {
    icon: '💰',
    title: '✨ 100% 免费使用',
    description: '免费 Sora 提示词生成器，无需付费，无隐藏成本',
  },
];

// Mock data for demonstration
export const MOCK_PROMPTS = {
  animation: [
    'Animated cartoon style dog character playfully drinking soda. Bright vibrant colors. Fun, lighthearted animation. Smooth flowing motion. Colorful background with celebration atmosphere. Professional animation quality. HD resolution. Exaggerated expressions. Dynamic movement. Cheerful color grading with warm tones. Professional cartoon animation render.',
    'Whimsical 2D animation of a joyful puppy sipping from a colorful can. Playful character design with bouncy movements. Vibrant pastel color palette. Sparkling effects and motion lines. Studio Ghibli inspired style. Warm lighting with soft shadows. High-quality cel animation. Expressive eyes and fluid transitions.',
  ],
  realistic: [
    'A golden retriever dog happily drinking from a classic red Coca-Cola can placed on a wooden table. Close-up cinematic shot. Soft natural sunlight streaming through window creates warm amber tones. Professional photography style. 4K resolution. Shallow depth of field with blurred background. Detailed fur texture and reflective can surface. Vibrant warm color grading. Ultra-detailed, high quality rendering.',
    'Photorealistic scene of a Labrador enjoying a refreshing beverage from a soda can. Natural lighting from golden hour sunset. Macro lens capturing intricate details of fur and water droplets. Bokeh background with garden setting. Professional DSLR quality. Sharp focus on subject with artistic composition.',
  ],
  cartoon: [
    'Cute cartoon puppy with oversized eyes drinking from a magical glowing soda can. Bold outlines and flat colors. Chibi art style with exaggerated proportions. Sparkles and stars floating around. Bright rainbow gradient background. Vector art quality. Clean and simple design with playful energy.',
    'Comic book style illustration of a superhero dog enjoying a power-up drink. Dynamic action pose with speed lines. Bold colors and strong contrast. Halftone dot patterns. Pop art aesthetic. Speech bubble with "REFRESHING!" text. Vintage comic book printing texture.',
  ],
  movie: [
    'Dramatic movie cinematic scene of an adventurous dog drinking from a mysterious can. Intense dramatic lighting with shadows. Film noir aesthetic. Professional cinematography. 4K cinematic quality. High contrast. Moody atmosphere. Wide cinematic angle. Dynamic composition. Dark color grading with accent lighting. Professional film production render.',
    'Epic Hollywood blockbuster shot of a heroic canine taking a triumphant drink. Anamorphic lens flare. IMAX quality. Sweeping orchestral music implied through composition. Slow motion capture of liquid dynamics. Theatrical color grading with teal and orange tones. Professional VFX integration.',
  ],
};

export const GALLERY_PROMPTS = [
  {
    id: '1',
    date: '2024-10-21',
    title: 'A dog drinks coke - Sora 2 Prompt',
    description: 'High-quality Sora AI video generation prompt example',
    category: 'realistic' as VideoType,
  },
  {
    id: '2',
    date: '2024-10-20',
    title: 'Cat jumping - Sora AI Video Tip',
    description: 'Sora animated video generator professional prompt',
    category: 'animation' as VideoType,
  },
  {
    id: '3',
    date: '2024-10-19',
    title: 'Dancing in rain - Viral Video Prompt',
    description: 'Sora 2 prompt generator viral content example',
    category: 'movie' as VideoType,
  },
  {
    id: '4',
    date: '2024-10-18',
    title: 'Viral content - Creative Video Tip',
    description: 'AI video prompt generator popular template',
    category: 'cartoon' as VideoType,
  },
  {
    id: '5',
    date: '2024-10-17',
    title: 'Nature landscape - Landscape Video Tip',
    description: 'Sora prompt generator nature landscape template',
    category: 'realistic' as VideoType,
  },
  {
    id: '6',
    date: '2024-10-16',
    title: 'Animation style - Anime-style Prompt',
    description: 'Sora 2 animation style prompt generation example',
    category: 'animation' as VideoType,
  },
];

export const DEFAULT_EXAMPLE_TEXT = 'Example: A dog drinks coke';

export const API_ENDPOINTS = {
  GENERATE_PROMPT: '/api/prompt-generator/generate',
};
