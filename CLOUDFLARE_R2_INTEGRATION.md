# Cloudflare R2 集成方案

## 目标

将 AI 生成的视频从 AI Coding API 的临时 URL 下载并保存到 Cloudflare R2 对象存储中，以获得：

- ✅ **永久存储**：视频不会过期
- ✅ **免费出站流量**：R2 不收取出站流量费用
- ✅ **更快的访问速度**：通过 Cloudflare CDN 加速
- ✅ **自定义域名**：可以使用自己的域名访问
- ✅ **成本优化**：比 AWS S3 便宜很多

---

## 一、Cloudflare R2 配置

### 1. 创建 R2 存储桶

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **R2** 产品页面
3. 点击 **Create bucket**
4. 设置存储桶名称，例如：`sora-videos`
5. 选择区域（推荐：**APAC** 亚太区域，访问速度快）

### 2. 创建 API 令牌

1. 在 R2 页面，点击 **Manage R2 API Tokens**
2. 点击 **Create API token**
3. 设置权限：
   - **Token name**: `sora-video-upload`
   - **Permissions**:
     - ✅ Object Read & Write
     - ✅ Bucket Read & Write (可选)
   - **TTL**: Never expire
4. 保存以下信息：
   ```
   Access Key ID: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   Secret Access Key: yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy
   Endpoint: https://xxxxxxxxx.r2.cloudflarestorage.com
   ```

### 3. 配置公开访问（可选）

如果需要视频公开访问：

1. 进入存储桶设置
2. 点击 **Settings** > **Public access**
3. 启用 **Allow public access**
4. 或者配置自定义域名：
   - 在 **Domain** 标签中添加自定义域名
   - 例如：`videos.yourdomain.com`

---

## 二、环境变量配置

在 `.env.local` 中添加 R2 配置：

```env
# Cloudflare R2 配置
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key-id
R2_SECRET_ACCESS_KEY=your-secret-access-key
R2_BUCKET_NAME=sora-videos
R2_PUBLIC_URL=https://videos.yourdomain.com  # 或 R2 的公开 URL
```

---

## 三、安装依赖

R2 兼容 AWS S3 API，可以使用 AWS SDK：

```bash
npm install @aws-sdk/client-s3
```

或者使用更轻量的方案（推荐）：

```bash
npm install @aws-sdk/client-s3 @aws-sdk/lib-storage
```

---

## 四、代码实现

### 1. 创建 R2 客户端工具

创建文件：`lib/r2/client.ts`

```typescript
import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';

// 创建 R2 客户端
export function createR2Client() {
  if (!process.env.R2_ACCOUNT_ID || !process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY) {
    throw new Error('R2 配置缺失');
  }

  return new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
  });
}

/**
 * 从 URL 下载视频并上传到 R2
 * @param videoUrl 视频源 URL
 * @param fileName 保存的文件名
 * @returns R2 中的文件 URL
 */
export async function uploadVideoToR2(
  videoUrl: string,
  fileName: string
): Promise<string> {
  const client = createR2Client();
  const bucketName = process.env.R2_BUCKET_NAME!;

  console.log(`[R2] 开始下载视频: ${videoUrl}`);

  // 1. 下载视频
  const response = await fetch(videoUrl);
  if (!response.ok) {
    throw new Error(`下载视频失败: ${response.statusText}`);
  }

  const videoBuffer = await response.arrayBuffer();
  console.log(`[R2] 视频下载完成，大小: ${(videoBuffer.byteLength / 1024 / 1024).toFixed(2)} MB`);

  // 2. 上传到 R2
  console.log(`[R2] 开始上传到 R2: ${fileName}`);

  const upload = new Upload({
    client,
    params: {
      Bucket: bucketName,
      Key: fileName,
      Body: Buffer.from(videoBuffer),
      ContentType: 'video/mp4',
      // 可选：设置缓存控制
      CacheControl: 'public, max-age=31536000', // 1 年
    },
  });

  await upload.done();

  console.log(`[R2] ✅ 上传成功: ${fileName}`);

  // 3. 返回公开 URL
  const publicUrl = process.env.R2_PUBLIC_URL
    ? `${process.env.R2_PUBLIC_URL}/${fileName}`
    : `https://${bucketName}.${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${fileName}`;

  return publicUrl;
}

