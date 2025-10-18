# Sora 2 内容自动化收集系统

完整的自动化流程，从爬取提示词到上传 R2，一键完成。

---

## 📋 系统概览

### 功能特点

- ✅ **多来源爬取**: 支持从多个网站爬取 Sora 2 提示词
- ✅ **自动下载**: 支持 YouTube、Vimeo、直接 MP4 链接
- ✅ **缩略图生成**: 使用 ffmpeg 自动提取视频帧
- ✅ **R2 上传**: 批量上传到 Cloudflare R2 CDN
- ✅ **并发控制**: 智能并发控制，避免服务器压力
- ✅ **错误处理**: 完善的错误处理和重试机制
- ✅ **一键运行**: 单个命令完成所有步骤

### 完整流程

```
爬取提示词 → 下载视频 → 生成缩略图 → 上传 R2 → 生成最终数据
```

---

## 🚀 快速开始

### 先决条件

1. **Node.js** (已安装)
2. **ffmpeg** (用于缩略图生成)
   - Windows: https://www.gyan.dev/ffmpeg/builds/
   - Mac: `brew install ffmpeg`
   - Linux: `sudo apt install ffmpeg`

3. **yt-dlp** (可选，用于 YouTube/Vimeo 下载)
   - Windows: https://github.com/yt-dlp/yt-dlp
   - Mac: `brew install yt-dlp`
   - Linux: `pip install yt-dlp`

4. **Cloudflare R2 账号** (已配置)
   - 配置已写入 `.env.local`

### 一键运行

```bash
node scripts/collect-all-content.js
```

这个命令会依次执行:
1. 爬取提示词
2. 下载视频
3. 生成缩略图
4. 上传到 R2
5. 生成最终数据文件

---

## 📂 文件结构

```
RemoveWM/
├── scripts/
│   ├── collect-all-content.js           # 🎯 主控制脚本（一键运行）
│   ├── crawl-multiple-sources.js        # 步骤1: 爬取提示词
│   ├── download-videos.js               # 步骤2: 下载视频
│   ├── generate-thumbnails.js           # 步骤3: 生成缩略图
│   ├── upload-to-r2.js                  # 步骤4: 上传到 R2
│   └── test-r2-connection.js            # R2 连接测试
├── lib/
│   └── r2/
│       └── client.ts                    # R2 客户端库
├── data/
│   ├── sora2-prompts-multi-source.json  # 原始爬取数据
│   └── sora2-prompts-final.json         # 最终数据（供前端使用）
└── downloads/
    ├── videos/                          # 下载的视频
    │   ├── animal/
    │   ├── people/
    │   └── ...
    ├── thumbnails/                      # 生成的缩略图
    │   ├── animal/
    │   ├── people/
    │   └── ...
    ├── download-results.json            # 下载结果
    ├── thumbnail-results.json           # 缩略图生成结果
    └── upload-results.json              # R2 上传结果
```

---

## 🔧 分步执行

如果需要单独运行某个步骤:

### 步骤 1: 爬取提示词

```bash
node scripts/crawl-multiple-sources.js
```

**输出**: `data/sora2-prompts-multi-source.json`

**功能**:
- 从 bestsoraprompts.com 爬取 Sora 2 提示词
- 自动分类（9个分类）
- 提取视频链接和元数据
- 去重处理

### 步骤 2: 下载视频

```bash
node scripts/download-videos.js
```

**输出**: `downloads/videos/` 和 `downloads/download-results.json`

**功能**:
- 支持直接 MP4 下载
- 支持 YouTube (需要 yt-dlp)
- 支持 Vimeo (需要 yt-dlp)
- 并发下载控制 (3个并发)
- 自动跳过已下载的文件
- 文件大小限制 (100MB)

### 步骤 3: 生成缩略图

```bash
node scripts/generate-thumbnails.js
```

**输出**: `downloads/thumbnails/` 和 `downloads/thumbnail-results.json`

