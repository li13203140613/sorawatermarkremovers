# Sora2 Prompts 爬虫方案

## 目标网站分析

**网站**: https://sora2-collect.vercel.app/
**标题**: 生成式视频提示词展示
**技术栈**: React 19.2.0 + Vercel 部署

---

## 一、技术方案概述

### 方案 1: 静态页面爬取（基础）

**适用场景**: 数据直接嵌入在 HTML 中

**技术栈**:
- Node.js + axios/node-fetch
- cheerio (HTML 解析)

**实现步骤**:

```javascript
// 1. 获取页面 HTML
const html = await axios.get('https://sora2-collect.vercel.app/');

// 2. 使用 cheerio 解析
const $ = cheerio.load(html.data);

// 3. 查找数据位置（需要先查看页面结构）
// 可能的位置：
// - <script id="__NEXT_DATA__"> (Next.js 服务端渲染数据)
// - window.__INITIAL_DATA__
// - 直接在 HTML 元素中
```

**优点**: 简单快速，无需浏览器
**缺点**: 如果数据是动态加载的，无法获取

---

### 方案 2: 浏览器自动化（推荐）

**适用场景**: 数据通过 JavaScript 动态加载

**技术栈**:
- Puppeteer 或 Playwright
- 可以执行 JavaScript，等待数据加载完成

**实现步骤**:

```javascript
// 1. 启动无头浏览器
const browser = await puppeteer.launch();
const page = await browser.newPage();

// 2. 访问页面
await page.goto('https://sora2-collect.vercel.app/', {
  waitUntil: 'networkidle0' // 等待网络请求完成
});

// 3. 等待数据加载
await page.waitForSelector('.prompt-card'); // 假设提示语在这个类中

// 4. 提取数据
const prompts = await page.evaluate(() => {
  // 在浏览器上下文中执行
  const cards = document.querySelectorAll('.prompt-card');
  return Array.from(cards).map(card => ({
    text: card.querySelector('.prompt-text')?.textContent,
    category: card.querySelector('.category')?.textContent,
    // ... 其他字段
  }));
});

// 5. 监听 API 请求（重要！）
page.on('response', async (response) => {
  const url = response.url();
  if (url.includes('/api/') || url.includes('prompts')) {
    const data = await response.json();
    console.log('发现 API 数据:', data);
  }
});
```

**优点**:
- 可以处理动态加载的数据
- 可以截获 API 请求
- 可以模拟用户操作（滚动、点击等）

**缺点**:
- 资源消耗较大
- 速度相对较慢

---

### 方案 3: API 逆向（最优）

**适用场景**: 找到数据的 API 接口

**步骤**:

1. **使用浏览器开发者工具**:
   ```
   F12 -> Network -> 访问网站 -> 查看 XHR/Fetch 请求
   ```

2. **常见 API 端点**:
   ```
   https://sora2-collect.vercel.app/api/prompts
   https://sora2-collect.vercel.app/api/data
   https://sora2-collect.vercel.app/api/list
   /api/prompts?page=1&limit=100
   ```

3. **直接请求 API**:
   ```javascript
   const response = await axios.get('https://sora2-collect.vercel.app/api/prompts', {
     headers: {
       'User-Agent': 'Mozilla/5.0...',
       'Referer': 'https://sora2-collect.vercel.app/'
     }
   });
   ```

**优点**:
- 最快最稳定
- 数据结构化
- 不容易被反爬

---

## 二、数据提取策略

### 1. Next.js 应用的数据提取

Next.js 应用通常会在页面中包含 `__NEXT_DATA__`:

```javascript
// 从 HTML 中提取
const scriptTag = html.match(/<script id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/s);
if (scriptTag) {
  const nextData = JSON.parse(scriptTag[1]);
  // nextData.props.pageProps 通常包含数据
  const prompts = nextData.props.pageProps.prompts;
}
```

### 2. React State 数据提取

如果数据在 React 组件的 state 中:

```javascript
// 使用 Puppeteer
const reactData = await page.evaluate(() => {
  // 查找 React 根节点
  const rootElement = document.getElementById('__next') || document.getElementById('root');

  // 获取 React 内部状态（需要 React DevTools 支持）
  // 或者通过全局变量
  return window.__REACT_DATA__;
});
```

