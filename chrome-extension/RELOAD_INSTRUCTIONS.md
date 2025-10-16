# Chrome 插件强制刷新指南

## 问题现象
Chrome DevTools 显示的样式是旧版本（width: 400px），但实际代码已经更新为 420px。

## 根本原因
Chrome 浏览器缓存了插件的旧版本文件。

## 解决方案

### 方法 1：完全重装插件（强烈推荐）

1. **打开扩展程序页面**
   ```
   chrome://extensions/
   ```

2. **完全删除旧版本**
   - 找到 "Sora Watermark Remover" 插件
   - 点击 "移除" 按钮
   - 确认删除

3. **重新加载新版本**
   - 点击左上角 "加载已解压的扩展程序"
   - 导航到这个文件夹（复制路径）：
     ```
     C:\Users\LILI\hongchuang\xiaohongshu-material-system\RemoveWM\chrome-extension
     ```
   - 选择文件夹并确认

4. **验证版本**
   - 打开插件 Popup
   - 右键 → 检查（打开 DevTools）
   - 查看 `body` 的 `width` 应该是 **420px**

### 方法 2：清除浏览器缓存 + 重新加载

1. **清除缓存**
   - 按 `Ctrl + Shift + Delete`
   - 选择 "缓存的图片和文件"
   - 时间范围选 "全部时间"
   - 点击 "清除数据"

2. **重新加载插件**
   - 打开 `chrome://extensions/`
   - 找到插件
   - 点击 "重新加载" 按钮（圆形箭头图标）

3. **硬刷新 Popup**
   - 打开插件 Popup
   - 按 `Ctrl + Shift + R` 强制刷新

### 方法 3：使用开发者模式强制更新

1. 打开 `chrome://extensions/`
2. 确保 "开发者模式" 已开启（右上角开关）
3. 找到插件，点击 "更新" 按钮
4. 关闭并重新打开 Popup

## 如何确认更新成功

打开插件 Popup，然后：
1. 右键点击 Popup 窗口
2. 选择 "检查"
3. 在 DevTools 的 Elements 标签中查看 `<body>` 元素
4. 查看 Styles 面板，应该显示：
   ```css
   body {
     width: 420px;
     min-height: 520px;
   }
   ```

## 常见问题

**Q: 为什么重新加载还是显示旧版本？**
A: 可能你加载的是其他位置的插件副本。请确认插件路径是：
   `C:\Users\LILI\hongchuang\xiaohongshu-material-system\RemoveWM\chrome-extension`

**Q: DevTools 显示的样式和代码文件不一致怎么办？**
A: 这是典型的缓存问题，必须完全删除插件后重新加载。

**Q: 删除插件会丢失数据吗？**
A: 不会。登录状态和积分数据都保存在 Supabase 服务器，重新安装后登录即可恢复。