/**
 * 生成文件名（使用任务 ID 和时间戳）
 */
export function generateVideoFileName(taskId: string, extension: string = 'mp4'): string {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `videos/${taskId}-${timestamp}-${randomStr}.${extension}`;
}
```

---

### 2. 修改状态查询 API

修改文件：`app/api/video-generation/status/[taskId]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { uploadVideoToR2, generateVideoFileName } from '@/lib/r2/client';
import { createClient } from '@/lib/supabase/server';

const API_BASE = 'https://api.aicoding.sh/v1';

interface TaskStatusResponse {
  id: number;
  model: string;
  account_id: number;
  task_id: string;
  gen_id: string;
  uid: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  message: string;
  progress: {
    progress_pct: number;
  };
  created_at: string;
  updated_at: string;
  result?: {
    output_url: string;
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params;

    // 获取 API Key
    const apiKey = process.env.AICODING_API_KEY || request.headers.get('x-api-key');

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API Key is required' },
        { status: 401 }
      );
    }

    if (!taskId) {
      return NextResponse.json(
        { error: 'taskId is required' },
        { status: 400 }
      );
    }

    // 1. 先检查数据库中是否已有 R2 URL
    const supabase = await createClient();
    const { data: cachedVideo } = await supabase
      .from('video_storage')
      .select('r2_url, original_url, status')
      .eq('task_id', taskId)
      .single();

    // 如果已经上传到 R2，直接返回
    if (cachedVideo && cachedVideo.r2_url) {
      console.log(`[Status] ✅ 从数据库返回缓存的 R2 URL: ${cachedVideo.r2_url}`);
      return NextResponse.json({
        id: taskId,
        task_id: taskId,
        status: 'completed',
        progress: { progress_pct: 100 },
        result: {
          output_url: cachedVideo.r2_url,
          original_url: cachedVideo.original_url
        }
      });
    }

    // 2. 调用 AI Coding API 查询状态
    const response = await fetch(`${API_BASE}/task/${taskId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    const data: TaskStatusResponse = await response.json();

    console.log(`[Status] 任务 ${taskId} 状态: ${data.status}`);
    console.log(`[Status] 进度: ${data.progress?.progress_pct || 0}%`);

    if (!response.ok) {
      console.error('[Status] AI Coding API Error:', data);
      return NextResponse.json(
        {
          error: 'Failed to get task status',
          details: data
        },
        { status: response.status }
      );
    }

    // 3. 如果任务完成且有视频 URL，上传到 R2
    if (data.status === 'completed' && data.result?.output_url) {
      console.log(`[Status] ✅ 任务完成！开始上传到 R2...`);
      console.log(`[Status] 原始 URL: ${data.result.output_url}`);

      try {
        // 生成文件名
        const fileName = generateVideoFileName(taskId);

        // 上传到 R2
        const r2Url = await uploadVideoToR2(data.result.output_url, fileName);

        console.log(`[Status] ✅ R2 上传成功: ${r2Url}`);

        // 保存到数据库
        await supabase.from('video_storage').upsert({
          task_id: taskId,
          original_url: data.result.output_url,
          r2_url: r2Url,
          file_name: fileName,
          status: 'uploaded',
          uploaded_at: new Date().toISOString()
        });

        // 返回 R2 URL
        return NextResponse.json({
          ...data,
          result: {
            output_url: r2Url,
            original_url: data.result.output_url
          }
        });

      } catch (uploadError) {
        console.error('[Status] ❌ R2 上传失败:', uploadError);
        // 上传失败仍返回原始 URL
        return NextResponse.json(data);
      }
    }

    // 4. 任务未完成，直接返回状态
    return NextResponse.json(data);

  } catch (error) {
    console.error('[Status] Error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
```

---

### 3. 创建数据库表（可选但推荐）

创建 Supabase 迁移文件：`supabase/migrations/20250117_video_storage.sql`

```sql
-- 视频存储表
CREATE TABLE IF NOT EXISTS video_storage (
  id BIGSERIAL PRIMARY KEY,
  task_id TEXT UNIQUE NOT NULL,
  original_url TEXT NOT NULL,
  r2_url TEXT,
  file_name TEXT,
  file_size BIGINT,
  status TEXT DEFAULT 'pending',
  uploaded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_video_storage_task_id ON video_storage(task_id);
CREATE INDEX idx_video_storage_status ON video_storage(status);
CREATE INDEX idx_video_storage_uploaded_at ON video_storage(uploaded_at);

-- 添加注释
COMMENT ON TABLE video_storage IS '视频存储记录表';
COMMENT ON COLUMN video_storage.task_id IS 'AI Coding 任务 ID';
COMMENT ON COLUMN video_storage.original_url IS 'AI Coding 返回的原始 URL';
COMMENT ON COLUMN video_storage.r2_url IS 'Cloudflare R2 存储 URL';
COMMENT ON COLUMN video_storage.status IS '状态: pending, uploading, uploaded, failed';
```

---

## 五、优化方案

### 方案 A: 后台异步上传（推荐）

使用后台任务异步上传，不阻塞用户：

```typescript
// lib/r2/background-upload.ts

import { uploadVideoToR2, generateVideoFileName } from './client';
import { createClient } from '@/lib/supabase/server';

/**
 * 后台上传任务（不阻塞响应）
 */
export async function scheduleVideoUpload(taskId: string, videoUrl: string) {
  // 使用 Promise 不等待完成
  uploadVideoInBackground(taskId, videoUrl).catch(error => {
    console.error(`[Background Upload] 任务 ${taskId} 上传失败:`, error);
  });
}

async function uploadVideoInBackground(taskId: string, videoUrl: string) {
  const supabase = await createClient();

  try {
    // 标记为上传中
    await supabase.from('video_storage').upsert({
      task_id: taskId,
      original_url: videoUrl,
      status: 'uploading'
    });

    // 上传到 R2
    const fileName = generateVideoFileName(taskId);
    const r2Url = await uploadVideoToR2(videoUrl, fileName);

    // 更新状态
    await supabase.from('video_storage').update({
      r2_url: r2Url,
      file_name: fileName,
      status: 'uploaded',
      uploaded_at: new Date().toISOString()
    }).eq('task_id', taskId);

    console.log(`[Background Upload] ✅ 任务 ${taskId} 上传完成`);

  } catch (error) {
    // 标记为失败
    await supabase.from('video_storage').update({
      status: 'failed'
    }).eq('task_id', taskId);

    throw error;
  }
}
```

在状态 API 中使用：

```typescript
// 任务完成时触发后台上传
if (data.status === 'completed' && data.result?.output_url) {
  scheduleVideoUpload(taskId, data.result.output_url);

  // 立即返回原始 URL
  return NextResponse.json(data);
}
```

### 方案 B: 使用 Vercel Blob（更简单）

如果你部署在 Vercel 上，也可以使用 Vercel Blob：

```bash
npm install @vercel/blob
```

```typescript
import { put } from '@vercel/blob';

const blob = await put(`videos/${fileName}`, videoBuffer, {
  access: 'public',
  contentType: 'video/mp4',
});

console.log('视频 URL:', blob.url);
```

但 Vercel Blob 有流量费用，不如 R2 免费出站。

---

## 六、成本分析

### Cloudflare R2 定价

- **存储**: $0.015/GB/月
- **写入操作**: $4.50/百万次
- **读取操作**: $0.36/百万次
- **出站流量**: **完全免费** 🎉

### 示例计算

假设每个视频 50MB，每月生成 1000 个视频：

- **存储成本**: 50GB × $0.015 = **$0.75/月**
- **写入成本**: 1000 次 ÷ 1,000,000 × $4.50 = **$0.0045/月**
- **读取成本**: 10,000 次 ÷ 1,000,000 × $0.36 = **$0.0036/月**

**总成本**: 约 **$0.76/月**

相比之下，AWS S3 的出站流量费用是 $0.09/GB，1000 个视频被观看 10 次 = 500GB 出站 = **$45/月**！

---

## 七、测试步骤

### 1. 配置环境变量

```bash
# .env.local
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
R2_BUCKET_NAME=sora-videos
R2_PUBLIC_URL=https://videos.yourdomain.com
```

### 2. 测试上传

创建测试脚本：`test-r2-upload.js`

```javascript
const { uploadVideoToR2, generateVideoFileName } = require('./lib/r2/client');

async function test() {
  const testVideoUrl = 'https://videos.openai.com/vg-assets/test.mp4';
  const fileName = generateVideoFileName('test-task-123');

  console.log('开始测试上传...');
  const r2Url = await uploadVideoToR2(testVideoUrl, fileName);
  console.log('上传成功！R2 URL:', r2Url);
}

test();
```

运行测试：

```bash
node test-r2-upload.js
```

### 3. 测试完整流程

1. 创建视频生成任务
2. 轮询任务状态
3. 任务完成后自动上传到 R2
4. 验证视频可以通过 R2 URL 访问

---

## 八、监控和维护

### 1. 查看 R2 使用情况

在 Cloudflare Dashboard 中可以查看：
- 存储使用量
- 请求次数
- 出站流量（R2 免费）

### 2. 日志监控

添加日志记录：

```typescript
// 记录上传事件
await supabase.from('video_upload_logs').insert({
  task_id: taskId,
  original_url: videoUrl,
  r2_url: r2Url,
  file_size: videoBuffer.byteLength,
  upload_duration: uploadEndTime - uploadStartTime,
  status: 'success'
});
```

### 3. 清理过期视频（可选）

创建定时任务清理 30 天前的视频：

```typescript
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';

async function cleanupOldVideos() {
  const supabase = await createClient();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // 查询过期视频
  const { data: oldVideos } = await supabase
    .from('video_storage')
    .select('*')
    .lt('uploaded_at', thirtyDaysAgo.toISOString());

  const client = createR2Client();

  for (const video of oldVideos || []) {
    // 删除 R2 中的文件
    await client.send(new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: video.file_name
    }));

    // 更新数据库
    await supabase
      .from('video_storage')
      .update({ status: 'deleted' })
      .eq('id', video.id);
  }
}
```

---

## 九、故障排查

### 问题 1: 上传失败 - 权限错误

**错误**: `AccessDenied`

**解决**:
- 检查 R2 API 令牌权限
- 确保令牌有 Object Write 权限

### 问题 2: 下载视频超时

**错误**: `Request timeout`

**解决**:
- 增加超时时间
- 使用流式下载代替一次性下载

```typescript
const response = await fetch(videoUrl, {
  signal: AbortSignal.timeout(60000) // 60 秒超时
});
```

### 问题 3: R2 URL 无法访问

**错误**: `403 Forbidden`

**解决**:
- 检查存储桶是否启用公开访问
- 或配置自定义域名

---

## 十、总结

### 优势

✅ **永久存储**: 视频不会过期
✅ **免费出站**: 节省大量成本
✅ **CDN 加速**: 全球访问速度快
✅ **自定义域名**: 品牌化 URL
✅ **S3 兼容**: 易于迁移和集成

### 推荐架构

```
AI Coding API
    ↓ (生成视频)
临时 URL
    ↓ (后台异步下载)
Next.js API
    ↓ (上传)
Cloudflare R2
    ↓ (CDN 分发)
用户访问
```

### 下一步

1. ✅ 配置 R2 存储桶和 API 令牌
2. ✅ 添加环境变量
3. ✅ 安装 AWS SDK
4. ✅ 实现上传代码
5. ✅ 创建数据库表
6. ✅ 测试完整流程
7. ✅ 配置自定义域名（可选）
8. ✅ 添加监控和日志

需要我帮你实现具体的代码吗？
