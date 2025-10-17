# Chrome Web Store 发布指南

## 一、发布前准备清单

### ✅ 已完成的开发工作

- [x] Google OAuth 登录集成
- [x] Bearer Token 认证系统
- [x] 用户积分管理
- [x] Sora 视频去水印下载
- [x] Popup 界面优化（420px × 600px）
- [x] 下载按钮设计（180px × 48px）
- [x] 所有按钮图标和交互状态
- [x] CORS 配置完整
- [x] API 集成测试通过
- [x] 文档和线框图完成

### ⏳ 等待完成

- [ ] Google 开发者账号审核通过（$5 注册费）
- [ ] 准备商店资料
- [ ] 创建发布 ZIP 包
- [ ] 提交 Chrome Web Store 审核

---

## 二、Google 开发者账号注册

### 1. 注册开发者账号

**访问：** https://chrome.google.com/webstore/devconsole

**步骤：**
1. 使用 Google 账号登录
2. 同意开发者协议
3. 支付 $5 一次性注册费（使用信用卡）
4. 等待 Google 审核（通常 1-2 个工作日）

**重要提示：**
- 注册费不退还
- 账号审核通过后才能发布插件
- 保持账号信息真实准确

---

## 三、准备发布资料

### 1. 商店图标（必需）

**尺寸要求：**
- 128x128 PNG 格式
- 透明背景或纯色背景
- 清晰的品牌标识

**当前图标位置：**
```
chrome-extension/icons/icon128.png
```

**建议优化：**
- 确保图标在白色和深色背景下都清晰可见
- 体现"去水印"或"下载"主题
- 使用高质量 PNG

### 2. 商店截图（必需，至少 1 张，最多 5 张）

**尺寸要求：**
- 1280x800 或 640x400
- PNG 或 JPG 格式
- 展示主要功能

**建议截图内容：**

**截图 1：Popup 未登录状态**
- 展示登录界面
- 标题：One-Click Sign in with Google

**截图 2：Popup 已登录状态**
- 展示用户信息、积分、按钮
- 标题：Manage Your Credits

**截图 3：Sora 页面下载按钮**
- 展示 Sora 视频页面和下载按钮
- 标题：Download Videos with One Click

**截图 4：下载成功状态**
- 展示下载成功提示
- 标题：Fast and Easy Downloads

**截图 5（可选）：积分充值界面**
- 展示充值页面
- 标题：Flexible Credit System

### 3. 宣传图片（可选，推荐）

**小型宣传图：**
- 440x280 PNG 或 JPG
- 用于商店搜索结果

**大型宣传图：**
- 1400x560 PNG 或 JPG
- 用于精选展示

### 4. 商店描述文案

#### 简短描述（132 字符以内）
```
Remove watermarks from Sora videos instantly. Download high-quality videos with one click using our credit-based system.
```

#### 详细描述（建议内容）

```markdown
# Sora Watermark Remover

Remove watermarks from Sora AI-generated videos with just one click!

## Features

✨ **One-Click Download**
- Simple and intuitive interface
- Download videos directly from Sora pages
- High-quality video output

💎 **Credit System**
- Fair and transparent pricing
- Get 1 free credit on sign up
- Easy recharge options

🔐 **Secure Authentication**
- Sign in with your Google account
- Your data is protected
- No personal information stored

📥 **Easy to Use**
1. Sign in with Google
2. Visit any Sora video page
3. Click the "Download" button
4. Save your watermark-free video

## Perfect For

- Content creators
- Video editors
- Social media managers
- Anyone working with Sora AI videos

## Privacy & Security

We take your privacy seriously:
- Secure OAuth authentication
- No video storage on our servers
- Credits are tracked securely
- Transparent usage logs

## Support

Need help? Visit our website: https://www.sora-prompt.io
Contact us: support@sora-prompt.io

---

Start removing watermarks today! Install now and get 1 free credit.
```

### 5. 其他信息

**分类（Category）：**
- Productivity（生产力）

**语言（Languages）：**
- English（英语）

**关键词（建议）：**
- sora
- watermark remover
- video download
- ai video
- sora ai
- video editor

**网站 URL：**
```
https://www.sora-prompt.io
```

**支持邮箱：**
```
support@sora-prompt.io  # 需要提前设置
```

**隐私政策 URL：**
```
https://www.sora-prompt.io/privacy  # 需要创建
```

---

## 四、创建发布 ZIP 包

### 1. 清理不必要的文件

**需要删除或排除的文件：**
```bash
# 测试文件
test-popup.html
VERSION.txt

# 文档文件（可选保留 README.md）
WIREFRAME.md
UI-DESIGN.md
FINAL-DESIGN.md
RELOAD_INSTRUCTIONS.md
DEVELOPMENT_GUIDE.md
PRD.md

# 其他
.git/
.gitignore
node_modules/
```

### 2. 打包命令

**在项目根目录执行：**

```bash
# 进入 chrome-extension 目录
cd chrome-extension

# 创建 ZIP 包（只包含必要文件）
zip -r sora-watermark-remover-v1.1.0.zip \
  manifest.json \
  background.js \
  content.js \
  content.css \
  popup.html \
  popup.js \
  popup.css \
  config.js \
  icons/ \
  README.md

# 或者在 Windows 使用 PowerShell
Compress-Archive -Path manifest.json,background.js,content.js,content.css,popup.html,popup.js,popup.css,config.js,icons,README.md -DestinationPath sora-watermark-remover-v1.1.0.zip
```

