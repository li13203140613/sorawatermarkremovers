# Sora Prompts 爬虫使用指南

## 概述

这个爬虫脚本用于从 [bestsoraprompts.com](https://bestsoraprompts.com/) 爬取 Sora 2 提示词数据。

---

## 网站分析结果

### 网站结构
- **URL**: https://bestsoraprompts.com/
- **内容**: 包含 Sora 1 和 Sora 2 的提示词示例
- **渲染方式**: 静态 HTML（所有数据在页面源码中）
- **布局**: 单页面，所有提示词按顺序排列

### 数据结构
每个提示词包含：
- ✅ 版本标记（`<p class="soratitle">Sora 2</p>`）
- ✅ 提示词文本（`<p class="prompt">...`）
- ✅ 嵌入视频（`<iframe>` 标签，YouTube 或 Vimeo）

---

## 使用方法

### 1. 运行爬虫脚本

```bash
node scripts/crawl-sora-prompts.js
```

### 2. 查看输出

脚本会生成两个文件：

#### `data/sora2-prompts.json`
包含提取的 Sora 2 提示词数据：

```json
{
  "source": "https://bestsoraprompts.com/",
  "crawlTime": "2025-01-17T10:30:00.000Z",
  "totalCount": 50,
  "version": "Sora 2",
  "categories": {
    "动物": 10,
    "风景": 15,
    "科技": 8,
    ...
  },
  "prompts": [
    {
      "id": "sora2-1",
      "version": "Sora 2",
      "category": "animal",
      "categoryLabel": "动物",
      "categoryIcon": "🐱",
      "prompt": "一只橘色的猫咪戴着墨镜...",
      "video": {
        "type": "youtube",
        "videoId": "abc123",
        "embedUrl": "https://www.youtube.com/embed/abc123",
        "watchUrl": "https://www.youtube.com/watch?v=abc123",
        "thumbnailUrl": "https://img.youtube.com/vi/abc123/maxresdefault.jpg"
      },
      "thumbnailUrl": "https://img.youtube.com/vi/abc123/maxresdefault.jpg",
      "videoUrl": "https://www.youtube.com/watch?v=abc123",
      "embedUrl": "https://www.youtube.com/embed/abc123"
    }
  ]
}
```

#### `data/sora-prompts-page.html`
原始 HTML 页面（用于调试）

---

## 自动分类功能

脚本会根据提示词内容自动分类到 9 个类别：

| 分类 | 图标 | 关键词示例 |
|------|------|-----------|
| 动物 | 🐱 | cat, dog, animal, bird, fish |
| 人物 | 👤 | person, man, woman, character |
| 风景 | 🌄 | landscape, mountain, ocean, sunset |
| 科技 | 🚀 | robot, futuristic, sci-fi, cyber |
| 艺术 | 🎨 | art, painting, abstract, creative |
| 美食 | 🍕 | food, cooking, pizza, restaurant |
| 建筑 | 🏛️ | building, architecture, city |
| 抽象 | ✨ | abstract, surreal, dream, fantasy |
| 动作 | 🏃 | action, sport, running, dancing |

---

## 视频支持

脚本支持提取以下类型的视频：

### YouTube 视频
- 提取视频 ID
- 生成观看链接
- 生成嵌入链接
- **自动获取缩略图**（高清）

### Vimeo 视频
- 提取视频 ID
- 生成观看链接
- 生成嵌入链接

### 直接视频链接
- MP4、WebM、OGG 格式

---

## 将数据导入到项目

### 方法 1: 直接使用 JSON 文件

修改 `app/sora2prompt/page.tsx`:

```typescript
import promptsData from '@/data/sora2-prompts.json';

export default function Sora2PromptPage() {
  // 使用爬取的数据
  const MOCK_PROMPTS = promptsData.prompts;

  // ... 其余代码
}
```

### 方法 2: 转换为 TypeScript 格式

创建 `lib/data/sora-prompts.ts`:

```typescript
import { PromptItem } from '@/types/prompt';
import rawData from '@/data/sora2-prompts.json';

export const SORA2_PROMPTS: PromptItem[] = rawData.prompts.map(p => ({
  id: p.id,
  category: p.category,
  categoryLabel: p.categoryLabel,
  categoryIcon: p.categoryIcon,
  prompt: p.prompt,
  thumbnailUrl: p.thumbnailUrl || '/placeholder.jpg',
  videoUrl: p.videoUrl || p.embedUrl || '',
}));
```

然后在页面中导入：

```typescript
import { SORA2_PROMPTS } from '@/lib/data/sora-prompts';
```

### 方法 3: 保存到数据库

创建导入脚本 `scripts/import-to-db.js`:

```javascript
const { createClient } = require('@supabase/supabase-js');
const promptsData = require('../data/sora2-prompts.json');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function importPrompts() {
  const { data, error } = await supabase
    .from('sora_prompts')
    .insert(promptsData.prompts);

  if (error) {
    console.error('导入失败:', error);
  } else {
    console.log('导入成功:', data);
  }
}

importPrompts();
```

---

## 故障排查

### 问题 1: 爬取失败

**错误**: `Request failed` 或 `ECONNREFUSED`

**解决方案**:
- 检查网络连接
- 检查网站是否可访问
- 尝试使用代理

### 问题 2: 提取不到数据

**错误**: `未能提取到 Sora 2 提示词`

**解决方案**:
1. 检查 `data/sora-prompts-page.html` 文件
2. 查看网站 HTML 结构是否变化
3. 修改脚本中的选择器

### 问题 3: 分类不准确

**解决方案**:
- 手动调整 `categorizePrompt()` 函数中的关键词
- 或者手动编辑 JSON 文件中的分类

---

## 更新数据

定期运行爬虫以获取最新数据：

```bash
# 每周运行一次
node scripts/crawl-sora-prompts.js
```

或者设置定时任务（Linux/Mac）：

```bash
# 编辑 crontab
crontab -e

# 每周一早上 9 点运行
0 9 * * 1 cd /path/to/project && node scripts/crawl-sora-prompts.js
```

---

## 注意事项

### 合法性
- ✅ 仅用于学习和研究目的
- ✅ 数据来自公开网站
- ✅ 不要频繁爬取（避免对服务器造成压力）
- ❌ 不要用于商业用途（除非获得授权）

### 最佳实践
- 每次爬取间隔至少 1 小时
- 保留原始来源信息
- 尊重版权和使用条款

---

## 下一步

1. ✅ 运行爬虫获取数据
2. ✅ 检查生成的 JSON 文件
3. ✅ 将数据导入到项目中
4. ✅ 测试页面显示效果
5. ✅ 根据需要调整分类和格式

需要帮助？查看：
- `scripts/crawl-sora-prompts.js` - 爬虫源码
- `data/sora2-prompts.json` - 爬取的数据
- `app/sora2prompt/page.tsx` - 页面代码
