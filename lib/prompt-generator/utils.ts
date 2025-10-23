/**
 * Prompt Generator Utility Functions
 * 提示词生成器工具函数
 */

import type {
  CategoryConfig,
  PromptFormData,
  GeneratedPromptOld,
  FormValidation,
  FieldValidation,
} from './types';
import promptConfig from './config.json';
import type { PromptGeneratorConfig } from './types';

const config = promptConfig as PromptGeneratorConfig;

/**
 * 获取所有分类配置
 */
export function getAllCategories(): CategoryConfig[] {
  return config.categories;
}

/**
 * 根据 ID 获取分类配置
 */
export function getCategoryById(categoryId: string): CategoryConfig | undefined {
  return config.categories.find((cat) => cat.id === categoryId);
}

/**
 * 验证单个字段
 */
export function validateField(
  field: CategoryConfig['fields'][0],
  value: string
): FieldValidation {
  // 检查必填字段
  if (field.required && !value.trim()) {
    return {
      valid: false,
      message: `${field.label}为必填项`,
    };
  }

  // 检查下拉选择是否有效
  if (field.type === 'select' && value && field.options) {
    const validOptions = field.options.map((opt) => opt.value);
    if (!validOptions.includes(value)) {
      return {
        valid: false,
        message: `${field.label}选项无效`,
      };
    }
  }

  return { valid: true };
}

/**
 * 验证整个表单
 */