### 3. 验证 ZIP 包

**检查清单：**
- [ ] manifest.json 在根目录
- [ ] 所有必需的 JS 和 CSS 文件
- [ ] icons 文件夹包含所有尺寸图标
- [ ] 文件总大小 < 100MB
- [ ] 没有包含敏感信息（API keys, tokens）

---

## 五、提交到 Chrome Web Store

### 1. 访问开发者控制台

**URL：** https://chrome.google.com/webstore/devconsole

### 2. 创建新项目

**步骤：**
1. 点击 "New Item"（新建项）
2. 上传 ZIP 包
3. 填写商店信息

### 3. 填写商店信息

**必填字段：**

**基本信息：**
- Extension Name: Sora Watermark Remover
- Short Description: 见上文简短描述
- Detailed Description: 见上文详细描述
- Category: Productivity
- Language: English

**图形资源：**
- Icon: 128x128 PNG
- Screenshots: 至少 1 张，最多 5 张
- Promotional Images: 可选

**隐私信息：**
- Privacy Policy URL: https://www.sora-prompt.io/privacy
- Permissions Justification: 说明为什么需要各项权限

**分发设置：**
- Visibility: Public（公开）
- Regions: All regions（所有地区）
- Pricing: Free（免费）

### 4. 权限说明（重要）

**必须解释为什么需要这些权限：**

**identity（身份验证）：**
```
Required for Google OAuth sign-in. We use this to authenticate users
and manage their credits securely without storing passwords.
```

**storage（存储）：**
```
Required to store user authentication tokens and preferences locally.
This allows the extension to remember your login status.
```

**downloads（下载）：**
```
Required to save watermark-free videos to your computer.
This is the core functionality of the extension.
```

**tabs（标签页）：**
```
Required to detect when users visit Sora video pages and inject
the download button. No browsing history is collected.
```

**Host Permissions (sora.chatgpt.com, www.sora-prompt.io)：**
```
sora.chatgpt.com: Required to inject the download button on Sora video pages.
www.sora-prompt.io: Required to communicate with our backend API for
video processing and credit management.
```

### 5. 提交审核

**最终检查：**
- [ ] 所有必填字段已填写
- [ ] 截图清晰展示功能
- [ ] 描述准确无误
- [ ] 权限说明合理
- [ ] ZIP 包测试通过

**点击 "Submit for Review"（提交审核）**

---

## 六、审核和发布

### 1. 审核时间

**预计时间：**
- 首次提交：3-7 个工作日
- 更新提交：1-3 个工作日

**审核标准：**
- 功能是否如描述所述
- 是否违反 Chrome Web Store 政策
- 是否包含恶意代码
- 用户隐私保护
- 权限使用是否合理

### 2. 可能的审核结果

**通过（Approved）：**
- 插件自动发布到商店
- 用户可以搜索和安装

**被拒绝（Rejected）：**
- 收到拒绝原因邮件
- 修改后可重新提交
- 常见拒绝原因：
  - 功能描述不准确
  - 权限使用不当
  - 违反政策
  - 技术问题

### 3. 发布后维护

**监控数据：**
- 安装量
- 用户评分
- 崩溃报告
- 用户反馈

**定期更新：**
- 修复 bug
- 添加新功能
- 更新 manifest 版本号
- 提交更新审核

---

## 七、发布后推广

### 1. 优化商店页面

- 收集用户评价
- 更新截图展示新功能
- 优化描述文案
- 添加视频演示

### 2. 推广渠道

- 在官网添加下载链接
- 社交媒体宣传
- 博客文章
- YouTube 演示视频
- Reddit 社区分享

### 3. SEO 优化

- 关键词优化
- 描述优化
- 定期更新内容

---

## 八、常见问题

### Q1: 如何创建隐私政策？

**A:** 需要在官网创建隐私政策页面，说明：
- 收集什么数据
- 如何使用数据
- 如何保护数据
- 用户权利
- 联系方式

**模板：** https://www.freeprivacypolicy.com/

### Q2: 审核被拒绝怎么办？

**A:**
1. 仔细阅读拒绝原因
2. 修改相应问题
3. 更新版本号
4. 重新提交审核
5. 在提交说明中解释修改内容

### Q3: 如何更新已发布的插件？

**A:**
1. 修改代码
2. 更新 manifest.json 版本号
3. 创建新的 ZIP 包
4. 在开发者控制台上传新版本
5. 提交审核
6. 审核通过后自动更新

### Q4: 需要支付额外费用吗？

**A:**
- 开发者账号：$5 一次性费用
- 发布插件：免费
- 更新插件：免费
- 无需其他费用

---

## 九、联系信息

**Chrome Web Store 帮助中心：**
https://developer.chrome.com/docs/webstore/

**开发者支持论坛：**
https://groups.google.com/a/chromium.org/g/chromium-extensions

**政策文档：**
https://developer.chrome.com/docs/webstore/program-policies/

---

## 总结

### 当前状态
✅ 插件开发完成
✅ 代码已提交到 Git
⏳ 等待 Google 开发者账号审核

### 下一步行动
1. ⏳ 等待 Google 开发者账号审核通过
2. 📸 准备 5 张商店截图（1280x800）
3. 📝 创建隐私政策页面
4. 📦 创建发布 ZIP 包
5. 🚀 提交 Chrome Web Store 审核
6. 📢 审核通过后开始推广

---

**预计发布时间：** 开发者账号审核通过后 3-7 个工作日

**版本：** v1.1.0

**更新日期：** 2025-10-16
