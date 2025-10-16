# 如何获取 Chrome 扩展的 Redirect URI

## 步骤 1：获取扩展 ID

1. 打开 Chrome 浏览器
2. 进入扩展管理页面：
   - 在地址栏输入：`chrome://extensions/`
   - 或点击右上角三个点 → 更多工具 → 扩展程序

3. **确保开启"开发者模式"**（右上角开关）

4. 找到 "Sora Video Downloader" 扩展

5. 复制扩展 ID（类似：`abcdefghijklmnopqrstuvwxyz123456`）

## 步骤 2：构建 Redirect URI

格式：`https://<扩展ID>.chromiumapp.org/`

例如，如果您的扩展 ID 是 `abcdefghijklmnopqrstuvwxyz123456`，
那么 Redirect URI 就是：

```
https://abcdefghijklmnopqrstuvwxyz123456.chromiumapp.org/
```

## 步骤 3：在 Supabase 中添加 Redirect URI

1. 打开 Supabase Dashboard：https://supabase.com/dashboard

2. 选择您的项目（zjefhzapfbouslkgllah）

3. 进入左侧菜单：**Authentication** → **URL Configuration**

4. 在 **Redirect URLs** 部分：
   - 点击 "Add URL"
   - 粘贴您的 Redirect URI：`https://<扩展ID>.chromiumapp.org/`
   - 点击 "Save"

5. 等待几秒钟让配置生效

## 步骤 4：重新测试插件

1. 关闭并重新打开 Chrome 浏览器

2. 点击扩展图标

3. 点击"登录"按钮

4. 应该能正常打开 Google 授权页面了

## 快速调试方法

如果您想快速查看扩展的 Redirect URI：

1. 打开扩展的 Popup 页面
2. 按 F12 打开开发者工具
3. 在 Console 中输入：
   ```javascript
   chrome.identity.getRedirectURL()
   ```
4. 会输出完整的 Redirect URI

## 常见问题

### Q: 为什么需要配置 Redirect URI？
A: Supabase 的 OAuth 安全机制要求所有 Redirect URI 都必须预先在白名单中配置，防止钓鱼攻击。

### Q: Redirect URI 会变化吗？
A: 只要扩展 ID 不变，Redirect URI 就不会变。扩展 ID 在第一次加载扩展时生成，之后保持不变（除非删除重新安装）。

### Q: 可以添加多个 Redirect URI 吗？
A: 可以！如果您有多个扩展版本或测试环境，可以添加多个 Redirect URI。

## 下一步

配置完成后：
1. 测试 OAuth 登录
2. 检查积分是否正确显示
3. 查看 Console 日志确认详细错误信息