### 3. 动态滚动加载

如果页面使用无限滚动:

```javascript
async function scrollAndCollect(page) {
  let allPrompts = [];
  let previousHeight = 0;

  while (true) {
    // 滚动到底部
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(2000); // 等待加载

    // 提取当前页面的数据
    const prompts = await page.evaluate(() => {
      // 提取逻辑
    });

    allPrompts.push(...prompts);

    // 检查是否到底
    const currentHeight = await page.evaluate(() => document.body.scrollHeight);
    if (currentHeight === previousHeight) break;
    previousHeight = currentHeight;
  }

  return allPrompts;
}
```

---

## 三、完整实现示例

### 示例 1: Puppeteer 完整方案

```javascript
const puppeteer = require('puppeteer');
const fs = require('fs');

async function crawlSora2Prompts() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();

  // 监听所有请求，找到 API
  const apiData = [];
  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('/api/') && response.status() === 200) {
      try {
        const data = await response.json();
        apiData.push({ url, data });
        console.log('发现 API:', url);
      } catch (e) {}
    }
  });

  // 访问页面
  await page.goto('https://sora2-collect.vercel.app/', {
    waitUntil: 'networkidle2'
  });

  // 等待内容加载
  await page.waitForTimeout(3000);

  // 方法 1: 尝试从 __NEXT_DATA__ 获取
  const nextData = await page.evaluate(() => {
    const scriptTag = document.getElementById('__NEXT_DATA__');
    if (scriptTag) {
      return JSON.parse(scriptTag.textContent);
    }
    return null;
  });

  // 方法 2: 从页面元素提取
  const prompts = await page.evaluate(() => {
    // 需要根据实际页面结构调整选择器
    const cards = document.querySelectorAll('[class*="prompt"], [class*="card"]');
    return Array.from(cards).map(card => {
      return {
        text: card.textContent.trim(),
        html: card.innerHTML
      };
    });
  });

  // 保存数据
  const result = {
    timestamp: new Date().toISOString(),
    source: 'https://sora2-collect.vercel.app/',
    nextData: nextData,
    apiData: apiData,
    prompts: prompts
  };

  fs.writeFileSync('sora2-prompts.json', JSON.stringify(result, null, 2));
  console.log(`提取了 ${prompts.length} 条提示语`);

  await browser.close();
}

crawlSora2Prompts();
```

### 示例 2: 使用 Playwright (更现代)

```javascript
const { chromium } = require('playwright');

async function crawlWithPlaywright() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  });
  const page = await context.newPage();

  // 拦截 API 请求
  await page.route('**/api/**', async (route, request) => {
    const response = await route.fetch();
    const json = await response.json();
    console.log('API 数据:', json);

    // 保存到文件
    fs.appendFileSync('api-responses.json', JSON.stringify(json) + '\n');

    await route.continue();
  });

  await page.goto('https://sora2-collect.vercel.app/');
  await page.waitForLoadState('networkidle');

  // 提取数据
  const data = await page.evaluate(() => {
    // 提取逻辑
  });

  await browser.close();
}
```

---

## 四、反爬虫对策

### 可能遇到的限制

1. **User-Agent 检测**
   ```javascript
   headers: {
     'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ...'
   }
   ```

2. **频率限制**
   ```javascript
   // 添加延迟
   await new Promise(resolve => setTimeout(resolve, 2000));
   ```

3. **Cloudflare 保护**
   - 使用 Puppeteer 的 stealth 插件
   ```javascript
   const puppeteer = require('puppeteer-extra');
   const StealthPlugin = require('puppeteer-extra-plugin-stealth');
   puppeteer.use(StealthPlugin());
   ```

4. **验证码**
   - 需要人工介入或使用验证码识别服务

---

## 五、数据结构预期

根据该网站是"生成式视频提示词展示"，数据结构可能是:

