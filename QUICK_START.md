# Sora 2 自动化系统 - 快速参考

## 一键运行（推荐）

```bash
node scripts/collect-all-content.js
```

这会自动完成:
1. ✅ 爬取提示词
2. ✅ 下载视频
3. ✅ 生成缩略图
4. ✅ 上传到 R2
5. ✅ 生成最终数据

**预计时间**: 10-30 分钟

---

## 测试 R2 连接

```bash
node scripts/test-r2-connection.js
```

---

## 分步运行

### 步骤 1: 爬取
```bash
node scripts/crawl-multiple-sources.js
```
输出: `data/sora2-prompts-multi-source.json`

### 步骤 2: 下载
```bash
node scripts/download-videos.js
```
输出: `downloads/videos/` + `download-results.json`

### 步骤 3: 缩略图
```bash
node scripts/generate-thumbnails.js
```
输出: `downloads/thumbnails/` + `thumbnail-results.json`

### 步骤 4: 上传
```bash
node scripts/upload-to-r2.js
```
输出: `data/sora2-prompts-final.json` + `upload-results.json`

---

## 页面集成

### 1. 更新数据源

在 `app/sora2prompt/page.tsx`:

```typescript
// 改为:
import promptsData from '@/data/sora2-prompts-final.json';
```

### 2. 重启服务器

```bash
npm run dev
```

### 3. 访问页面

```
http://localhost:3000/sora2prompt
```

---

## 先决条件

### 必需
- ✅ Node.js (已安装)
- ✅ R2 配置 (已配置在 .env.local)

### 可选但推荐
- ⚠️  **ffmpeg** (用于缩略图)
  - Windows: https://www.gyan.dev/ffmpeg/builds/
  - Mac: `brew install ffmpeg`
  - Linux: `sudo apt install ffmpeg`

- ⚠️  **yt-dlp** (用于 YouTube/Vimeo)
  - 官网: https://github.com/yt-dlp/yt-dlp

---

## R2 配置

已配置在 `.env.local`:

```env
R2_ACCESS_KEY_ID=b9ff72ff56ed7ff9907a86ec1baea41a
R2_SECRET_ACCESS_KEY=82e2ea2b490c02920557ef1e46fe28dcb4ef537a15f3cc59082a64f3e4819543
R2_ENDPOINT=https://8d8a98e19fc8bf5deacc620a87307982.r2.cloudflarestorage.com
R2_BUCKET_NAME=nano-banana-images
R2_PUBLIC_URL=https://gempix.cn
```

---

## 常见问题

### Q: ffmpeg not found
```bash
# Mac
brew install ffmpeg

# Windows
下载: https://www.gyan.dev/ffmpeg/builds/

# Linux
sudo apt install ffmpeg
```

### Q: yt-dlp not found
```bash
# Mac
brew install yt-dlp

# Windows/Linux
访问: https://github.com/yt-dlp/yt-dlp
```

### Q: R2 上传失败
```bash
# 测试连接
node scripts/test-r2-connection.js
```

---

## 文件位置

### 数据文件
- 原始数据: `data/sora2-prompts-multi-source.json`
- 最终数据: `data/sora2-prompts-final.json` ⭐

### 本地文件
- 视频: `downloads/videos/[category]/`
- 缩略图: `downloads/thumbnails/[category]/`

### R2 存储
- 视频: `https://gempix.cn/sora2/videos/[category]/`
- 缩略图: `https://gempix.cn/sora2/thumbnails/[category]/`

---

## 成本

使用自定义域名 (gempix.cn):
- 存储: ~$0.015/月 (1GB)
- 下载: **免费** (通过自定义域名)

**总计**: ~¥0.11/月 💰

---

## 完整文档

详细文档: [SORA2_AUTOMATION_GUIDE.md](SORA2_AUTOMATION_GUIDE.md)

---

**开始使用**:
```bash
node scripts/collect-all-content.js
```
