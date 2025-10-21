/**
 * Prompt Generator Types
 * TypeScript type definitions for Sora Prompt Generator
 */

export type VideoType = 'animation' | 'realistic' | 'cartoon' | 'movie';

export type PromptCount = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export interface PromptGenerateRequest {
  videoIdea: string;
  videoType: VideoType;
  promptCount: PromptCount;
}

export interface GeneratedPrompt {
  id: string;
  content: string;
  index: number;
}

export interface PromptGenerateResponse {
  success: boolean;
  prompts: GeneratedPrompt[];
  error?: string;
}

export interface PromptCardAction {
  type: 'copy' | 'share' | 'download' | 'regenerate';
  promptId: string;
  content: string;
}

export interface GalleryPrompt {
  id: string;
  date: string;
  title: string;
  description: string;
  category: VideoType;
}

export interface ProductAdvantage {
  icon: string;
  title: string;
  description: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}