# Sora2 提示词生成器 - 简单/详细版本切换实现计划

## 📋 需求总结

### 核心需求
1. 在当前提示词生成器页面添加**版本切换功能**
2. 提供两种模式：
   - **简单版本**（默认）：快速生成，只需基本信息
   - **详细版本**：当前的完整功能，精细控制
3. 两个版本的"视频类型"和"生成数量"样式保持一致

---

## 🎨 设计方案

### 1. 版本切换器设计

**位置**: 表单顶部，分类标签之前

**样式**:
```
┌─────────────────────────────────────────┐
│ 💡 选择生成模式                          │
│                                         │
│  [✨ 简单版本]  [🎨 详细版本]            │
│                   ^^^^激活状态           │
│                                         │
│ 简单版本：快速生成，只需输入基本创意      │
│ 详细版本：精细控制，自定义所有参数        │
└─────────────────────────────────────────┘
```

### 2. 简单版本布局

```
┌──────────────────────────────────────────────┐
│ 当前模式：简单版本                            │
├──────────────────────────────────────────────┤
│ 📝 输入您的视频创意 *                         │
│ ┌──────────────────────────────────────┐    │
│ │ 示例：小猫在花园里玩耍                │    │
│ │                                      │    │
│ └──────────────────────────────────────┘    │
│                                              │
│ 🎬 选择视频类型        🔢 生成提示词数量      │
│ [-- 选择类型 --]      [3 - 三个变体]        │
│                                              │
│ [✨ 生成提示词]  [🔄 重置]                    │
└──────────────────────────────────────────────┘
```

### 3. 详细版本布局

```
┌──────────────────────────────────────────────┐
│ 当前模式：详细版本                            │
├──────────────────────────────────────────────┤
│ [🎬 电影] [🌿 自然] [👤 人物] ... (7个分类)  │
├──────────────────────────────────────────────┤
│ [镜头类型*] [主体描述*] [动作描述*]          │
│ [环境场景]  [光照条件]  [摄像机运动]         │
│ ... (3列网格，所有字段)                      │
├──────────────────────────────────────────────┤
│ 🎬 视频类型           🔢 生成提示词数量       │
│ [-- 选择类型 --]      [3 - 三个变体]        │
│                                              │
│ [✨ 生成提示词]  [🔄 重置]                    │
└──────────────────────────────────────────────┘
```

---

## 🔧 技术实现计划

### 阶段 1: 数据层更新

#### 1.1 更新类型定义 (`lib/prompt-generator/types.ts`)

```typescript
// 新增：生成模式类型
export type GenerationMode = 'simple' | 'detailed';

// 新增：简单模式表单数据
export interface SimpleFormData {
  videoIdea: string;        // 视频创意文本
  videoType?: VideoType;    // 可选的视频类型
  promptCount: number;      // 生成数量 (1-9)
}

// 扩展现有的 PromptFormData
export interface PromptFormData {
  mode: GenerationMode;            // 新增：模式标识
  category: PromptCategory;        // 详细模式使用
  values: Record<string, string>;  // 详细模式使用
}
```

#### 1.2 添加简单模式生成逻辑 (`lib/prompt-generator/utils.ts`)

```typescript
/**
 * 简单模式：根据视频创意生成提示词
 * @param formData 简单表单数据
 * @param count 生成数量
 * @returns 生成的提示词数组
 */
export function generatePromptsFromIdea(
  formData: SimpleFormData,
  count: number = 3
): GeneratedPrompt[] {
  // 1. 分析用户输入的视频创意
  const { videoIdea, videoType } = formData;

  // 2. 基于关键词智能选择分类
  const suggestedCategory = suggestCategoryFromIdea(videoIdea);

  // 3. 生成基础提示词模板
  const basePrompt = buildPromptFromIdea(videoIdea, videoType);

  // 4. 生成变体
  const variants = generateVariants(basePrompt, count);

  return variants;
}

/**
 * 根据视频创意内容推荐分类
 */
function suggestCategoryFromIdea(idea: string): PromptCategory {
  const keywords = {
    cinematic: ['电影', '故事', '叙事', '角色'],
    nature: ['自然', '风景', '森林', '海洋', '山'],
    portrait: ['人物', '肖像', '脸部', '表情'],
    // ... 其他分类
  };

  // 简单的关键词匹配算法
  // 默认返回 'cinematic'
}

/**
 * 从创意文本构建提示词
 */
function buildPromptFromIdea(
  idea: string,
  videoType?: VideoType
): string {
  // 基本结构：
  // "A video of {idea}, {videoType style}, professional lighting, 4K quality"

  let prompt = `A video of ${idea}`;

  if (videoType) {
    const styleMap = {
      animation: 'animated style, vibrant colors',
      realistic: 'photorealistic, cinematic',
      cartoon: 'cartoon style, playful',
      movie: 'cinematic, film quality'
    };
    prompt += `, ${styleMap[videoType]}`;
  }

  prompt += ', professional lighting, 4K quality, smooth motion';

  return prompt;
}
```

