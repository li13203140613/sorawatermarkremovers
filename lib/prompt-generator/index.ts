/**
 * Prompt Generator Library
 * 提示词生成器核心库
 */

// 导出类型
export type {
  FieldType,
  SelectOption,
  PromptField,
  PromptCategory,
  CategoryConfig,
  PromptGeneratorConfig,
  PromptFormData,
  GeneratedPrompt,
  GeneratedPromptOld,
  FieldValidation,
  FormValidation,
} from './types';

// 导出工具函数
export {
  getAllCategories,
  getCategoryById,
  validateField,
  validateForm,
  generatePrompt,
  generatePromptVariants,
  fillFromExample,
  exportAsText,
  exportAsJSON,
  copyToClipboard,
  getFieldDisplayName,
  getCategoryStats,
} from './utils';

// 导出配置（如果需要直接访问）
export { default as promptConfig } from './config.json';
