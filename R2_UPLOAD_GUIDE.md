# SoraPrompting 数据上传到 R2 指南

## 📋 前置准备

### 1. 配置 R2 环境变量

在 `.env` 文件中添加以下配置：

```env
# Cloudflare R2 配置
R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=<your-access-key-id>
R2_SECRET_ACCESS_KEY=<your-secret-access-key>
R2_BUCKET_NAME=<your-bucket-name>
R2_PUBLIC_URL=https://<your-custom-domain-or-r2-public-url>
```

### 2. 获取 R2 配置信息

1. **登录 Cloudflare Dashboard**
   - https://dash.cloudflare.com/

2. **进入 R2 页面**
   - 左侧菜单 → R2

3. **创建/选择 Bucket**
   - 如果没有 Bucket，点击 "Create bucket"
   - 记录 Bucket 名称

4. **配置公开访问**
   - 进入 Bucket 设置
   - Settings → Public Access
   - 启用公开访问（或配置自定义域名）
   - 记录公开 URL

5. **创建 API Token**
   - R2 → Manage R2 API Tokens
   - Create API Token
   - 权限: Object Read & Write
   - 记录 Access Key ID 和 Secret Access Key
   - Endpoint 格式: `https://<account-id>.r2.cloudflarestorage.com`

---

## 🚀 上传步骤

### 方法 1: 运行上传脚本（推荐）

```bash
# 上传所有视频和 JSON 数据
node scripts/upload-soraprompting-to-r2.js
```

**脚本功能**:
- ✅ 上传 32 个视频文件到 R2
- ✅ 上传 prompts.json 数据
- ✅ 自动更新 JSON 中的视频 URL 为 R2 URL
- ✅ 生成上传报告

**预计时间**: 10-20 分钟（取决于网络速度）

### 方法 2: 使用 Cloudflare Dashboard

1. 进入 Bucket 页面
2. 手动上传文件
3. 创建文件夹结构：
   ```
   soraprompting/
   ├── videos/
   │   ├── video_001_xxx.mp4
   │   └── ...
   └── prompts.json
   ```

---

## 📊 上传后的文件结构

```
R2 Bucket: <your-bucket-name>
└── soraprompting/
    ├── videos/
    │   ├── video_001_1761037093625.mp4
    │   ├── video_003_1761037175912.mp4
    │   └── ... (32个视频)
    └── prompts.json
```

**公开访问 URL**:
- JSON: `https://your-r2-public-url.com/soraprompting/prompts.json`
- 视频: `https://your-r2-public-url.com/soraprompting/videos/video_001_xxx.mp4`

---

## 🔍 验证上传

### 1. 检查上传结果

```bash
# 查看上传报告
# 脚本会自动显示上传统计和失败项
```

### 2. 测试 JSON 访问

```bash
curl https://your-r2-public-url.com/soraprompting/prompts.json
```

### 3. 测试视频访问

在浏览器中打开：
```
https://your-r2-public-url.com/soraprompting/videos/video_001_xxx.mp4
```

---

## 📝 更新后的 JSON 格式

上传后，JSON 数据会包含 R2 URL：

```json
{
  "source": "https://www.soraprompting.com",
  "totalPrompts": 64,
  "totalVideos": 32,
  "uploadedToR2": true,
  "r2UploadDate": "2025-10-21T...",
  "prompts": [
    {
      "id": 1,
      "title": "Prompt 1",
      "prompt": "...",
      "videoUrl": "https://your-r2-url.com/soraprompting/videos/video_001_xxx.mp4",
      "r2VideoUrl": "https://your-r2-url.com/soraprompting/videos/video_001_xxx.mp4",
      "videoFile": "video_001_xxx.mp4"
    }
  ]
}
```

---

## 🛠️ 故障排查

### 问题 1: 认证失败

**错误**: `AccessDenied` 或 `InvalidAccessKeyId`

**解决方案**:
1. 检查 `.env` 中的 `R2_ACCESS_KEY_ID` 和 `R2_SECRET_ACCESS_KEY`
2. 确保 API Token 权限包含 Object Read & Write
3. 检查 Token 是否过期

### 问题 2: 连接超时

**错误**: `ETIMEDOUT` 或 `ECONNREFUSED`

**解决方案**:
1. 检查 `R2_ENDPOINT` 格式是否正确
2. 确保网络可以访问 Cloudflare R2
3. 尝试使用代理

### 问题 3: 上传速度慢

**解决方案**:
1. 上传脚本已设置串行上传（避免并发过多）
2. 每次上传间隔 1 秒
3. 可以调整脚本中的并发数

### 问题 4: 部分视频上传失败

**解决方案**:
1. 查看上传报告中的失败项
2. 重新运行脚本（会自动跳过已上传的文件）
3. 或手动上传失败的视频

---

## 💰 费用估算

**Cloudflare R2 定价**:
- 存储: $0.015/GB/月
- 出站流量: 免费（与 Cloudflare CDN 集成时）
- 请求: Class A (写): $4.50/百万次, Class B (读): $0.36/百万次

**本项目数据**:
- 视频: 32 个 × ~10MB = ~320MB
- JSON: < 1MB
- **总存储**: ~320MB ≈ $0.005/月

**结论**: 非常便宜！每月不到 $0.01

---

## 📌 下一步

上传完成后：

1. ✅ 更新前端页面使用 R2 URL
2. ✅ 配置 CDN 加速（Cloudflare 自动提供）
3. ✅ 设置缓存策略
4. ✅ 监控流量使用

---

## 🔗 相关文档

- [Cloudflare R2 文档](https://developers.cloudflare.com/r2/)
- [S3 兼容 API](https://developers.cloudflare.com/r2/api/s3/)
- [公开访问配置](https://developers.cloudflare.com/r2/buckets/public-buckets/)

---

**创建时间**: 2025-10-21
**维护者**: Claude AI