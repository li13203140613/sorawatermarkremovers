# Chrome 插件开发指南

## 📋 第一步：配置 Supabase

### 1. 获取 Supabase 配置

从网页版项目的 `.env.local` 文件中获取：

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJI...
```

### 2. 修改 config.js

编辑 `chrome-extension/config.js` 文件：

```javascript
export const SUPABASE_CONFIG = {
  url: 'https://xxxxx.supabase.co',  // ← 修改这里
  anonKey: 'eyJhbGciOiJI...',         // ← 修改这里
  storageKey: 'supabase.auth.token'
}
```

### 3. 配置 Supabase Redirect URL

1. 登录 [Supabase Dashboard](https://app.supabase.com/)
2. 进入你的项目
3. 导航到 **Authentication** → **URL Configuration**
4. 在 **Redirect URLs** 中添加：
   ```
   chrome-extension://YOUR_EXTENSION_ID/oauth.html
   ```

⚠️ **注意**: 获取 extension_id 的方法见下方

---

## 🔧 第二步：获取 Extension ID

Chrome 插件需要一个稳定的 ID 用于 OAuth 回调。

### 方式 1：加载未打包的扩展（开发阶段）

1. 打开 Chrome 浏览器
2. 访问 `chrome://extensions/`
3. 打开右上角的 **开发者模式**
4. 点击 **加载已解压的扩展程序**
5. 选择 `chrome-extension` 文件夹
6. 插件加载后，会显示一个 **ID**（例如：`abcdefghijklmnopqrstuvwxyzabcdef`）

⚠️ **问题**: 开发阶段的 ID 会变化！

### 方式 2：生成稳定的 Extension ID（推荐）

使用 Chrome 提供的密钥生成稳定 ID：

1. 在 `chrome://extensions/` 加载插件
2. 点击 **打包扩展程序**
3. 选择 `chrome-extension` 文件夹
4. Chrome 会生成 `.crx` 文件和 `.pem` 密钥文件
5. **保存 `.pem` 文件**（非常重要！）
6. 从 `.pem` 文件生成的 ID 是固定的

### 方式 3：上传到 Chrome Web Store（生产阶段）

1. 打包插件为 `.zip` 文件
2. 访问 [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/)
3. 上传插件（可以设置为 **未发布** 状态）
4. 上传后会获得一个固定的 **Extension ID**
5. 使用这个 ID 配置 Supabase Redirect URL

---

## 🎨 第三步：准备图标

请参考 [icons/ICON_GUIDE.md](icons/ICON_GUIDE.md)

需要 3 个尺寸：
- icon16.png (16x16)
- icon48.png (48x48)
- icon128.png (128x128)

**临时方案**: 如果没有图标，可以先跳过，插件功能不受影响。

---

## 🚀 第四步：加载和测试插件

### 加载插件

1. 打开 Chrome 浏览器
2. 访问 `chrome://extensions/`
3. 打开右上角的 **开发者模式**
4. 点击 **加载已解压的扩展程序**
5. 选择 `chrome-extension` 文件夹
6. 插件加载成功！

### 查看插件

- 点击 Chrome 工具栏右上角的 **拼图图标**
- 找到 **Sora Video Watermark Remover**
- 点击 **固定** 图标，使其始终显示在工具栏

### 测试登录功能

1. 点击插件图标
2. 弹出窗口显示登录页面
3. 点击 **Sign in with Google**
4. 完成 Google 登录
5. 登录成功后，显示用户信息和积分

### 查看控制台日志

**Background Service Worker 日志**:
1. 在 `chrome://extensions/` 页面
2. 找到你的插件
3. 点击 **Service Worker**（蓝色链接）
4. 打开 DevTools，查看日志

**Popup 日志**:
1. 右键点击插件图标
2. 选择 **检查弹出式窗口**
3. 打开 DevTools，查看日志

---

## 🐛 常见问题排查

### 问题 1: 插件无法加载

**症状**: Chrome 提示"无法加载扩展程序"

**解决**:
- 检查 `manifest.json` 语法是否正确
- 确保所有引用的文件都存在
- 查看错误信息，修复文件路径

### 问题 2: Service Worker 无法启动

**症状**: Service Worker 显示"已失效"或不显示日志

**解决**:
- 检查 `background.js` 是否有语法错误
- 确保 `config.js` 使用了 `export` 语法
- 点击 `chrome://extensions/` 中的 **重新加载** 按钮

### 问题 3: 登录失败

**症状**: 点击登录按钮后无响应或报错

**可能原因**:
1. Supabase 配置未修改
2. Redirect URL 未配置
3. Extension ID 不匹配

**解决**:
1. 检查 `config.js` 中的 Supabase URL 和 API Key
2. 在 Supabase Dashboard 添加正确的 Redirect URL
3. 确保使用的是当前插件的 Extension ID

### 问题 4: 无法获取用户信息

**症状**: 登录成功但无法显示积分

**可能原因**:
1. 网页版 API 的 CORS 未配置
2. API Base URL 不正确

**解决**:
1. 修改网页版 API，允许插件来源（参考 PRD.md）
2. 检查 `config.js` 中的 API URL 是否正确

---

## 📁 文件结构

```
chrome-extension/
├── manifest.json          # 插件配置
├── config.js             # Supabase 和 API 配置
├── background.js         # 后台脚本（登录逻辑）
├── popup.html            # 弹窗页面
├── popup.js              # 弹窗逻辑
├── popup.css             # 弹窗样式
├── content.js            # 页面注入脚本（已完成）
├── content.css           # 页面注入样式（已完成）
├── icons/                # 图标文件夹
│   ├── icon16.png
│   ├── icon48.png
│   ├── icon128.png
│   └── ICON_GUIDE.md
├── PRD.md                # 产品需求文档
├── README.md             # 项目说明
└── DEVELOPMENT_GUIDE.md  # 本文档
```

---

## ✅ 开发检查清单

### 配置阶段
- [ ] 修改 `config.js` 中的 Supabase URL 和 API Key
- [ ] 修改 `config.js` 中的生产环境 API Base URL
- [ ] 获取插件的 Extension ID
- [ ] 在 Supabase Dashboard 配置 Redirect URL

### 图标准备
- [ ] 准备 icon16.png
- [ ] 准备 icon48.png
- [ ] 准备 icon128.png

### 功能测试
- [ ] 加载插件成功
- [ ] Service Worker 正常运行
- [ ] Popup 页面正常显示
- [ ] Google 登录成功
- [ ] 显示用户信息
- [ ] 显示积分数量
- [ ] 刷新积分功能正常
- [ ] 退出登录功能正常

### 网页版配置
- [ ] 修改 `/api/user/profile` 的 CORS 配置
- [ ] 修改 `/api/video/process` 的 CORS 配置

---

## 🎯 下一步开发

完成登录功能后，接下来的步骤：

1. **测试积分查询** - 确保可以正确显示积分
2. **测试充值跳转** - 点击充值按钮跳转到网页版
3. **开发视频下载功能** - 在 background.js 中实现 `downloadVideo` 逻辑
4. **测试完整流程** - 登录 → 查看积分 → 下载视频 → 充值 → 退出

---

## 📞 获取帮助

如果遇到问题：

1. 查看 **Chrome DevTools Console** 的错误信息
2. 查看 **Service Worker Console** 的日志
3. 参考 [PRD.md](PRD.md) 的详细说明
4. 检查 Supabase Dashboard 的日志

---

**祝开发顺利！** 🎉
