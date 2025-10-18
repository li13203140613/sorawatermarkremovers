# Cloudflare R2 配置指南

## 📋 需要的 R2 信息

请提供以下信息，我将帮你配置：

### 1. Account ID
在 Cloudflare Dashboard 右侧可以找到
```
格式: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 2. Access Key ID
在 R2 > Manage R2 API Tokens 中创建
```
格式: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 3. Secret Access Key
创建 API Token 时显示（只显示一次，请保存）
```
格式: yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy
```

### 4. Bucket Name
你创建的存储桶名称
```
格式: sora-videos 或你自定义的名称
```

### 5. Public URL (可选)
如果配置了自定义域名
```
格式: https://videos.yourdomain.com
或使用默认: https://[bucket-name].[account-id].r2.cloudflarestorage.com
```

---

## 🔧 配置步骤

### 第一步：填写配置信息

将你的 R2 信息填写到 `.env.local` 文件中：

```env
# Cloudflare R2 配置
R2_ACCOUNT_ID=你的Account_ID
R2_ACCESS_KEY_ID=你的Access_Key_ID
R2_SECRET_ACCESS_KEY=你的Secret_Access_Key
R2_BUCKET_NAME=你的Bucket名称
R2_PUBLIC_URL=你的公开URL（可选）
```

### 第二步：测试连接

运行测试脚本验证配置：

```bash
node scripts/test-r2-connection.js
```

---

## 📁 建议的 R2 目录结构

```
sora-videos/
├── videos/
│   ├── animal/
│   ├── people/
│   ├── landscape/
│   ├── tech/
│   ├── art/
│   ├── food/
│   ├── architecture/
│   ├── abstract/
│   └── action/
└── thumbnails/
    ├── animal/
    ├── people/
    └── ...
```

---

## ⚙️ R2 存储桶设置

### 1. 创建存储桶（如果还没有）

1. 登录 Cloudflare Dashboard
2. 进入 R2
3. 点击 "Create bucket"
4. 名称：`sora-videos`
5. 区域：选择 **APAC**（亚太，速度快）

### 2. 配置公开访问

#### 选项 A: 使用 R2.dev 域名（简单）

1. 进入存储桶设置
2. 点击 "Settings"
3. 启用 "Allow Access" on R2.dev subdomain
4. 获得 URL: `https://[bucket-name].[account-id].r2.dev`

#### 选项 B: 配置自定义域名（推荐）

1. 进入存储桶 > "Settings" > "Domain"
2. 添加自定义域名（如 `videos.yourdomain.com`）
3. 在 DNS 中添加 CNAME 记录
4. 等待 DNS 生效

### 3. CORS 配置（重要）

在存储桶设置中添加 CORS 规则：

```json
[
  {
    "AllowedOrigins": ["*"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": [],
    "MaxAgeSeconds": 3600
  }
]
```

---

## 🎯 准备工作检查清单

- [ ] 已创建 R2 存储桶
- [ ] 已生成 API Token
- [ ] 已保存 Account ID
- [ ] 已保存 Access Key ID
- [ ] 已保存 Secret Access Key
- [ ] 已配置公开访问（R2.dev 或自定义域名）
- [ ] 已配置 CORS
- [ ] 已填写 `.env.local`

---

## 📝 示例配置

### .env.local 示例

```env
# === Cloudflare R2 配置 ===
R2_ACCOUNT_ID=abc123def456ghi789
R2_ACCESS_KEY_ID=1234567890abcdef1234567890abcdef
R2_SECRET_ACCESS_KEY=abcdefghijklmnopqrstuvwxyz0123456789ABCD
R2_BUCKET_NAME=sora-videos
R2_PUBLIC_URL=https://sora-videos.abc123.r2.dev

# === 下载配置 ===
DOWNLOAD_CONCURRENCY=3
MAX_FILE_SIZE=100MB
VIDEO_QUALITY=1080p

# === 爬虫配置 ===
USER_AGENT=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36
REQUEST_DELAY=2000
MAX_RETRIES=3
```

---

## ✅ 验证配置

运行测试脚本后，你应该看到：

```
✅ R2 连接成功
✅ 存储桶可访问
✅ 上传权限正常
✅ 公开 URL 配置正确

测试文件已上传: test.txt
公开 URL: https://sora-videos.abc123.r2.dev/test.txt
```

---

## 🆘 常见问题

### Q: 找不到 Account ID
**A**: 登录 Cloudflare Dashboard，右侧栏会显示 Account ID

### Q: API Token 创建失败
**A**: 确保账户已启用 R2，并有足够权限

### Q: 上传失败 - 403 Forbidden
**A**: 检查 API Token 权限是否包含 "Object Read & Write"

### Q: 视频无法访问 - 404
**A**: 检查是否已启用公开访问

---

**完成配置后，告诉我你的信息，我会帮你填写到配置文件中！** 🚀
