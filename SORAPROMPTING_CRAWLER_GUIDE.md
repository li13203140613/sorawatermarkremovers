# SoraPrompting.com 爬虫使用指南

> 自动下载 https://www.soraprompting.com/ 的提示词文案和视频

---

## 📦 安装依赖

```bash
# 安装所需的 npm 包
npm install puppeteer axios cheerio

# 或使用 pnpm
pnpm install puppeteer axios cheerio
```

---

## 🚀 快速开始

### 1. 完整爬取（包含视频）

```bash
node scripts/crawl-soraprompting.js
```

**功能**:
- ✅ 爬取所有提示词文案
- ✅ 下载所有视频文件
- ✅ 保存为 JSON 格式
- ✅ 自动滚动加载更多内容

**输出**:
- `data/soraprompting/prompts.json` - 所有数据（JSON 格式）
- `data/soraprompting/videos/` - 下载的视频文件

---

### 2. 仅爬取文案（不下载视频）

```bash
node scripts/crawl-soraprompting.js --no-videos
```

**用途**: 快速获取文案内容，节省时间和存储空间

---

### 3. 爬取更多页面

```bash
node scripts/crawl-soraprompting.js --max-pages 20
```

**说明**: 默认滚动 10 次，可以增加到 20、30 等

---

### 4. 无头模式（后台运行）

```bash
node scripts/crawl-soraprompting.js --headless
```

**用途**: 服务器环境或不想显示浏览器窗口时使用

---

### 5. 导出为 CSV

```bash
# 先运行爬虫
node scripts/crawl-soraprompting.js

# 然后导出 CSV
node scripts/crawl-soraprompting.js --export-csv
```

**输出**: `data/soraprompting/prompts.csv`

---

## 📊 输出数据格式

### JSON 格式 (`prompts.json`)

```json
{
  "source": "https://www.soraprompting.com",
  "crawledAt": "2025-10-21T10:30:00.000Z",
  "totalPrompts": 150,
  "totalVideos": 150,
  "prompts": [
    {
      "id": 1,
      "title": "Aerial View of Ocean Waves",
      "prompt": "An aerial shot of ocean waves crashing against rugged cliffs...",
      "tags": ["nature", "ocean", "aerial"],
      "videoUrl": "https://example.com/video1.mp4",
      "videoFile": "video_1_1729512000000.mp4",
      "crawledAt": "2025-10-21T10:30:00.000Z"
    }
  ]
}
```

### CSV 格式 (`prompts.csv`)

```csv
ID,Title,Prompt,Tags,Video URL,Video File,Crawled At
1,"Aerial View","An aerial shot...","nature, ocean","https://...","video_1.mp4","2025-10-21T10:30:00.000Z"
```

---

## ⚙️ 配置选项

编辑 `scripts/crawl-soraprompting.js` 中的 `CONFIG` 对象:

```javascript
const CONFIG = {
  baseUrl: 'https://www.soraprompting.com',
  outputDir: path.join(__dirname, '../data/soraprompting'),
  videosDir: path.join(__dirname, '../data/soraprompting/videos'),
  maxPages: 10,           // 最大滚动次数
  scrollDelay: 2000,      // 滚动延迟（毫秒）
  downloadVideos: true,   // 是否下载视频
  headless: false,        // 是否无头模式
};
```

---

## 📋 完整命令行选项

```bash
node scripts/crawl-soraprompting.js [选项]

选项:
  --no-videos          不下载视频（仅保存文案）
  --max-pages <num>    最大滚动次数（默认: 10）
  --headless           无头模式（不显示浏览器）
  --export-csv         导出为 CSV 文件
  -h, --help           显示帮助
```

---

## 💡 使用场景

### 场景 1: 快速预览内容

```bash
# 仅爬取文案，快速了解内容
node scripts/crawl-soraprompting.js --no-videos --max-pages 5
```

### 场景 2: 完整数据备份

```bash
# 下载所有内容（文案 + 视频）
node scripts/crawl-soraprompting.js --max-pages 50
```

### 场景 3: 服务器定时任务

```bash
# 无头模式 + 定时任务
0 2 * * * cd /path/to/project && node scripts/crawl-soraprompting.js --headless --max-pages 30
```

### 场景 4: 数据分析