export function validateForm(
  category: CategoryConfig,
  values: Record<string, string>
): FormValidation {
  const errors: Record<string, string> = {};

  for (const field of category.fields) {
    const value = values[field.name] || '';
    const validation = validateField(field, value);

    if (!validation.valid && validation.message) {
      errors[field.name] = validation.message;
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * 生成提示词
 * 核心逻辑：用用户填写的值替换模板中的占位符
 */
export function generatePrompt(formData: PromptFormData): GeneratedPromptOld {
  const category = getCategoryById(formData.category);

  if (!category) {
    throw new Error(`分类 ${formData.category} 不存在`);
  }

  // 验证表单
  const validation = validateForm(category, formData.values);
  if (!validation.valid) {
    throw new Error(`表单验证失败: ${JSON.stringify(validation.errors)}`);
  }

  let prompt = category.template;

  // 替换所有字段
  for (const field of category.fields) {
    const value = formData.values[field.name] || field.defaultValue || '';
    const placeholder = `{${field.name}}`;

    if (value) {
      // 有值：替换占位符
      prompt = prompt.replace(placeholder, value);
    } else {
      // 无值（可选字段）：删除占位符及前后的逗号和空格
      prompt = prompt.replace(new RegExp(`,?\\s*${placeholder}\\s*,?`, 'g'), '');
    }
  }

  // 清理多余的逗号和空格
  prompt = prompt
    .replace(/,\s*,/g, ',')           // 连续逗号
    .replace(/,\s*$/g, '')            // 结尾逗号
    .replace(/\s{2,}/g, ' ')          // 多余空格
    .trim();

  return {
    category: formData.category,
    categoryName: category.name,
    prompt,
    fields: formData.values,
    generatedAt: new Date(),
  };
}

/**
 * 从示例提示词填充表单
 * 尝试从示例提示词反向解析出字段值（简单版本）
 */
export function fillFromExample(
  categoryId: string,
  examplePrompt: string
): Record<string, string> {
  const category = getCategoryById(categoryId);
  if (!category) {
    return {};
  }

  // 这是一个简化版本，实际使用时直接返回示例
  // 完整版本需要 NLP 解析
  return {
    __example: examplePrompt,
  };
}

/**
 * 导出提示词为纯文本
 */
export function exportAsText(generated: GeneratedPromptOld): string {
  return `# ${generated.categoryName} 提示词

生成时间: ${generated.generatedAt.toLocaleString('zh-CN')}

## 完整提示词
${generated.prompt}

## 字段详情
${Object.entries(generated.fields)
  .map(([key, value]) => `- ${key}: ${value}`)
  .join('\n')}
`;
}

/**
 * 导出提示词为 JSON
 */
export function exportAsJSON(generated: GeneratedPromptOld): string {
  return JSON.stringify(generated, null, 2);
}

/**
 * 复制提示词到剪贴板（浏览器端）
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.clipboard) {
    return false;
  }

  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('复制失败:', error);
    return false;
  }
}

/**
 * 获取字段的显示名称（带必填标记）
 */
export function getFieldDisplayName(field: CategoryConfig['fields'][0]): string {
  return field.required ? `${field.label} *` : field.label;
}

/**
 * 获取分类的统计信息
 */
export function getCategoryStats(category: CategoryConfig) {
  const requiredFields = category.fields.filter((f) => f.required).length;
  const optionalFields = category.fields.length - requiredFields;
  const totalOptions = category.fields
    .filter((f) => f.type === 'select')
    .reduce((sum, f) => sum + (f.options?.length || 0), 0);

  return {
    totalFields: category.fields.length,
    requiredFields,
    optionalFields,
    totalOptions,
    examplesCount: category.examples.length,
  };
}

/**
 * 生成提示词变体
 * 根据用户填写的字段，生成 N 个不同的提示词变体
 */
export function generatePromptVariants(
  formData: PromptFormData,
  count: number = 3
): GeneratedPromptOld[] {
  const category = getCategoryById(formData.category);

  if (!category) {
    throw new Error(`分类 ${formData.category} 不存在`);
  }

  const variants: GeneratedPromptOld[] = [];

  // Variant 1: 原始提示词（用户填写的值）
  const basePrompt = generatePrompt(formData);
  variants.push({
    ...basePrompt,
    prompt: basePrompt.prompt,
  });

  // 如果只需要 1 个，直接返回
  if (count <= 1) {
    return variants;
  }

  // 找出可选字段（用于生成变体）
  const optionalFields = category.fields.filter(
    (f) => !f.required && f.type === 'select' && f.options && f.options.length > 1
  );

  // Variant 2: 随机替换一个可选字段的值
  if (optionalFields.length > 0 && count >= 2) {
    const variant2Values = { ...formData.values };
    const randomField = optionalFields[Math.floor(Math.random() * optionalFields.length)];

    // 获取当前值
    const currentValue = variant2Values[randomField.name] || randomField.defaultValue;

    // 从选项中随机选择一个不同的值
    const otherOptions = randomField.options!.filter(opt => opt.value !== currentValue);
    if (otherOptions.length > 0) {
      const randomOption = otherOptions[Math.floor(Math.random() * otherOptions.length)];
      variant2Values[randomField.name] = randomOption.value;

      const variant2 = generatePrompt({ ...formData, values: variant2Values });
      variants.push(variant2);
    } else {
      // 如果没有其他选项，复制原始提示词
      variants.push({ ...basePrompt });
    }
  }

  // Variant 3: 再随机替换另一个可选字段的值
  if (optionalFields.length > 1 && count >= 3) {
    const variant3Values = { ...formData.values };

    // 选择一个不同的字段
    const availableFields = optionalFields.slice();
    const randomField1 = availableFields.splice(
      Math.floor(Math.random() * availableFields.length),
      1
    )[0];

    if (availableFields.length > 0) {
      const randomField2 = availableFields[Math.floor(Math.random() * availableFields.length)];

      // 替换两个字段的值
      const field1Options = randomField1.options!.filter(
        opt => opt.value !== (variant3Values[randomField1.name] || randomField1.defaultValue)
      );
      const field2Options = randomField2.options!.filter(
        opt => opt.value !== (variant3Values[randomField2.name] || randomField2.defaultValue)
      );

      if (field1Options.length > 0 && field2Options.length > 0) {
        variant3Values[randomField1.name] = field1Options[Math.floor(Math.random() * field1Options.length)].value;
        variant3Values[randomField2.name] = field2Options[Math.floor(Math.random() * field2Options.length)].value;

        const variant3 = generatePrompt({ ...formData, values: variant3Values });
        variants.push(variant3);
      } else {
        // 如果没有足够的选项，复制原始提示词
        variants.push({ ...basePrompt });
      }
    } else {
      // 如果只有一个可选字段，复制原始提示词
      variants.push({ ...basePrompt });
    }
  }

  // 确保返回准确数量的变体
  while (variants.length < count) {
    variants.push({ ...basePrompt });
  }

  return variants.slice(0, count);
}
