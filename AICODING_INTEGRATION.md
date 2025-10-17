# AI Coding API 集成文档

本文档说明如何使用 AI Coding Sora2 API 进行视频生成功能。

## 📁 文件结构

```
RemoveWM/
├── app/
│   ├── api/
│   │   └── aicoding/
│   │       ├── create/
│   │       │   └── route.ts          # 创建任务 API
│   │       └── status/
│   │           └── [taskId]/
│   │               └── route.ts      # 查询任务状态 API
│   └── test-aicoding/
│       └── page.tsx                  # 测试页面
├── components/
│   └── aicoding/
│       └── VideoGenerator.tsx        # 视频生成组件
├── test-aicoding.js                  # Node.js 测试脚本
├── test-aicoding-api.html           # HTML 测试页面
└── AICODING_INTEGRATION.md          # 本文档
```

## 🚀 快速开始

### 1. 配置 API Key

在 `.env.local` 中添加：

```env
AICODING_API_KEY=your-api-key-here
```

### 2. 测试方法

有三种方式可以测试 API：

#### 方式一：使用 HTML 测试页面（最简单）

1. 在浏览器中打开 `test-aicoding-api.html`
2. 输入 API Key
3. 填写提示词
4. 点击"开始生成"按钮

#### 方式二：使用 Node.js 测试脚本

```bash
# 设置环境变量
export AICODING_API_KEY=your-api-key-here

# 运行测试脚本
node test-aicoding.js
```

或者直接在脚本中修改 `CONFIG.apiKey`。

#### 方式三：使用 Next.js 集成页面

1. 启动开发服务器：
   ```bash
   npm run dev
   ```

2. 访问测试页面：
   ```
   http://localhost:3000/test-aicoding
   ```

## 📖 API 说明

### 创建任务

**Endpoint:** `POST /api/aicoding/create`

**请求体：**
```json
{
  "model": "sora2",  // 或 "sora2-unwm"
  "prompt": "一只可爱的猫咪在草地上奔跑",
  "images": ["data:image/jpeg;base64,..."]  // 可选
}
```

**响应：**
```json
{
  "id": "task_01k6ws92cvf4597j2g34xm83mr",
  "model": "sora2",
  "task_id": "task_01k6ws92cvf4597j2g34xm83mr",
  "status": "pending",
  "message": "Task created",
  "progress": {
    "progress_pct": 0
  },
  "created_at": "2025-10-06T20:52:24+08:00",
  "updated_at": "2025-10-06T20:54:49+08:00"
}
```

### 查询任务状态

**Endpoint:** `GET /api/aicoding/status/[taskId]`

**响应（处理中）：**
```json
{
  "id": 10,
  "status": "processing",
  "message": "sora draft",
  "progress": {
    "progress_pct": 50
  }
}
```

**响应（已完成）：**
```json
{
  "id": 10,
  "status": "completed",
  "message": "sora draft",
  "progress": {
    "progress_pct": 100
  },
  "result": {
    "output_url": "https://videos.openai.com/vg-assets/..."
  }
}
```

## 🎨 在项目中使用

### 在任意页面中使用 VideoGenerator 组件

```tsx
import VideoGenerator from '@/components/aicoding/VideoGenerator';

export default function MyPage() {
  return (
    <div className="container">
      <VideoGenerator />
    </div>
  );
}
```

### 直接调用 API（在客户端）

```typescript
// 创建任务
const response = await fetch('/api/aicoding/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'sora2',
    prompt: '一只可爱的猫咪在草地上奔跑'
  })
});

const data = await response.json();
const taskId = data.task_id;

// 轮询查询状态
const interval = setInterval(async () => {
  const statusResponse = await fetch(`/api/aicoding/status/${taskId}`);
  const statusData = await statusResponse.json();

  if (statusData.status === 'completed') {
    clearInterval(interval);
    console.log('视频地址:', statusData.result.output_url);
  }
}, 1000);
```

## 💡 重要提示

1. **API Key 安全性**
   - 永远不要在客户端代码中硬编码 API Key
   - 使用环境变量存储 API Key
   - 通过后端 API 代理请求

2. **图片要求**
   - 支持格式：png, jpeg, jpg
   - 最大大小：10MB
   - 最多数量：1张
   - ⚠️ **不要包含真人照片**，否则会生成失败

3. **模型选择**
   - `sora2`: 标准版本，$0.02/次
   - `sora2-unwm`: 去水印版本，$0.05/次

4. **提示词技巧**
   - 可以通过提示词控制视频比例（如16:9、9:16等）
   - 可以指定横屏/竖屏
   - 避免涉及：暴力、色情、版权内容、活着的名人等

5. **轮询最佳实践**
   - 建议每1秒轮询一次
   - 设置最大轮询次数（如120次，约2分钟）
   - 处理超时和错误情况

## 🔧 故障排查

### 问题：CORS 错误

如果在 HTML 页面中遇到 CORS 错误，需要使用后端代理。建议使用 Next.js API 路由。

### 问题：API Key 无效

确保：
1. API Key 正确配置在 `.env.local` 中
2. 环境变量已重新加载（重启开发服务器）
3. API Key 有效且有足够余额

### 问题：任务一直处于 pending 状态

可能原因：
1. 服务器繁忙
2. 图片格式或大小不符合要求
3. 提示词包含敏感内容

### 问题：任务失败

检查：
1. 图片中是否包含真人
2. 提示词是否包含违规内容
3. 查看 `message` 字段了解具体失败原因

## 📊 定价说明

- **sora2**: $0.02/次
- **sora2-unwm** (去水印版本): $0.05/次

注意：
- 如果视频生成失败则不会计费
- 但如果视频涉及色情等因素被 sora 判为违规，则会进行惩罚性计费

## 📞 支持

如有问题，请参考：
- AI Coding 官方文档：https://api.aicoding.sh
- 项目 README.md
