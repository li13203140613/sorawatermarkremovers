# Prompt Generator Library

> Sora2 视频提示词生成器核心库

## 📦 文件结构

```
lib/prompt-generator/
├── config.json          # 完整的分类和字段配置（184个选项）
├── types.ts             # TypeScript 类型定义
├── utils.ts             # 工具函数（生成、验证、导出）
├── index.ts             # 统一导出
└── README.md            # 本文档
```

---

## 🚀 快速开始

### 1. 导入库

```typescript
import {
  getAllCategories,
  getCategoryById,
  generatePrompt,
  type PromptFormData,
} from '@/lib/prompt-generator';
```

### 2. 获取所有分类

```typescript
const categories = getAllCategories();

console.log(categories);
// [
//   { id: 'cinematic', name: '电影叙事', icon: '🎬', ... },
//   { id: 'nature', name: '自然风光', icon: '🏞️', ... },
//   ...
// ]
```

### 3. 获取单个分类

```typescript
const cinematic = getCategoryById('cinematic');

console.log(cinematic.fields);
// [
//   { name: 'shotType', label: '镜头类型', type: 'select', required: true, ... },
//   { name: 'subject', label: '主体描述', type: 'text', required: true, ... },
//   ...
// ]
```

### 4. 生成提示词

```typescript
const formData: PromptFormData = {
  category: 'cinematic',
  values: {
    shotType: 'Close-up',
    subject: 'a young woman with tears',
    action: 'looking at camera, tears falling',
    environment: 'dark room with single window',
    lighting: 'soft window light',
    cameraMovement: 'camera pushing in',
    camera: 'shot on 35mm film',
    mood: 'emotional and melancholic',
  },
};

const result = generatePrompt(formData);

console.log(result.prompt);
// "Close-up of a young woman with tears looking at camera, tears falling,
//  dark room with single window, soft window light, camera pushing in,
//  shot on 35mm film, emotional and melancholic"
```

---

## 📝 核心 API

### `getAllCategories()`

获取所有 7 个分类配置。

**返回**: `CategoryConfig[]`

```typescript
const categories = getAllCategories();
// 返回 7 个分类的完整配置
```

---

### `getCategoryById(categoryId)`

根据 ID 获取分类配置。

**参数**:
- `categoryId`: `'cinematic' | 'nature' | 'portrait' | 'product' | 'action' | 'abstract' | 'lifestyle'`

**返回**: `CategoryConfig | undefined`

```typescript
const category = getCategoryById('nature');
console.log(category.template);
// "{viewAngle} of {location}, {season} {weather}..."
```

---

### `validateField(field, value)`

验证单个字段的值。

**参数**:
- `field`: `PromptField` - 字段配置
- `value`: `string` - 用户输入的值

**返回**: `FieldValidation`

```typescript
const field = category.fields[0]; // shotType
const validation = validateField(field, '');

if (!validation.valid) {
  console.log(validation.message); // "镜头类型为必填项"
}
```

---

### `validateForm(category, values)`

验证整个表单。

**参数**:
- `category`: `CategoryConfig` - 分类配置
- `values`: `Record<string, string>` - 用户填写的所有值

**返回**: `FormValidation`

```typescript
const validation = validateForm(category, {
  shotType: 'Close-up',
  subject: '',  // 缺少必填项
});

console.log(validation.valid);   // false
console.log(validation.errors);  // { subject: '主体描述为必填项' }
```

---

### `generatePrompt(formData)`

生成完整提示词（核心函数）。

**参数**:
- `formData`: `PromptFormData`

**返回**: `GeneratedPrompt`

**示例**:
```typescript
const result = generatePrompt({
  category: 'cinematic',
  values: {
    shotType: 'Wide shot',
    subject: 'a lone figure',
    action: 'walking through fog',
    environment: 'misty forest at dawn',
    lighting: 'soft diffused light',
  },
});

console.log(result);
// {
//   category: 'cinematic',
//   categoryName: '电影叙事',
//   prompt: 'Wide shot of a lone figure walking through fog, ...',
//   fields: { shotType: 'Wide shot', ... },
//   generatedAt: Date
// }
```

---

### `copyToClipboard(text)`

复制文本到剪贴板（浏览器环境）。

**参数**:
- `text`: `string` - 要复制的文本

**返回**: `Promise<boolean>` - 是否成功

```typescript
const success = await copyToClipboard(result.prompt);
if (success) {
  console.log('复制成功！');
}
```

---

### `exportAsText(generated)`

导出为纯文本格式。

**返回**: `string`

```typescript
const text = exportAsText(result);
console.log(text);
// # 电影叙事 提示词
// 生成时间: 2025/10/21 14:30:00
//
// ## 完整提示词
// Close-up of a young woman...
```

---

### `exportAsJSON(generated)`

导出为 JSON 格式。

**返回**: `string`

```typescript
const json = exportAsJSON(result);
// 返回格式化的 JSON 字符串
```

---

### `getCategoryStats(category)`

获取分类的统计信息。

**返回**: 统计对象

