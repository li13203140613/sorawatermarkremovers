# 扩展图标说明

## 需要的图标尺寸

- `icon16.png` - 16x16px（浏览器工具栏小图标）
- `icon48.png` - 48x48px（扩展管理页面）
- `icon128.png` - 128x128px（Chrome Web Store）

## 图标设计建议

### 主题
- 视频下载主题
- 使用绿色（#4CAF50）作为主色调
- 简洁、现代的设计风格

### 图标元素
可以包含以下元素之一或组合：
- 下载箭头 ⬇️
- 播放按钮 ▶️
- 视频胶片 🎬
- Sora 相关元素

## 临时方案

在开发阶段，可以：

1. **使用在线工具生成**：
   - https://www.favicon-generator.org/
   - https://favicon.io/

2. **使用 Emoji 转图标**：
   - 访问 https://emoji.to/
   - 输入 🎬 或 ⬇️
   - 生成 PNG 图标

3. **使用 Figma/Canva 设计**：
   - 创建 128x128px 画布
   - 设计图标
   - 导出为 PNG
   - 使用图片编辑工具调整尺寸

## 快速生成方案（推荐）

### 方法一：使用 SVG 转 PNG

创建 `icon.svg` 文件：

\`\`\`xml
<svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
  <!-- 背景圆 -->
  <circle cx="64" cy="64" r="60" fill="#4CAF50"/>

  <!-- 下载箭头 -->
  <path d="M64 30 L64 75 M50 61 L64 75 L78 61"
        stroke="white"
        stroke-width="8"
        stroke-linecap="round"
        fill="none"/>

  <!-- 底部横线 -->
  <path d="M40 90 L88 90"
        stroke="white"
        stroke-width="8"
        stroke-linecap="round"/>
</svg>
\`\`\`

然后使用在线工具转换：
- https://cloudconvert.com/svg-to-png
- 分别生成 16px、48px、128px 版本

### 方法二：使用命令行（需要 ImageMagick）

\`\`\`bash
# 从 SVG 生成不同尺寸的 PNG
magick convert -background none icon.svg -resize 16x16 icon16.png
magick convert -background none icon.svg -resize 48x48 icon48.png
magick convert -background none icon.svg -resize 128x128 icon128.png
\`\`\`

## 当前状态

⚠️ **图标文件缺失**

请根据上述方法生成图标文件，并放置在此目录下：
- `icons/icon16.png`
- `icons/icon48.png`
- `icons/icon128.png`

在图标生成前，扩展可以正常运行，但在扩展管理页面会显示默认图标。
