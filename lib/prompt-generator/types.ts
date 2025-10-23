/**
 * Prompt Generator Types
 * 视频提示词生成器的类型定义
 */

// 字段类型
export type FieldType = 'text' | 'select' | 'textarea';

// 下拉选项
export interface SelectOption {
  value: string;      // 英文值（用于生成提示词）
  label: string;      // 中文标签（显示给用户）
}

// 字段定义
export interface PromptField {
  name: string;                    // 字段名称（英文，用于模板变量）
  label: string;                   // 中文标签
  labelEn: string;                 // 英文标签
  type: FieldType;                 // 字段类型
  required: boolean;               // 是否必填
  description?: string;            // 字段说明
  placeholder?: string;            // 占位符文本（text类型）
  options?: SelectOption[];        // 下拉选项（select类型）
  defaultValue?: string;           // 默认值
}

// 提示词分类
export type PromptCategory =
  | 'cinematic'      // 电影叙事
  | 'nature'         // 自然风光
  | 'portrait'       // 人物肖像
  | 'product'        // 产品展示
  | 'action'         // 动作运动
  | 'abstract'       // 抽象艺术
  | 'lifestyle';     // 生活记录

// 分类配置
export interface CategoryConfig {
  id: PromptCategory;              // 分类ID
  name: string;                    // 中文名称
  nameEn: string;                  // 英文名称
  icon: string;                    // Emoji 图标
  description: string;             // 分类说明
  template: string;                // 提示词模板（使用 {fieldName} 占位符）
  fields: PromptField[];           // 字段列表
  examples: string[];              // 示例提示词
}

// 完整配置
export interface PromptGeneratorConfig {
  categories: CategoryConfig[];
}

// 用户填写的表单数据
export interface PromptFormData {
  category: PromptCategory;
  values: Record<string, string>;  // 字段名 -> 用户填写的值
}

// 生成的完整提示词（旧版本 - 用于UI显示）
export interface GeneratedPromptOld {
  category: PromptCategory;
  categoryName: string;
  prompt: string;                  // 完整提示词
  fields: Record<string, string>;  // 用户填写的值
  generatedAt: Date;
}

// API 返回的提示词（新版本 - 批量生成）
export interface GeneratedPrompt {
  success: boolean;
  index: number;
  temperature: number;
  prompt: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  cost: {
    inputCost: number;
    outputCost: number;
    totalCost: number;
  };
  error?: string;
}

// 字段验证结果
export interface FieldValidation {
  valid: boolean;
  message?: string;
}

// 表单验证结果
export interface FormValidation {
  valid: boolean;
  errors: Record<string, string>;  // 字段名 -> 错误信息
}

// ===== 以下是旧系统兼容类型（保留以支持其他页面） =====

export type VideoType = 'animation' | 'realistic' | 'cartoon' | 'movie';
export type PromptCount = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export interface PromptGenerateRequest {
  videoIdea: string;
  videoType: VideoType;
  promptCount: PromptCount;
}

export interface PromptGenerateResponse {
  success: boolean;
  prompts: Array<{
    id: string;
    content: string;
    index: number;
  }>;
  error?: string;
}

export interface ProductAdvantage {
  icon: string;
  title: string;
  description: string;
}
