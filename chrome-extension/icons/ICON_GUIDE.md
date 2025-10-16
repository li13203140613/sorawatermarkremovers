# 插件图标准备指南

## 需要的图标尺寸

请准备以下 3 个尺寸的图标：

1. **icon16.png** - 16x16 像素（浏览器工具栏）
2. **icon48.png** - 48x48 像素（扩展管理页面）
3. **icon128.png** - 128x128 像素（Chrome Web Store）

## 图标设计建议

### 颜色方案
- 主色：紫色渐变 (`#667eea` → `#764ba2`)
- 辅色：白色或浅色

### 设计元素
- 可以使用 🎬 或视频相关图标
- 简洁、易识别
- 在小尺寸下也要清晰

## 快速生成方式

### 方式 1：使用在线工具
访问 https://realfavicongenerator.net/
- 上传一张 512x512 的 PNG 图片
- 生成所有尺寸

### 方式 2：使用 Figma/Sketch
- 创建 512x512 画布
- 设计图标
- 导出为 16x16, 48x48, 128x128

### 方式 3：临时占位图标
如果没有设计图标，可以使用纯色方块作为占位符：

```html
<!-- 使用以下代码生成临时图标 -->
<svg width="128" height="128" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="128" height="128" fill="url(#grad)" rx="24"/>
  <text x="64" y="80" font-family="Arial" font-size="60" fill="white" text-anchor="middle">🎬</text>
</svg>
```

将此 SVG 转换为 PNG 并调整尺寸。

## 当前状态

⚠️ **图标文件缺失**

请将以下文件放入 `icons/` 文件夹：
- [ ] icon16.png
- [ ] icon48.png
- [ ] icon128.png

在准备好图标之前，插件可以正常开发和测试，但在 Chrome 扩展管理页面可能显示默认图标。