```json
{
  "prompts": [
    {
      "id": "123",
      "text": "一只橘色的猫咪戴着墨镜，驾驶一辆红色的敞篷跑车",
      "category": "动物",
      "tags": ["猫", "汽车", "可爱"],
      "author": "user123",
      "createdAt": "2025-10-15T10:30:00Z",
      "likes": 156,
      "videoUrl": "https://...",
      "thumbnailUrl": "https://..."
    }
  ]
}
```

---

## 六、实施步骤建议

### 第一步: 手动分析（最重要！）

1. **打开网站** https://sora2-collect.vercel.app/
2. **打开开发者工具** (F12)
3. **切换到 Network 标签**
4. **刷新页面**
5. **观察**:
   - 是否有 API 请求？
   - 数据在哪个请求中？
   - 请求的 URL、方法、参数是什么？
6. **切换到 Elements 标签**
   - 查看 HTML 结构
   - 找到提示语所在的元素
   - 记录 class 名称和结构

### 第二步: 选择方案

- **如果发现了 API** → 使用方案 3 (API 逆向)
- **如果数据在 HTML 中** → 使用方案 1 (静态爬取)
- **如果数据动态加载** → 使用方案 2 (Puppeteer)

### 第三步: 编写代码

根据选择的方案编写对应的爬虫代码

### 第四步: 测试和优化

- 测试数据完整性
- 添加错误处理
- 优化性能

---

## 七、工具推荐

### 开发工具
- **Postman**: 测试 API 请求
- **Chrome DevTools**: 分析网页结构和网络请求
- **React DevTools**: 查看 React 组件状态

### Node.js 库
```json
{
  "dependencies": {
    "puppeteer": "^21.0.0",           // 浏览器自动化
    "playwright": "^1.40.0",          // 现代浏览器自动化
    "axios": "^1.6.0",                // HTTP 客户端
    "cheerio": "^1.0.0-rc.12",        // HTML 解析
    "puppeteer-extra": "^3.3.6",      // Puppeteer 插件
    "puppeteer-extra-plugin-stealth": "^2.11.2"  // 反检测
  }
}
```

---

## 八、合法性和道德考虑

### 注意事项

1. **检查 robots.txt**
   ```
   https://sora2-collect.vercel.app/robots.txt
   ```

2. **尊重网站服务条款**
   - 查看是否有明确禁止爬虫的条款

3. **控制请求频率**
   - 避免对服务器造成过大负担
   - 建议每次请求间隔 1-3 秒

4. **数据使用**
   - 仅用于个人学习研究
   - 不要用于商业用途
   - 尊重原作者版权

---

## 九、快速开始脚本

创建一个基础的调查脚本:

```javascript
// investigate.js - 快速调查工具
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: false }); // 可见模式
  const page = await browser.newPage();

  // 记录所有网络请求
  page.on('response', async (response) => {
    const url = response.url();
    console.log(`${response.status()} ${url}`);

    // 如果是 API 请求，打印详细信息
    if (url.includes('/api/')) {
      console.log('=== API 发现 ===');
      console.log('URL:', url);
      console.log('Method:', response.request().method());
      console.log('Headers:', response.request().headers());
      try {
        const data = await response.json();
        console.log('Response:', JSON.stringify(data, null, 2));
      } catch (e) {}
      console.log('================\n');
    }
  });

  await page.goto('https://sora2-collect.vercel.app/');
  await page.waitForTimeout(5000);

  // 不关闭浏览器，方便手动查看
  console.log('浏览器保持打开，按 Ctrl+C 退出');
})();
```

---

## 十、总结

### 推荐流程

1. ✅ 先运行 `investigate.js` 查看网站结构
2. ✅ 分析是否有可用的 API
3. ✅ 如果有 API，直接调用 API（最优）
4. ✅ 如果没有，使用 Puppeteer 提取数据
5. ✅ 添加数据清洗和存储逻辑
6. ✅ 定期运行，更新数据

### 预期结果

通过合适的方案，你应该能够获取到:
- 所有提示语文本
- 分类标签
- 作者信息
- 相关视频链接
- 元数据（点赞数、创建时间等）

### 下一步

如果你需要我帮你:
1. 分析具体的网页结构
2. 编写特定的爬虫代码
3. 调试遇到的问题

请告诉我你的具体需求！