---

### 阶段 2: 组件层实现

#### 2.1 创建版本切换组件 (`components/prompt-generator/ModeToggle.tsx`)

```typescript
'use client';

import { GenerationMode } from '@/lib/prompt-generator';

interface ModeToggleProps {
  mode: GenerationMode;
  onModeChange: (mode: GenerationMode) => void;
}

export default function ModeToggle({ mode, onModeChange }: ModeToggleProps) {
  return (
    <div className="bg-white p-6 rounded-lg border-2 border-gray-200 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          💡 选择生成模式
        </h3>

        <div className="flex gap-3 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => onModeChange('simple')}
            className={`px-6 py-2 rounded-md font-medium transition-all ${
              mode === 'simple'
                ? 'bg-green-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            ✨ 简单版本
          </button>

          <button
            onClick={() => onModeChange('detailed')}
            className={`px-6 py-2 rounded-md font-medium transition-all ${
              mode === 'detailed'
                ? 'bg-green-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            🎨 详细版本
          </button>
        </div>
      </div>

      <p className="text-sm text-gray-600">
        <strong>简单版本</strong>：快速生成，只需输入基本创意<br/>
        <strong>详细版本</strong>：精细控制，自定义所有参数
      </p>
    </div>
  );
}
```

#### 2.2 创建简单版本表单 (`components/prompt-generator/SimpleForm.tsx`)

```typescript
'use client';

import { useState } from 'react';
import { SimpleFormData, VideoType } from '@/lib/prompt-generator';

interface SimpleFormProps {
  onSubmit: (data: SimpleFormData) => void;
  loading?: boolean;
}

export default function SimpleForm({ onSubmit, loading = false }: SimpleFormProps) {
  const [videoIdea, setVideoIdea] = useState('');
  const [videoType, setVideoType] = useState<VideoType | ''>('');
  const [promptCount, setPromptCount] = useState(3);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!videoIdea.trim()) {
      setError('请输入您的视频创意');
      return;
    }

    onSubmit({
      videoIdea: videoIdea.trim(),
      videoType: videoType || undefined,
      promptCount,
    });
  };

  const handleReset = () => {
    setVideoIdea('');
    setVideoType('');
    setPromptCount(3);
    setError('');
  };

  return (
    <div className="bg-white p-8 rounded-lg border-2 border-gray-200">
      <span className="inline-block px-4 py-2 bg-green-500 text-white rounded-md text-sm font-medium mb-6">
        当前模式：简单版本
      </span>

      <form onSubmit={handleSubmit}>
        {/* 视频创意输入 */}
        <div className="mb-6">
          <label className="flex items-center gap-2 text-base font-medium text-gray-700 mb-3">
            <span className="text-lg">📝</span>
            <span>输入您的视频创意 <span className="text-red-500">*</span></span>
          </label>
          <textarea
            value={videoIdea}
            onChange={(e) => setVideoIdea(e.target.value)}
            placeholder="示例：小猫在花园里玩耍"
            className="w-full min-h-[120px] p-4 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none text-base resize-vertical"
          />
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
        </div>

        {/* 视频类型和生成数量 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* 视频类型 */}
          <div>
            <label className="flex items-center gap-2 text-base font-medium text-gray-700 mb-3">
              <span className="text-lg">🎬</span>
              <span>选择视频类型</span>
            </label>
            <select
              value={videoType}
              onChange={(e) => setVideoType(e.target.value as VideoType | '')}
              className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none text-base"
            >
              <option value="">-- 选择类型 --</option>
              <option value="animation">动画 (Animation)</option>
              <option value="realistic">写实 (Realistic)</option>
              <option value="cartoon">卡通 (Cartoon)</option>
              <option value="movie">电影 (Movie)</option>
            </select>
          </div>

          {/* 生成数量 */}
          <div>
            <label className="flex items-center gap-2 text-base font-medium text-gray-700 mb-3">
              <span className="text-lg">🔢</span>
              <span>生成提示词数量</span>
            </label>
            <select
              value={promptCount}
              onChange={(e) => setPromptCount(Number(e.target.value))}
              className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none text-base"
            >
              <option value="1">1 - 单个提示词</option>
              <option value="2">2 - 两个变体</option>
              <option value="3">3 - 三个变体</option>
              <option value="4">4 - 四个变体</option>
              <option value="5">5 - 五个变体</option>
            </select>
          </div>
        </div>

        {/* 提交按钮 */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-4 bg-green-500 hover:bg-green-600 text-white font-semibold text-base rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '⏳ 生成中...' : '✨ 生成提示词'}
          </button>

          <button
            type="button"
            onClick={handleReset}
            disabled={loading}
            className="px-8 py-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold text-base rounded-lg transition-colors disabled:opacity-50"
          >
            🔄 重置
          </button>
        </div>
      </form>

      <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded">
        <p className="text-sm text-blue-800">
          <strong className="font-semibold">💡 提示</strong><br/>
          简单版本会根据您的创意自动生成优化的 Sora 提示词。想要更精细的控制？切换到"详细版本"！
        </p>
      </div>
    </div>
  );
}
```

#### 2.3 更新主表单组件 (`components/prompt-generator/PromptGeneratorForm.tsx`)

**修改策略**：
1. 重命名当前组件为 `DetailedForm.tsx`
2. 创建新的 `PromptGeneratorForm.tsx` 作为统一入口
3. 根据 mode 渲染不同的子组件

```typescript
'use client';

import { useState } from 'react';
import { GenerationMode, PromptCategory } from '@/lib/prompt-generator';
import ModeToggle from './ModeToggle';
import SimpleForm from './SimpleForm';
import DetailedForm from './DetailedForm';

interface PromptGeneratorFormProps {
  onSubmit: (
    category: PromptCategory,
    values: Record<string, string>,
    promptCount: number
  ) => void;
  loading?: boolean;
}

export default function PromptGeneratorForm({ onSubmit, loading }: PromptGeneratorFormProps) {
  const [mode, setMode] = useState<GenerationMode>('simple');

  const handleSimpleSubmit = (data: SimpleFormData) => {
    // 将简单模式数据转换为详细模式格式
    const category = 'cinematic'; // 默认或智能推荐
    const values = {
      videoIdea: data.videoIdea,
      videoType: data.videoType || '',
    };
    onSubmit(category, values, data.promptCount);
  };

  const handleDetailedSubmit = (
    category: PromptCategory,
    values: Record<string, string>,
    promptCount: number
  ) => {
    onSubmit(category, values, promptCount);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* 版本切换器 */}
      <ModeToggle mode={mode} onModeChange={setMode} />

      {/* 根据模式渲染不同表单 */}
      {mode === 'simple' ? (
        <SimpleForm onSubmit={handleSimpleSubmit} loading={loading} />
      ) : (
        <DetailedForm onSubmit={handleDetailedSubmit} loading={loading} />
      )}
    </div>
  );
}
```

---

### 阶段 3: 页面集成

#### 3.1 更新主页 (`app/[locale]/page.tsx`)

```typescript
// 无需修改太多，handleGenerate 已经兼容
const handleGenerate = async (
  category: PromptCategory,
  values: Record<string, string>,
  promptCount: number
) => {
  setLoading(true);
  setError(null);

  try {
    // 检查是否是简单模式（通过 values.videoIdea 判断）
    if (values.videoIdea) {
      // 简单模式：使用新的生成逻辑
      const generatedPrompts = generatePromptsFromIdea(
        {
          videoIdea: values.videoIdea,
          videoType: values.videoType as VideoType,
          promptCount,
        },
        promptCount
      );
      setPrompts(generatedPrompts);
    } else {
      // 详细模式：使用现有逻辑
      const generatedPrompts = generatePromptVariants(
        { category, values },
        promptCount
      );
      setPrompts(generatedPrompts);
    }

    // Scroll to results...
  } catch (err) {
    // Error handling...
  } finally {
    setLoading(false);
  }
};
```

---

## 📦 文件清单

### 新建文件
1. `components/prompt-generator/ModeToggle.tsx` - 版本切换组件
2. `components/prompt-generator/SimpleForm.tsx` - 简单版本表单
3. `lib/prompt-generator/simple.ts` - 简单模式生成逻辑

### 修改文件
1. `components/prompt-generator/PromptGeneratorForm.tsx` - 改为统一入口
2. `components/prompt-generator/DetailedForm.tsx` - 从原 Form 重命名
3. `lib/prompt-generator/types.ts` - 添加新类型
4. `lib/prompt-generator/utils.ts` - 添加简单模式函数
5. `lib/prompt-generator/index.ts` - 导出新函数
6. `app/[locale]/page.tsx` - 更新 handleGenerate 逻辑

---

## 🎯 实现步骤

### Step 1: 类型定义 (5分钟)
- [ ] 在 `types.ts` 添加 `GenerationMode`, `SimpleFormData`
- [ ] 更新 `PromptFormData` 接口

### Step 2: 简单模式逻辑 (20分钟)
- [ ] 创建 `lib/prompt-generator/simple.ts`
- [ ] 实现 `generatePromptsFromIdea()`
- [ ] 实现 `suggestCategoryFromIdea()`
- [ ] 实现 `buildPromptFromIdea()`

### Step 3: UI 组件 (30分钟)
- [ ] 创建 `ModeToggle.tsx`
- [ ] 创建 `SimpleForm.tsx`
- [ ] 重命名并调整 `DetailedForm.tsx`
- [ ] 重写 `PromptGeneratorForm.tsx` 为路由组件

### Step 4: 页面集成 (10分钟)
- [ ] 更新 `page.tsx` 的 `handleGenerate`
- [ ] 测试简单/详细模式切换
- [ ] 测试生成功能

### Step 5: 样式优化 (10分钟)
- [ ] 确保两个版本的 select 样式一致
- [ ] 响应式布局测试
- [ ] 过渡动画优化

### Step 6: 测试 (15分钟)
- [ ] 简单模式生成测试
- [ ] 详细模式生成测试
- [ ] 切换模式状态保持测试
- [ ] 表单验证测试

**总计时间**: ~90分钟

---

## 🚀 可选增强功能

1. **智能分类推荐**
   - 根据视频创意自动推荐最适合的分类
   - 在简单模式显示"推荐分类：电影叙事"

2. **模式状态保存**
   - 使用 localStorage 保存用户偏好的模式
   - 下次访问自动切换到上次使用的模式

3. **示例快速填充**
   - 在简单模式提供几个示例按钮
   - 点击快速填充表单（如"小猫玩耍"、"城市夜景"等）

4. **渐进式引导**
   - 首次访问用户看到简单模式
   - 引导提示"想要更多控制？试试详细模式"

---

## 📊 成功指标

- [ ] 用户可以在两个版本间无缝切换
- [ ] 简单版本3步即可生成
- [ ] 详细版本功能完全保留
- [ ] 两个版本的 select 样式完全一致
- [ ] 移动端体验良好
- [ ] 生成结果质量符合预期

---

## 🎨 设计参考

**线框图地址**: `public/prompt-generator-simple-version-wireframe.html`

在浏览器中打开查看完整交互演示：
```
http://localhost:3000/prompt-generator-simple-version-wireframe.html
```

---

**创建时间**: 2025-10-22
**状态**: 待审核
**审核人**: 用户