```typescript
const stats = getCategoryStats(category);
console.log(stats);
// {
//   totalFields: 8,
//   requiredFields: 5,
//   optionalFields: 3,
//   totalOptions: 43,
//   examplesCount: 3
// }
```

---

## 📊 数据统计

### 全局数据
- **总分类数**: 7 个
- **总字段数**: 49 个
- **总下拉选项**: 184 个
- **总示例数**: 21 个

### 各分类统计
| 分类 | 字段数 | 必填 | 可选 | 下拉选项 |
|------|--------|------|------|----------|
| 电影叙事 | 8 | 5 | 3 | 43 |
| 自然风光 | 7 | 5 | 2 | 33 |
| 人物肖像 | 7 | 5 | 2 | 22 |
| 产品展示 | 6 | 6 | 0 | 21 |
| 动作运动 | 6 | 4 | 2 | 12 |
| 抽象艺术 | 5 | 4 | 1 | 16 |
| 生活记录 | 5 | 4 | 1 | 14 |

---

## 🎯 使用场景

### 场景 1: 在 React 组件中使用

```tsx
'use client';

import { useState } from 'react';
import { getAllCategories, generatePrompt } from '@/lib/prompt-generator';

export default function PromptGenerator() {
  const [category, setCategory] = useState('cinematic');
  const [values, setValues] = useState({});

  const categories = getAllCategories();
  const selectedCategory = categories.find(c => c.id === category);

  const handleGenerate = () => {
    const result = generatePrompt({ category, values });
    console.log(result.prompt);
  };

  return (
    <div>
      {/* 分类选择 */}
      {categories.map(cat => (
        <button key={cat.id} onClick={() => setCategory(cat.id)}>
          {cat.icon} {cat.name}
        </button>
      ))}

      {/* 字段表单 */}
      {selectedCategory?.fields.map(field => (
        <div key={field.name}>
          <label>{field.label}</label>
          {field.type === 'select' ? (
            <select onChange={e => setValues({...values, [field.name]: e.target.value})}>
              {field.options?.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              placeholder={field.placeholder}
              onChange={e => setValues({...values, [field.name]: e.target.value})}
            />
          )}
        </div>
      ))}

      {/* 生成按钮 */}
      <button onClick={handleGenerate}>生成提示词</button>
    </div>
  );
}
```

---

### 场景 2: 表单验证

```typescript
import { validateForm, getCategoryById } from '@/lib/prompt-generator';

const category = getCategoryById('cinematic')!;
const values = { /* 用户输入 */ };

const validation = validateForm(category, values);

if (!validation.valid) {
  // 显示错误
  Object.entries(validation.errors).forEach(([field, message]) => {
    console.error(`${field}: ${message}`);
  });
} else {
  // 继续生成
  const result = generatePrompt({ category: 'cinematic', values });
}
```

---

### 场景 3: 实时预览

```tsx
const [values, setValues] = useState({});
const [preview, setPreview] = useState('');

useEffect(() => {
  try {
    const result = generatePrompt({ category: 'cinematic', values });
    setPreview(result.prompt);
  } catch (error) {
    setPreview('请填写必填字段...');
  }
}, [values]);

return <div className="preview">{preview}</div>;
```

---

## 🔧 配置文件说明

### config.json 结构

```json
{
  "categories": [
    {
      "id": "cinematic",
      "name": "电影叙事",
      "icon": "🎬",
      "template": "{shotType} of {subject} {action}...",
      "fields": [
        {
          "name": "shotType",
          "label": "镜头类型",
          "type": "select",
          "required": true,
          "options": [
            { "value": "Close-up", "label": "特写 - 聚焦细节" }
          ]
        }
      ],
      "examples": ["示例提示词1", "示例提示词2"]
    }
  ]
}
```

---

## 📚 类型定义

所有类型定义在 `types.ts` 中：

```typescript
// 主要类型
export type FieldType = 'text' | 'select' | 'textarea';
export type PromptCategory = 'cinematic' | 'nature' | ...;

// 接口
export interface SelectOption { value: string; label: string; }
export interface PromptField { name: string; label: string; ... }
export interface CategoryConfig { id: PromptCategory; fields: PromptField[]; ... }
export interface PromptFormData { category: PromptCategory; values: Record<string, string>; }
export interface GeneratedPrompt { category: PromptCategory; prompt: string; ... }
```

---

## ⚠️ 注意事项

1. **必填字段验证**: 生成前会自动验证必填字段
2. **可选字段处理**: 未填写的可选字段会从模板中移除
3. **下拉选项验证**: 会检查选择的值是否在选项列表中
4. **模板清理**: 自动清理多余的逗号和空格

---

## 🚀 下一步

这个库已经准备好使用，你可以：

1. **创建 React 组件** - 使用这个库构建 UI
2. **添加国际化** - 支持多语言界面
3. **集成到现有系统** - 与视频生成 API 对接
4. **扩展功能** - 添加更多分类和字段

---

**维护者**: Claude AI
**版本**: 1.0.0
**最后更新**: 2025-10-21
