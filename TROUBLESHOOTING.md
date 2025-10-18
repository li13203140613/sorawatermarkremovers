# 故障排查指南

## ✅ 问题已修复

### 问题 1: Internal Server Error

**原因**: 端口 3000 被占用

**解决**:
1. 已杀掉旧进程
2. 重启开发服务器

---

### 问题 2: 图片域名未配置错误

**错误信息**:
```
Invalid src prop (https://placehold.co/640x360/...) on 'next/image',
hostname "placehold.co" is not configured under images in your 'next.config.js'
```

**原因**: Next.js 要求所有外部图片域名必须在配置文件中明确声明

**已修复**:
在 `next.config.js` 中添加了以下域名：
- ✅ placehold.co (占位图服务)
- ✅ openaiassets.blob.core.windows.net (OpenAI 视频资源)
- ✅ img.youtube.com (YouTube 缩略图)
- ✅ i.vimeocdn.com (Vimeo 缩略图)

---

## 🔄 如何应用配置更改

### 方法 1: 刷新浏览器（推荐）

Next.js 15 支持热更新配置文件，只需：

1. 在浏览器中按 **F5** 或 **Ctrl+R** 刷新页面
2. 等待几秒让 Next.js 重新编译

### 方法 2: 重启开发服务器

如果刷新不生效，手动重启：

1. 在终端按 **Ctrl+C** 停止服务器
2. 运行 `npm run dev` 重新启动

---

## 📍 现在可以访问

### 测试页面（推荐）
```
http://localhost:3000/sora2prompt-test
```

特点：
- ✅ 使用内嵌测试数据（3条）
- ✅ 不依赖 JSON 导入
- ✅ 保证可以正常工作

### 正式页面
```
http://localhost:3000/sora2prompt
```

特点：
- ✅ 使用真实爬取数据（13条）
- ✅ 从 JSON 文件导入
- ✅ 需要刷新浏览器才能看到效果

---

## 🎯 功能验证清单

访问页面后，请检查：

- [ ] 页面是否正常加载（无错误）
- [ ] 图片是否正常显示
- [ ] 分类筛选是否工作
- [ ] 点击卡片是否打开视频弹窗
- [ ] 视频是否可以播放
- [ ] 复制提示词按钮是否工作
- [ ] 响应式布局是否正常

---

## ⚠️ 常见问题

### Q1: 页面仍然显示错误

**A**:
1. 确保已刷新浏览器（硬刷新: Ctrl+Shift+R）
2. 清除浏览器缓存
3. 查看浏览器控制台是否有新的错误信息

### Q2: 图片不显示

**A**:
1. 检查网络连接
2. 检查占位图服务 (placehold.co) 是否可访问
3. 尝试访问测试页面验证配置是否生效

### Q3: 视频无法播放

**A**:
- Vimeo 视频: 需要稳定的网络连接
- MP4 视频: 浏览器需要支持 HTML5 video
- 检查浏览器控制台的CORS错误

---

## 🔍 调试技巧

### 1. 查看开发服务器日志

在运行 `npm run dev` 的终端中查看编译状态和错误信息。

### 2. 使用浏览器开发者工具

按 **F12** 打开开发者工具：
- **Console**: 查看 JavaScript 错误
- **Network**: 查看图片和视频加载状态
- **Elements**: 检查DOM结构

### 3. 检查配置文件

确认 `next.config.js` 包含正确的图片域名配置：

```javascript
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'placehold.co',
    },
    // ... 其他域名
  ],
}
```

---

## 📊 配置文件对比

### 修复前
```javascript
const nextConfig = {}
```

### 修复后
```javascript
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'https', hostname: 'openaiassets.blob.core.windows.net' },
      { protocol: 'https', hostname: 'img.youtube.com' },
      { protocol: 'https', hostname: 'i.vimeocdn.com' },
    ],
  },
}
```

---

## 🎉 成功标志

页面正常工作时，你应该看到：

1. **Hero 区域**: 大标题 "🎬 Sora 2 提示词库"
2. **分类筛选**: 横向排列的分类按钮
3. **提示词卡片**: 带有封面图的卡片网格
4. **无错误信息**: 浏览器控制台没有红色错误

---

## 📞 下一步

如果页面正常显示：
- ✅ 可以开始使用页面
- ✅ 可以添加更多提示词数据
- ✅ 可以进行 SEO 优化

如果仍有问题：
- 📸 截图错误信息
- 📋 复制浏览器控制台的错误
- 🔍 检查网络请求状态

---

**刷新浏览器，页面应该可以正常工作了！** 🚀