**功能**:
- 使用 ffmpeg 提取视频第1秒的帧
- 尺寸: 640x360
- 格式: JPG (可配置)
- 质量: 85% (可配置)
- 并发生成控制 (3个并发)

### 步骤 4: 上传到 R2

```bash
node scripts/upload-to-r2.js
```

**输出**: `data/sora2-prompts-final.json` 和 `downloads/upload-results.json`

**功能**:
- 批量上传视频到 R2
- 批量上传缩略图到 R2
- 自动跳过已上传的文件
- 生成公开 CDN URL
- 更新最终数据文件

---

## ⚙️ 配置说明

### R2 配置 (`.env.local`)

```env
R2_ACCESS_KEY_ID=b9ff72ff56ed7ff9907a86ec1baea41a
R2_SECRET_ACCESS_KEY=82e2ea2b490c02920557ef1e46fe28dcb4ef537a15f3cc59082a64f3e4819543
R2_ENDPOINT=https://8d8a98e19fc8bf5deacc620a87307982.r2.cloudflarestorage.com
R2_BUCKET_NAME=nano-banana-images
R2_PUBLIC_URL=https://gempix.cn
```

### 测试 R2 连接

```bash
node scripts/test-r2-connection.js
```

应该看到:
```
✅ 所有测试通过！R2 配置正确
```

### 可配置参数

在各个脚本中可以修改的参数:

**下载器** (`download-videos.js`):
- `CONCURRENT_DOWNLOADS`: 并发下载数 (默认: 3)
- `MAX_FILE_SIZE`: 最大文件大小 (默认: 100MB)

**缩略图生成器** (`generate-thumbnails.js`):
- `THUMBNAIL_WIDTH`: 宽度 (默认: 640)
- `THUMBNAIL_HEIGHT`: 高度 (默认: 360)
- `THUMBNAIL_FORMAT`: 格式 (默认: jpg)
- `THUMBNAIL_QUALITY`: 质量 (默认: 85)
- `CONCURRENT_GENERATION`: 并发数 (默认: 3)

**R2 上传器** (`upload-to-r2.js`):
- `CONCURRENT_UPLOADS`: 并发上传数 (默认: 3)

---

## 📊 数据结构

### 最终数据文件 (`sora2-prompts-final.json`)

```json
{
  "source": "Multiple sources (crawled, downloaded, uploaded to R2)",
  "lastUpdate": "2025-10-18T12:00:00.000Z",
  "stats": {
    "totalCount": 13,
    "categories": {
      "动物": 2,
      "人物": 7,
      "风景": 1,
      "抽象": 3
    }
  },
  "prompts": [
    {
      "id": "sora2-1",
      "category": "animal",
      "categoryLabel": "动物",
      "categoryIcon": "🐱",
      "prompt": "figure skater performs a triple axle with a cat on her head",
      "thumbnailUrl": "https://gempix.cn/sora2/thumbnails/animal/sora2-1.jpg",
      "videoUrl": "https://gempix.cn/sora2/videos/animal/sora2-1.mp4",
      "source": "bestsoraprompts.com"
    }
  ]
}
```

---

## 🎯 页面集成

### 更新页面数据源

修改 `app/sora2prompt/page.tsx`:

```typescript
// 旧的:
import promptsData from '@/data/sora2-prompts.json';

// 新的:
import promptsData from '@/data/sora2-prompts-final.json';
```

### 重启开发服务器

```bash
npm run dev
```

### 访问页面

```
http://localhost:3000/sora2prompt
```

现在所有视频和图片都从 R2 CDN 加载！

---

## 🔄 定期更新

### 手动更新

```bash
node scripts/collect-all-content.js
```

### 自动更新 (可选)

#### Linux/Mac (crontab)

```bash
# 每周一早上 9 点运行
0 9 * * 1 cd /path/to/RemoveWM && node scripts/collect-all-content.js >> logs/collection.log 2>&1
```

#### Windows (任务计划程序)

1. 打开任务计划程序
2. 创建基本任务
3. 设置触发器 (如: 每周一 9:00)
4. 操作: 启动程序
   - 程序: `node`
   - 参数: `scripts/collect-all-content.js`
   - 起始于: `C:\Users\LILI\hongchuang\xiaohongshu-material-system\RemoveWM`

