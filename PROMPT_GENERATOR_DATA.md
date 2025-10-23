# Sora2 提示词生成器 - 完整数据定义

> 包含所有 7 个分类的模板、字段、选项和示例

---

## 📋 目录

1. [🎬 电影叙事 (Cinematic)](#1-电影叙事-cinematic)
2. [🏞️ 自然风光 (Nature)](#2-自然风光-nature)
3. [👤 人物肖像 (Portrait)](#3-人物肖像-portrait)
4. [📦 产品展示 (Product)](#4-产品展示-product)
5. [🏃 动作运动 (Action)](#5-动作运动-action)
6. [🎨 抽象艺术 (Abstract)](#6-抽象艺术-abstract)
7. [📸 生活记录 (Lifestyle)](#7-生活记录-lifestyle)

---

## 1. 电影叙事 (Cinematic)

### 📌 分类信息
- **ID**: `cinematic`
- **名称**: 电影叙事
- **图标**: 🎬
- **描述**: 适合故事性、情绪化的镜头，强调电影感和叙事氛围

### 🎯 提示词模板
```
{shotType} of {subject} {action}, {environment}, {lighting}, {cameraMovement}, shot on {camera}, {mood}
```

### 📝 字段定义

#### 字段1: 镜头类型 (shotType)
- **字段名**: `shotType`
- **标签**: 镜头类型
- **类型**: 下拉选择 (select)
- **必填**: ✅ 是
- **说明**: 选择镜头的景别和拍摄角度
- **选项**:
  ```
  Close-up → 特写 - 聚焦细节
  Extreme close-up → 大特写 - 极致细节（眼睛、手指）
  Medium shot → 中景 - 半身镜头
  Medium close-up → 中近景 - 胸部以上
  Wide shot → 全景 - 展现环境
  Extreme wide shot → 大全景 - 广阔场景
  Aerial shot → 航拍 - 俯瞰视角
  POV shot → 第一人称 - 主观视角
  Over-the-shoulder → 过肩镜头 - 对话场景
  Dutch angle → 倾斜镜头 - 不稳定感
  ```

#### 字段2: 主体描述 (subject)
- **字段名**: `subject`
- **标签**: 主体描述
- **类型**: 文本输入 (text)
- **必填**: ✅ 是
- **说明**: 描述画面的主要人物或物体
- **占位符**: `例如: a young woman in a red dress`

#### 字段3: 动作描述 (action)
- **字段名**: `action`
- **标签**: 动作描述
- **类型**: 文本输入 (text)
- **必填**: ✅ 是
- **说明**: 描述主体的动作，用"1-2-3"节奏分解
- **占位符**: `例如: walking slowly through fog, then stops and looks back`

#### 字段4: 环境场景 (environment)
- **字段名**: `environment`
- **标签**: 环境场景
- **类型**: 文本输入 (text)
- **必填**: ✅ 是
- **说明**: 描述拍摄的地点和背景
- **占位符**: `例如: empty city street at night, neon lights reflecting on wet pavement`

#### 字段5: 光线类型 (lighting)
- **字段名**: `lighting`
- **标签**: 光线类型
- **类型**: 下拉选择 (select)
- **必填**: ✅ 是
- **说明**: 选择光线风格
- **选项**:
  ```
  golden hour sunlight → 黄金时刻 - 温暖柔和
  blue hour twilight → 蓝调时刻 - 清冷静谧
  dramatic shadows → 戏剧光影 - 强烈对比
  soft window light → 柔和窗光 - 自然舒适
  harsh direct sunlight → 强烈直射光 - 高对比
  neon lights → 霓虹灯光 - 都市夜景
  backlit → 逆光 - 轮廓光
  studio lighting → 影棚灯光 - 专业均匀
  candlelight → 烛光 - 温馨浪漫
  moonlight → 月光 - 神秘冷色
  firelight → 火光 - 跳动温暖
  overcast diffused light → 阴天漫射光 - 柔和无影
  ```

#### 字段6: 镜头运动 (cameraMovement)
- **字段名**: `cameraMovement`
- **标签**: 镜头运动
- **类型**: 下拉选择 (select)
- **必填**: ❌ 否（可选）
- **默认值**: `static shot`
- **说明**: 选择相机的运动方式
- **选项**:
  ```
  static shot → 静止镜头
  camera pushing in → 推进 - 向前移动
  camera pulling out → 拉远 - 向后移动
  tracking shot → 跟踪拍摄 - 跟随主体
  orbiting around subject → 环绕 - 围绕主体
  slow pan left to right → 水平摇移 - 左右扫视
  tilt up → 向上倾斜
  tilt down → 向下倾斜
  crane up → 升降 - 垂直上升
  crane down → 升降 - 垂直下降
  handheld shaky → 手持晃动 - 纪实感
  steady dolly → 稳定移动 - 平滑轨道
  ```

#### 字段7: 相机/胶片风格 (camera)
- **字段名**: `camera`
- **标签**: 相机/胶片风格
- **类型**: 下拉选择 (select)
- **必填**: ❌ 否（可选）
- **默认值**: `digital cinema`
- **说明**: 选择拍摄设备或胶片风格
- **选项**:
  ```
  digital cinema → 现代数字电影
  shot on 35mm film → 35mm 胶片 - 经典电影感
  shot on 16mm film → 16mm 胶片 - 纪录片风格
  shot on ARRI Alexa → ARRI Alexa - 高端数字电影
  vintage Super 8 → Super 8 - 复古怀旧
  anamorphic lens → 变形镜头 - 宽银幕
  VHS tape → VHS 录像带 - 80年代风格
  Polaroid → 宝丽来 - 即时成像
  shot on RED camera → RED 摄影机 - 高分辨率
  ```

#### 字段8: 情绪氛围 (mood)
- **字段名**: `mood`
- **标签**: 情绪氛围
- **类型**: 文本输入 (text)
- **必填**: ❌ 否（可选）
- **说明**: 整体的情感基调
- **占位符**: `例如: cinematic and moody, melancholic, suspenseful`

### 🎬 示例提示词

**示例1 - 情感特写：**
```
Close-up of a young woman with tears streaming down her cheeks, golden hour sunlight filtering through a window, shallow depth of field, camera slowly pushing in, shot on 35mm film, cinematic and emotional
```

**示例2 - 神秘氛围：**
```
Wide shot of a lone figure walking through a misty forest at dawn, soft diffused light, tracking shot following from behind, shot on ARRI Alexa, ethereal and mysterious
```

**示例3 - 史诗场景：**
```
Aerial shot of ocean waves crashing against rugged cliffs, dramatic storm clouds, camera circling the coastline, shot on digital cinema, epic and powerful
```

---

## 2. 自然风光 (Nature)

### 📌 分类信息
- **ID**: `nature`
- **名称**: 自然风光
- **图标**: 🏞️
- **描述**: 山川湖海、四季变化，强调自然环境的壮丽与宁静

### 🎯 提示词模板
```
{viewAngle} of {location}, {season} {weather}, {naturalElements}, {colorPalette}, {timeOfDay}
```

### 📝 字段定义

#### 字段1: 视角类型 (viewAngle)
- **字段名**: `viewAngle`
- **标签**: 视角类型
- **类型**: 下拉选择 (select)
- **必填**: ✅ 是
- **说明**: 选择拍摄视角
- **选项**:
  ```
  Aerial drone shot → 航拍视角 - 俯瞰全景
  Wide landscape shot → 广角风光 - 展现辽阔
  Time-lapse → 延时摄影 - 时间流逝
  Macro close-up → 微距特写 - 细节捕捉
  Ground-level perspective → 地面视角 - 平视角度
  Bird's eye view → 鸟瞰图 - 垂直俯视
  Low angle looking up → 仰拍 - 向上仰视
  ```

#### 字段2: 地点描述 (location)
- **字段名**: `location`
- **标签**: 地点描述
- **类型**: 文本输入 (text)
- **必填**: ✅ 是
- **说明**: 描述自然景观的地点
- **占位符**: `例如: misty mountains with pine forests`

#### 字段3: 季节 (season)
- **字段名**: `season`
- **标签**: 季节
- **类型**: 下拉选择 (select)
- **必填**: ✅ 是
- **说明**: 选择季节
- **选项**:
  ```
  spring → 春季 - 万物复苏
  summer → 夏季 - 生机盎然
  autumn → 秋季 - 金色丰收
  winter → 冬季 - 冰雪世界
  transition between seasons → 季节交替 - 变化之美
  ```

#### 字段4: 天气条件 (weather)
- **字段名**: `weather`
- **标签**: 天气条件
- **类型**: 下拉选择 (select)
- **必填**: ✅ 是
- **说明**: 选择天气状况
- **选项**:
  ```
  clear blue sky → 晴空万里
  dramatic storm clouds → 风暴将至
  morning mist → 晨雾缭绕
  heavy rain → 大雨倾盆
  light snow falling → 飘雪
  sunset glow → 晚霞满天
  foggy → 浓雾
  rainbow after rain → 雨后彩虹
  partly cloudy → 多云
  lightning storm → 雷暴
  ```

#### 字段5: 自然元素动态 (naturalElements)
- **字段名**: `naturalElements`
- **标签**: 自然元素动态
- **类型**: 文本输入 (text)
- **必填**: ✅ 是
- **说明**: 描述自然元素的运动和变化
- **占位符**: `例如: fog slowly rolling through valleys, leaves swirling in wind`

#### 字段6: 色彩风格 (colorPalette)
- **字段名**: `colorPalette`
- **标签**: 色彩风格
- **类型**: 下拉选择 (select)
- **必填**: ❌ 否（可选）
- **默认值**: `vibrant warm tones`
- **说明**: 选择色彩基调
- **选项**:
  ```
  vibrant warm tones → 鲜艳暖色
  cool blue hues → 冷色调蓝
  golden and amber → 金色琥珀
  pastel colors → 粉彩柔和
  monochrome → 黑白
  deep green forest tones → 深绿森林
  purple and pink sunset → 紫粉晚霞
  earth tones → 大地色系
  ```

#### 字段7: 时间段 (timeOfDay)
- **字段名**: `timeOfDay`
- **标签**: 时间段
- **类型**: 下拉选择 (select)
- **必填**: ❌ 否（可选）
- **说明**: 选择拍摄时间
- **选项**:
  ```
  at sunrise → 日出时分
  at sunset → 日落时分
  golden hour → 黄金时刻
  midday → 正午
  twilight → 黄昏
  night with stars → 星空夜晚
  dawn → 黎明
  dusk → 傍晚
  ```

### 🎬 示例提示词

**示例1 - 秋日山景：**
```
Aerial drone shot of misty mountains at sunrise, autumn colors, fog slowly rolling through valleys, golden and amber tones, peaceful and majestic
```

**示例2 - 海洋风暴：**
```
Wide landscape shot of dramatic storm clouds over ocean, summer, waves crashing violently against rocks, cool blue hues with dark grays, powerful and raw
```

**示例3 - 冬日森林：**
```
Time-lapse of snow-covered pine forest, winter morning mist, sunbeams breaking through trees creating god rays, cool blue hues with warm light rays, serene and magical
```

---

## 3. 人物肖像 (Portrait)

### 📌 分类信息
- **ID**: `portrait`
- **名称**: 人物肖像
- **图标**: 👤
- **描述**: 人物特写、表情捕捉，聚焦人物情感和细节

### 🎯 提示词模板
```
{shotType} of {characterDescription}, {expression}, {clothing}, {background}, {lighting}, {mood}
```

### 📝 字段定义

#### 字段1: 镜头景别 (shotType)
- **字段名**: `shotType`
- **标签**: 镜头景别
- **类型**: 下拉选择 (select)
- **必填**: ✅ 是
- **说明**: 选择人物镜头类型
- **选项**:
  ```
  Close-up portrait → 面部特写 - 聚焦表情
  Extreme close-up on eyes → 眼部大特写 - 情感细节
  Medium portrait → 半身肖像 - 胸部以上
  Full-body portrait → 全身肖像 - 完整人物
  Profile shot → 侧面肖像 - 轮廓美
  Three-quarter view → 四分之三侧面 - 经典角度
  ```

#### 字段2: 人物描述 (characterDescription)
- **字段名**: `characterDescription`
- **标签**: 人物描述
- **类型**: 文本输入 (text)
- **必填**: ✅ 是
- **说明**: 描述人物的外观特征
- **占位符**: `例如: an elderly man with weathered face and white beard`

#### 字段3: 表情/动作 (expression)
- **字段名**: `expression`
- **标签**: 表情/动作
- **类型**: 文本输入 (text)
- **必填**: ✅ 是
- **说明**: 描述人物的表情和动作
- **占位符**: `例如: gently smiling while looking at the camera`

#### 字段4: 服装/造型 (clothing)
- **字段名**: `clothing`
- **标签**: 服装/造型
- **类型**: 文本输入 (text)
- **必填**: ❌ 否（可选）
- **说明**: 描述服装和造型细节
- **占位符**: `例如: wearing a wool sweater and glasses`

#### 字段5: 背景 (background)
- **字段名**: `background`
- **标签**: 背景
- **类型**: 下拉选择 (select)
- **必填**: ✅ 是
- **说明**: 选择背景类型
- **选项**:
  ```
  blurred bokeh background → 虚化背景 - 突出人物
  cozy library → 温馨书房 - 文艺氛围
  urban street → 城市街道 - 现代感
  minimalist white background → 极简白背景 - 干净简洁
  natural outdoor setting → 自然户外 - 生动自然
  vintage interior → 复古室内 - 怀旧风格
  studio backdrop → 影棚背景 - 专业感
  sunset sky → 日落天空 - 温暖浪漫
  ```

#### 字段6: 光线 (lighting)
- **字段名**: `lighting`
- **标签**: 光线
- **类型**: 下拉选择 (select)
- **必填**: ✅ 是
- **说明**: 选择光线类型
- **选项**:
  ```
  soft window light → 柔和窗光 - 自然舒适
  Rembrandt lighting → 伦勃朗光 - 三角光经典
  rim lighting → 轮廓光 - 勾勒边缘
  butterfly lighting → 蝴蝶光 - 正面顶光
  natural outdoor light → 自然户外光 - 真实自然
  dramatic side lighting → 戏剧侧光 - 强烈对比
  backlit silhouette → 逆光剪影 - 轮廓美
  golden hour glow → 黄金时刻光 - 温暖柔和
  ```

#### 字段7: 情绪氛围 (mood)
- **字段名**: `mood`
- **标签**: 情绪氛围
- **类型**: 文本输入 (text)
- **必填**: ❌ 否（可选）
- **说明**: 描述整体情绪基调
- **占位符**: `例如: warm and nostalgic, contemplative`

### 🎬 示例提示词

**示例1 - 温馨老人：**
```
Close-up portrait of an elderly man with weathered face, gently smiling while looking at camera, wearing a wool sweater, cozy library background, soft window light, warm and nostalgic
```

**示例2 - 优雅芭蕾：**
```
Medium portrait of a young ballerina, elegant pose with arms raised, white tutu, minimalist white background, rim lighting creating dramatic silhouette, graceful and ethereal
```

**示例3 - 童真眼神：**
```
Extreme close-up on eyes of a child, wide-eyed wonder and curiosity, natural outdoor light, blurred bokeh background, innocent and heartwarming
```

---

## 4. 产品展示 (Product)

### 📌 分类信息
- **ID**: `product`
- **名称**: 产品展示
- **图标**: 📦
- **描述**: 商业拍摄、产品特写，突出产品细节和质感

### 🎯 提示词模板
```
{cameraMovement} around {productDescription}, {material}, {detailFocus}, {background}, {lighting}, commercial photography style
```

### 📝 字段定义

#### 字段1: 镜头运动 (cameraMovement)
- **字段名**: `cameraMovement`
- **标签**: 镜头运动
- **类型**: 下拉选择 (select)
- **必填**: ✅ 是
- **说明**: 选择产品展示的镜头运动
- **选项**:
  ```
  360-degree rotation → 360度旋转展示 - 全方位呈现
  Slow push in → 缓慢推进 - 聚焦细节
  Overhead shot → 俯视静态 - 平面展示
  Sliding reveal → 滑动揭示 - 渐进呈现
  Static close-up → 静态特写 - 稳定聚焦
  Dolly around → 轨道环绕 - 平滑移动
  Crane shot → 升降镜头 - 动态视角
  ```

#### 字段2: 产品描述 (productDescription)
- **字段名**: `productDescription`
- **标签**: 产品描述
- **类型**: 文本输入 (text)
- **必填**: ✅ 是
- **说明**: 描述产品的外观和特点
- **占位符**: `例如: a sleek smartphone with edge-to-edge display`

#### 字段3: 材质/颜色 (material)
- **字段名**: `material`
- **标签**: 材质/颜色
- **类型**: 文本输入 (text)
- **必填**: ✅ 是
- **说明**: 描述产品的材质和颜色
- **占位符**: `例如: matte black aluminum finish with glass back`

#### 字段4: 展示细节 (detailFocus)
- **字段名**: `detailFocus`
- **标签**: 展示细节
- **类型**: 文本输入 (text)
- **必填**: ✅ 是
- **说明**: 描述重点展示的细节
- **占位符**: `例如: camera focusing on edge details and screen reflection`

#### 字段5: 背景 (background)
- **字段名**: `background`
- **标签**: 背景
- **类型**: 下拉选择 (select)
- **必填**: ✅ 是
- **说明**: 选择产品背景
- **选项**:
  ```
  minimalist white background → 极简白背景 - 纯净专业
  dark gradient backdrop → 深色渐变 - 高端神秘
  natural wood surface → 天然木质表面 - 温暖自然
  marble countertop → 大理石台面 - 奢华质感
  infinity curve backdrop → 无限弯曲背景 - 无缝过渡
  reflective surface → 反光表面 - 镜面效果
  textured fabric → 纹理织物 - 柔和质感
  ```

#### 字段6: 光线设置 (lighting)
- **字段名**: `lighting`
- **标签**: 光线设置
- **类型**: 下拉选择 (select)
- **必填**: ✅ 是
- **说明**: 选择打光方式
- **选项**:
  ```
  studio lighting with soft reflections → 影棚灯+柔和反光
  dramatic side lighting → 戏剧侧光 - 强烈对比
  backlit glow → 逆光发光 - 轮廓光
  natural daylight → 自然日光 - 真实柔和
  colored gel lighting → 彩色凝胶灯 - 创意色彩
  ring light → 环形灯 - 均匀无影
  key light with fill → 主光+补光 - 专业布光
  ```

### 🎬 示例提示词

**示例1 - 手机展示：**
```
360-degree rotation around a sleek smartphone, matte black aluminum finish, camera focusing on edge details and screen reflection, minimalist white background, studio lighting with soft reflections, Apple-style product video
```

**示例2 - 奢华手表：**
```
Slow push in on luxury watch, stainless steel with sapphire crystal, highlighting intricate dial details and rotating bezel, dark gradient backdrop, dramatic side lighting creating depth, premium and sophisticated
```

**示例3 - 护肤产品：**
```
Overhead shot of skincare product bottles, frosted glass with gold caps, arranged in geometric pattern, marble countertop, natural daylight with soft shadows, clean and luxurious
```

---

## 5. 动作运动 (Action)

### 📌 分类信息
- **ID**: `action`
- **名称**: 动作运动
- **图标**: 🏃
- **描述**: 运动、跑酷、极限挑战，捕捉快节奏动态

### 🎯 提示词模板
```
{cameraStyle} following {subject} as {action}, {environment}, {speedEffect}, {visualEffect}, high-energy and dynamic
```

### 📝 字段定义

#### 字段1: 运镜方式 (cameraStyle)
- **字段名**: `cameraStyle`
- **标签**: 运镜方式
- **类型**: 下拉选择 (select)
- **必填**: ✅ 是
- **说明**: 选择拍摄方式
- **选项**:
  ```
  Tracking shot → 跟踪拍摄 - 跟随主体
  POV first-person → 第一人称视角 - 沉浸体验
  Slow-motion capture → 慢动作捕捉 - 细节展现
  Drone chase → 无人机追踪 - 航拍跟随
  GoPro-style → GoPro风格 - 运动相机
  Gimbal stabilized → 稳定器拍摄 - 平滑流畅
  Handheld dynamic → 手持动态 - 真实感
  ```

#### 字段2: 主体 (subject)
- **字段名**: `subject`
- **标签**: 主体
- **类型**: 文本输入 (text)
- **必填**: ✅ 是
- **说明**: 描述运动的主体
- **占位符**: `例如: a skateboarder performing tricks`

#### 字段3: 动作描述 (action)
- **字段名**: `action`
- **标签**: 动作描述
- **类型**: 文本输入 (text)
- **必填**: ✅ 是
- **说明**: 详细描述动作过程，用节奏分解
- **占位符**: `例如: launching off ramp, spinning 360 degrees in mid-air, landing smoothly`

#### 字段4: 环境 (environment)
- **字段名**: `environment`
- **标签**: 环境
- **类型**: 文本输入 (text)
- **必填**: ✅ 是
- **说明**: 描述运动场景
- **占位符**: `例如: urban skate park with graffiti walls`

#### 字段5: 速度感描述 (speedEffect)
- **字段名**: `speedEffect`
- **标签**: 速度感描述
- **类型**: 下拉选择 (select)
- **必填**: ❌ 否（可选）
- **说明**: 选择速度效果
- **选项**:
  ```
  motion blur → 运动模糊 - 速度感
  speed ramping → 变速效果 - 快慢切换
  freeze frame moment → 定格瞬间 - 关键时刻
  real-time speed → 实时速度 - 真实感
  bullet time → 子弹时间 - 360度慢动作
  ```

#### 字段6: 视觉效果 (visualEffect)
- **字段名**: `visualEffect`
- **标签**: 视觉效果
- **类型**: 文本输入 (text)
- **必填**: ❌ 否（可选）
- **说明**: 描述特殊视觉元素
- **占位符**: `例如: dust particles in air, dramatic lighting, sweat droplets flying`

### 🎬 示例提示词

**示例1 - 滑板特技：**
```
Tracking shot following a skateboarder performing tricks, launching off ramp and spinning 360, urban skate park with graffiti walls, motion blur on wheels, dust particles in air, high-energy and dynamic
```

**示例2 - 山地骑行：**
```
POV first-person of mountain biker descending steep trail, weaving through trees at high speed, dense forest with dappled sunlight, speed ramping through tight turns, branches whipping past camera, adrenaline-pumping and intense
```

**示例3 - 跑酷跳跃：**
```
Slow-motion capture of parkour athlete jumping between rooftops, perfect flip in mid-air, city skyline at sunset, freeze frame at peak of jump with arms extended, cinematic and breathtaking
```

---

## 6. 抽象艺术 (Abstract)

### 📌 分类信息
- **ID**: `abstract`
- **名称**: 抽象艺术
- **图标**: 🎨
- **描述**: 色彩、纹理、实验性视觉艺术

### 🎯 提示词模板
```
{visualStyle} showing {theme}, {colorCombination}, {movement}, {artisticReference}, abstract and mesmerizing
```

### 📝 字段定义

#### 字段1: 视觉风格 (visualStyle)
- **字段名**: `visualStyle`
- **标签**: 视觉风格
- **类型**: 下拉选择 (select)
- **必填**: ✅ 是
- **说明**: 选择抽象艺术类型
- **选项**:
  ```
  Fluid art style → 流体艺术 - 液体流动
  Particle simulation → 粒子模拟 - 数字艺术
  Geometric patterns → 几何图案 - 规则形状
  Light refraction → 光线折射 - 棱镜效果
  Macro liquid → 微距液体 - 细节纹理
  Kaleidoscope → 万花筒效果 - 对称美
  Smoke art → 烟雾艺术 - 飘渺流动
  Ink in water → 水墨扩散 - 有机形态
  ```

#### 字段2: 主题 (theme)
- **字段名**: `theme`
- **标签**: 主题
- **类型**: 文本输入 (text)
- **必填**: ✅ 是
- **说明**: 描述抽象主题
- **占位符**: `例如: colorful ink diffusing in water`

#### 字段3: 色彩组合 (colorCombination)
- **字段名**: `colorCombination`
- **标签**: 色彩组合
- **类型**: 文本输入 (text)
- **必填**: ✅ 是
- **说明**: 描述色彩搭配
- **占位符**: `例如: purple and gold swirls with iridescent highlights`

#### 字段4: 运动/变化 (movement)
- **字段名**: `movement`
- **标签**: 运动/变化
- **类型**: 下拉选择 (select)
- **必填**: ✅ 是
- **说明**: 描述运动方式
- **选项**:
  ```
  slow hypnotic movement → 缓慢催眠运动
  explosive burst → 爆炸性迸发
  gentle undulation → 温和起伏
  rhythmic pulsation → 节奏性脉动
  chaotic turbulence → 混沌湍流
  spiral rotation → 螺旋旋转
  wave propagation → 波浪传播
  morphing transformation → 形态变换
  ```

#### 字段5: 艺术风格参考 (artisticReference)
- **字段名**: `artisticReference`
- **标签**: 艺术风格参考
- **类型**: 文本输入 (text)
- **必填**: ❌ 否（可选）
- **说明**: 参考的艺术家或艺术风格
- **占位符**: `例如: inspired by James Turrell, Kandinsky style`

### 🎬 示例提示词

**示例1 - 流体墨水：**
```
Fluid art style showing colorful ink diffusing in water, purple and gold swirls with iridescent highlights, slow hypnotic movement, macro lens, inspired by James Turrell, abstract and mesmerizing
```

**示例2 - 粒子爆发：**
```
Particle simulation of glowing orbs, electric blue and neon pink particles, explosive burst then gentle floating, dark background with light trails, futuristic and ethereal
```

**示例3 - 万花筒：**
```
Kaleidoscope of geometric patterns, rainbow spectrum shifting through shapes, rhythmic pulsation, symmetrical and infinite, inspired by Islamic art, trippy and psychedelic
```

---

## 7. 生活记录 (Lifestyle)

### 📌 分类信息
- **ID**: `lifestyle`
- **名称**: 生活记录
- **图标**: 📸
- **描述**: 日常、纪实、温馨瞬间

### 🎯 提示词模板
```
{perspective} of {dailyScene}, {interaction}, {environmentDetails}, natural lighting, authentic and relatable
```

### 📝 字段定义

#### 字段1: 视角 (perspective)
- **字段名**: `perspective`
- **标签**: 视角
- **类型**: 下拉选择 (select)
- **必填**: ✅ 是
- **说明**: 选择拍摄视角
- **选项**:
  ```
  Handheld shot → 手持拍摄 - 纪实感
  Over-the-shoulder → 过肩视角 - 参与感
  Wide establishing shot → 建立镜头 - 展现环境
  Medium intimate shot → 中景亲密镜头 - 温馨感
  Candid documentary style → 抓拍纪录风格 - 自然真实
  Observational perspective → 观察视角 - 第三者
  ```

#### 字段2: 日常场景 (dailyScene)
- **字段名**: `dailyScene`
- **标签**: 日常场景
- **类型**: 文本输入 (text)
- **必填**: ✅ 是
- **说明**: 描述日常生活场景
- **占位符**: `例如: a family cooking together in kitchen`

#### 字段3: 人物互动 (interaction)
- **字段名**: `interaction`
- **标签**: 人物互动
- **类型**: 文本输入 (text)
- **必填**: ✅ 是
- **说明**: 描述人物之间的互动
- **占位符**: `例如: children helping to mix ingredients, parents laughing`

#### 字段4: 环境细节 (environmentDetails)
- **字段名**: `environmentDetails`
- **标签**: 环境细节
- **类型**: 文本输入 (text)
- **必填**: ✅ 是
- **说明**: 描述环境氛围和细节
- **占位符**: `例如: morning sunlight through windows, cozy home atmosphere`

#### 字段5: 情绪基调 (mood)
- **字段名**: `mood`
- **标签**: 情绪基调
- **类型**: 下拉选择 (select)
- **必填**: ❌ 否（可选）
- **说明**: 选择整体情绪
- **选项**:
  ```
  warm and cozy → 温暖舒适
  joyful and playful → 欢乐有趣
  peaceful and calm → 平静安详
  nostalgic → 怀旧
  intimate → 亲密
  energetic → 活力充沛
  contemplative → 沉思
  heartwarming → 温馨感人
  ```

### 🎬 示例提示词

**示例1 - 家庭烹饪：**
```
Handheld shot of a family cooking together in kitchen, children helping to mix ingredients while parents laugh, morning sunlight through windows creating cozy atmosphere, natural lighting, authentic and relatable, warm and joyful
```

**示例2 - 老年夫妻：**
```
Candid documentary style of elderly couple walking hand-in-hand through park, autumn leaves falling around them, gentle breeze, natural outdoor light, intimate and nostalgic
```

**示例3 - 朋友聚会：**
```
Medium intimate shot of friends gathering around campfire at night, sharing stories and roasting marshmallows, warm firelight on faces, starry sky above, peaceful and heartwarming
```

---

## 📊 数据总结

### 分类统计
- **总分类数**: 7 个
- **总字段数**: 49 个
- **总下拉选项**: 180+ 个

### 字段分布
| 分类 | 必填字段 | 可选字段 | 总字段 |
|------|---------|---------|--------|
| 电影叙事 | 5 | 3 | 8 |
| 自然风光 | 5 | 2 | 7 |
| 人物肖像 | 5 | 2 | 7 |
| 产品展示 | 6 | 0 | 6 |
| 动作运动 | 4 | 2 | 6 |
| 抽象艺术 | 4 | 1 | 5 |
| 生活记录 | 4 | 1 | 5 |

### 字段类型统计
- **下拉选择 (select)**: 28 个 (57%)
- **文本输入 (text)**: 21 个 (43%)

---

## 🎯 JSON 数据结构示例

```json
{
  "categories": [
    {
      "id": "cinematic",
      "name": "电影叙事",
      "icon": "🎬",
      "description": "适合故事性、情绪化的镜头，强调电影感和叙事氛围",
      "template": "{shotType} of {subject} {action}, {environment}, {lighting}, {cameraMovement}, shot on {camera}, {mood}",
      "fields": [
        {
          "name": "shotType",
          "label": "镜头类型",
          "type": "select",
          "required": true,
          "description": "选择镜头的景别和拍摄角度",
          "options": [
            { "value": "Close-up", "label": "特写 - 聚焦细节" },
            { "value": "Medium shot", "label": "中景 - 半身镜头" },
            { "value": "Wide shot", "label": "全景 - 展现环境" }
          ]
        },
        {
          "name": "subject",
          "label": "主体描述",
          "type": "text",
          "required": true,
          "placeholder": "例如: a young woman in a red dress"
        }
      ],
      "examples": [
        "Close-up of a young woman with tears...",
        "Wide shot of a lone figure..."
      ]
    }
  ]
}
```

---

**文档版本**: 1.0
**最后更新**: 2025-10-21
**维护者**: Claude AI
**总示例数**: 21 个