```bash
# 爬取 → 导出 CSV → Excel 分析
node scripts/crawl-soraprompting.js
node scripts/crawl-soraprompting.js --export-csv
# 然后在 Excel 中打开 prompts.csv
```

---

## 🔧 故障排查

### 问题 1: `puppeteer` 安装失败

**解决方案**:
```bash
# 方法 1: 使用淘宝镜像
npm config set puppeteer_download_host=https://npm.taobao.org/mirrors
npm install puppeteer

# 方法 2: 跳过 Chromium 下载（需手动指定浏览器路径）
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true npm install puppeteer
```

### 问题 2: 爬取到的数据为空

**检查清单**:
1. 网站是否需要登录？
2. 网站是否有反爬虫机制？
3. 网站结构是否改变？

**调试方法**:
```bash
# 使用非无头模式查看浏览器
node scripts/crawl-soraprompting.js --no-headless

# 检查输出日志
# 脚本会显示找到的元素数量
```

### 问题 3: 视频下载失败

**可能原因**:
- 视频URL格式不正确
- 需要认证/权限
- 网络超时

**解决方案**:
```bash
# 1. 仅下载文案，手动检查 videoUrl
node scripts/crawl-soraprompting.js --no-videos

# 2. 查看 prompts.json 中的 videoUrl 字段
# 3. 使用浏览器开发者工具检查视频链接
```

### 问题 4: 内存不足

**解决方案**:
```bash
# 增加 Node.js 内存限制
node --max-old-space-size=4096 scripts/crawl-soraprompting.js
```

---

## 🎯 进阶用法

### 自定义选择器

如果网站结构变化，修改脚本中的 `possibleSelectors`:

```javascript
const possibleSelectors = [
  '.your-custom-selector',  // 添加你的选择器
  '.prompt-card',
  '.video-card',
];
```

### 添加登录功能

在 `crawlSoraPrompting()` 函数开头添加:

```javascript
// 登录
await page.goto('https://www.soraprompting.com/login');
await page.type('#email', 'your-email@example.com');
await page.type('#password', 'your-password');
await page.click('button[type="submit"]');
await page.waitForNavigation();
```

### 过滤特定分类

```javascript
// 在爬取循环中添加过滤
if (!tags.includes('nature')) {
  continue; // 跳过非 nature 分类
}
```

---

## 📂 文件结构

```
RemoveWM/
├── scripts/
│   └── crawl-soraprompting.js    # 爬虫脚本
├── data/
│   └── soraprompting/
│       ├── prompts.json          # 爬取的数据（JSON）
│       ├── prompts.csv           # 导出的 CSV
│       └── videos/               # 下载的视频
│           ├── video_1_xxx.mp4
│           ├── video_2_xxx.mp4
│           └── ...
└── SORAPROMPTING_CRAWLER_GUIDE.md  # 本文档
```

---

## 🤝 集成到项目

### 导入数据到 Supabase

```javascript
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function importToSupabase() {
  const data = JSON.parse(fs.readFileSync('data/soraprompting/prompts.json'));

  for (const prompt of data.prompts) {
    await supabase.from('sora_prompts').insert({
      title: prompt.title,
      prompt: prompt.prompt,
      tags: prompt.tags,
      video_url: prompt.videoUrl,
      source: 'soraprompting.com',
    });
  }
}
```

### 上传视频到 Cloudflare R2

```javascript
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

async function uploadToR2() {
  const videosDir = 'data/soraprompting/videos';
  const files = fs.readdirSync(videosDir);

  for (const file of files) {
    const filePath = path.join(videosDir, file);
    const fileStream = fs.createReadStream(filePath);

    await s3.send(new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: `sora-prompts/${file}`,
      Body: fileStream,
      ContentType: 'video/mp4',
    }));

    console.log(`✅ 上传完成: ${file}`);
  }
}
```

---

## 📝 注意事项

1. **法律合规**: 确保爬取行为符合网站的 robots.txt 和服务条款
2. **速率限制**: 避免频繁请求导致 IP 被封
3. **存储空间**: 视频文件可能很大，确保有足够的磁盘空间
4. **版权**: 下载的内容仅供学习使用，不得用于商业用途

---

## 🆘 获取帮助

```bash
# 查看帮助
node scripts/crawl-soraprompting.js --help
```

---

**最后更新**: 2025-10-21
**维护者**: Claude AI