---

## 🐛 故障排查

### 问题 1: ffmpeg not found

**错误**:
```
❌ ffmpeg 未安装
```

**解决**:
安装 ffmpeg:
- Windows: https://www.gyan.dev/ffmpeg/builds/
- Mac: `brew install ffmpeg`
- Linux: `sudo apt install ffmpeg`

### 问题 2: yt-dlp not found

**错误**:
```
❌ yt-dlp not installed
```

**解决**:
1. 安装 yt-dlp: https://github.com/yt-dlp/yt-dlp
2. 或跳过 YouTube/Vimeo 视频，只下载直接 MP4

### 问题 3: R2 上传失败

**错误**:
```
❌ 上传失败: Access Denied
```

**解决**:
1. 检查 `.env.local` 中的 R2 配置
2. 确保 API Token 有 "Object Read & Write" 权限
3. 运行测试: `node scripts/test-r2-connection.js`

### 问题 4: 视频下载超时

**错误**:
```
❌ 下载失败: Request timeout
```

**解决**:
1. 检查网络连接
2. 增加超时时间 (在脚本中修改 `timeout` 参数)
3. 使用稳定的网络环境

---

## 📈 性能优化

### 并发控制

```javascript
// 根据网络和服务器性能调整
const CONCURRENT_DOWNLOADS = 3;  // 下载并发数
const CONCURRENT_UPLOADS = 3;    // 上传并发数
```

### 文件大小限制

```javascript
// 避免下载过大的文件
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
```

### 缩略图质量

```javascript
// 平衡质量和文件大小
const THUMBNAIL_QUALITY = 85; // 1-100
```

---

## 💰 成本估算

### Cloudflare R2 定价

- **存储**: $0.015/GB/月
- **下载**: $0.36/GB (仅从 R2 下载，不包括通过自定义域名)
- **上传**: 免费
- **API 请求**: 免费 (前 100 万次)

### 示例成本

**假设场景**:
- 50 个视频，每个 20MB = 1GB 视频
- 50 个缩略图，每个 50KB = 2.5MB 缩略图
- 总存储: ~1GB

**月成本**:
- 存储: 1GB × $0.015 = **$0.015/月** (≈ ¥0.11)
- 假设每月 10,000 次浏览，每次加载 1 个缩略图 = 0.5GB 下载
- 下载 (如果不用自定义域名): 0.5GB × $0.36 = $0.18
- **使用自定义域名**: 下载免费！

**总成本**: **~$0.015/月** (使用自定义域名 gempix.cn)

---

## 🎉 总结

### 已实现功能

✅ 完整的自动化流程
✅ 多来源数据爬取
✅ 智能视频下载
✅ 自动缩略图生成
✅ R2 CDN 托管
✅ 一键运行脚本
✅ 完善的错误处理
✅ 详细的日志输出

### 优势

1. **自动化**: 一个命令完成所有步骤
2. **可扩展**: 易于添加新的数据来源
3. **高性能**: 并发控制，快速完成
4. **低成本**: R2 存储成本极低
5. **高可用**: CDN 加速，全球访问快
6. **易维护**: 清晰的代码结构，完善的文档

### 下一步优化方向

- [ ] 添加更多数据来源 (Reddit, Twitter, GitHub)
- [ ] 实现增量更新（只下载新内容）
- [ ] 添加视频质量选择
- [ ] 实现视频转码（统一格式）
- [ ] 添加数据库存储
- [ ] 创建管理后台
- [ ] 实现用户上传提示词

---

## 📞 支持

如有问题，请查看:
- [R2 配置指南](R2_SETUP_GUIDE.md)
- [爬虫使用指南](CRAWL_SORA_PROMPTS_GUIDE.md)
- [故障排查指南](TROUBLESHOOTING.md)

---

**最后更新**: 2025-10-18
**版本**: 1.0.0
**状态**: ✅ 生产就绪
