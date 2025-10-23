/**
 * Sora 提示词生成器 - 分类配置
 */

export interface CategoryConfig {
  key: string;
  label: string;
  icon: string;
  style: string;
  keywords: string[];
  defaultMood: string;
}

export const PROMPT_CATEGORIES: Record<string, CategoryConfig> = {
  cinematicStory: {
    key: 'cinematicStory',
    label: '电影叙事',
    icon: '📽️',
    style: '电影级画质，叙事性强，情感丰富，戏剧化构图',
    keywords: ['cinematic', 'narrative', 'emotional', 'dramatic'],
    defaultMood: '戏剧性、情感共鸣'
  },

  naturalScenery: {
    key: 'naturalScenery',
    label: '自然风光',
    icon: '🏞️',
    style: '自然写实，风景优美，光线柔和，宁静唯美',
    keywords: ['nature', 'landscape', 'scenic', 'natural light'],
    defaultMood: '宁静、壮观、治愈'
  },

  portrait: {
    key: 'portrait',
    label: '人物肖像',
    icon: '👤',
    style: '人物特写，表情细腻，光影层次丰富',
    keywords: ['portrait', 'character', 'expression', 'close-up'],
    defaultMood: '真实、生动、情感表达'
  },

  productDisplay: {
    key: 'productDisplay',
    label: '产品展示',
    icon: '📦',
    style: '商业级画质，产品突出，专业打光，简洁构图',
    keywords: ['product', 'commercial', 'clean', 'professional'],
    defaultMood: '高端、专业、吸引眼球'
  },

  actionSports: {
    key: 'actionSports',
    label: '动作运动',
    icon: '🏃',
    style: '动态捕捉，运动感强，速度线条，能量爆发',
    keywords: ['action', 'sports', 'dynamic', 'energy'],
    defaultMood: '激烈、速度感、冲击力'
  },

  abstractArt: {
    key: 'abstractArt',
    label: '抽象艺术',
    icon: '🎨',
    style: '抽象表现，色彩丰富，创意构图，艺术感强',
    keywords: ['abstract', 'artistic', 'creative', 'surreal'],
    defaultMood: '梦幻、超现实、艺术气息'
  },

  lifestyle: {
    key: 'lifestyle',
    label: '生活记录',
    icon: '📷',
    style: '生活化场景，自然真实，温馨日常，纪实风格',
    keywords: ['lifestyle', 'daily', 'candid', 'authentic'],
    defaultMood: '温馨、真实、生活气息'
  }
};

/**
 * 获取所有分类（数组格式，用于前端展示）
 */
export function getAllCategories(): CategoryConfig[] {
  return Object.values(PROMPT_CATEGORIES);
}

/**
 * 根据 key 获取分类配置
 */
export function getCategoryByKey(key: string): CategoryConfig | undefined {
  return PROMPT_CATEGORIES[key];
}

/**
 * 获取默认分类
 */
export function getDefaultCategory(): CategoryConfig {
  return PROMPT_CATEGORIES.cinematicStory;
}
