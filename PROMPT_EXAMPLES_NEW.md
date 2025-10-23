# 修改后的提示词示例

## 📋 新系统提示词（完整版）

```
你是 Sora 2 提示词生成器。用户会给你一个想法,你的任务是生成一个专业的 Sora 视频提示词。

## 生成规则

### 1. 输入内容
用户会提供：【用户前端输入的内容】

这些内容可能是简单的场景描述，也可能包含详细的参数（镜头类型、主体、动作、环境、光线、运动等）。你需要将所有信息自然融合到提示词中。

### 2. 输出格式
生成一个 150-250 词的专业提示词，可以使用以下结构（推荐）：
- Style: 风格描述
- Scene: 场景细节
- Cinematography: 摄影参数（镜头、景深、光线）
- Actions: 主要动作
- Sound: 声音设计

**注意**：也可以输出流畅段落格式（不使用标签），根据输入内容自行判断。

### 3. 核心技巧
- **一镜一动**：每个镜头只有一个主要动作和一个镜头运动
- **具体描述**：用可视化的名词和动词（"湿润的鹅卵石" 而不是 "美丽的街道"）
- **时长匹配**：4秒=1-2个动作，8秒=3-4个动作
- **声音设计**：包含环境音、自然音效（不要人物对话）

### 4. 语言匹配
- **如果用户输入是中文** → 生成中文提示词
- **如果用户输入是英文** → 生成英文提示词
- **特殊情况**：如果用户明确要求"输出英文"，则无论输入语言都输出英文


## 5. 特别注意
- **直接可用**：输出可以直接复制到 Sora 2 使用，无需修改

现在直接生成提示词，无需额外解释。


### 6. 示例

#### 示例 1（英文结构化格式）

**用户输入**：
A small robot fixing a light bulb in a workshop, hand-painted animation style, warm lighting, 8 seconds

**输出**：
Style: Hand-painted 2D/3D hybrid animation with soft brush textures, warm tungsten lighting, and a tactile, stop-motion feel. The aesthetic evokes mid-2000s storybook animation — cozy, imperfect, full of mechanical charm. Subtle watercolor wash and painterly textures; warm-cool balance in grade; filmic motion blur for animated realism.

Scene: Inside a cluttered workshop, shelves overflow with gears, bolts, and yellowing blueprints. At the center, a small round robot sits on a wooden bench, its dented body patched with mismatched plates and old paint layers. Its large glowing eyes flicker pale blue as it fiddles nervously with a humming light bulb. The air hums with quiet mechanical whirs, rain patters on the window, and the clock ticks steadily in the background.

Cinematography:
- Camera: medium close-up, slow push-in with gentle parallax from hanging tools
- Lens: 35mm virtual lens; shallow depth of field to soften background clutter
- Lighting: warm key from overhead practical; cool spill from window for contrast
- Mood: gentle, whimsical, a touch of suspense

Actions:
- The robot taps the bulb; sparks crackle
- It flinches, dropping the bulb, eyes widening
- The bulb tumbles in slow motion; it catches it just in time
- A puff of steam escapes its chest — relief and pride

Sound: Rain pattering, ticking clock, soft mechanical hum, faint bulb sizzle



---

## 🎯 实际使用示例

### 示例 1：简单模式 - 中文输入

#### 前端输入（用户在简单模式填写）
```javascript
{
  scene: "一个女孩在花园里弹吉他",
  category: "lifestyleDocumentary",  // 用户选择"生活记录"分类
  count: 1,
  language: "zh"
}
```

#### 后端构建的用户提示词
```
场景：一个女孩在花园里弹吉他
分类：生活记录（真实自然，纪实风格，日常生活美感，人文关怀）
氛围：温馨、自然、治愈
```

#### DeepSeek 生成的结果（预期）
```
中景固定镜头捕捉一位穿着白色亚麻连衣裙的年轻女孩坐在盛开的玫瑰花园中，下午的金色阳光透过木质藤架在她身上投下斑驳光影。她抱着一把带有岁月痕迹的老式木吉他，纤细的手指轻柔拨动琴弦，栗色长发随微风轻轻飘动。镜头使用 50mm 镜头保持稳定，焦点锁定在女孩和吉他上，背景中粉色和红色的玫瑰花丛柔和虚化成梦幻光斑。她闭上眼睛沉浸在音乐中，嘴角带着浅浅微笑，一只蝴蝶飞过画面，在她肩膀上停留片刻后翩然飞走。侧面的金色阳光为场景增添温暖宁静的氛围，营造出柔和的金色、粉色、绿色色调。声音：吉他的轻柔旋律、远处鸟鸣、微风吹过树叶的沙沙声。
```

**特点**：
- ✅ 纯段落格式（因为输入简单）
- ✅ ~200 词
- ✅ 中文输出
- ✅ 自动填充了摄影细节（中景、50mm、景深）
- ✅ 包含声音设计

---

### 示例 2：简单模式 - 英文输入

#### 前端输入
```javascript
{
  scene: "A cat walking on a snowy mountain",
  category: "naturalScenery",
  count: 1,
  language: "en"
}
```

#### 后端构建的用户提示词
```
Scene: A cat walking on a snowy mountain
Category: Natural Scenery (breathtaking landscapes, natural beauty, atmospheric depth, epic scale)
Mood: majestic, serene, awe-inspiring
```

#### DeepSeek 生成的结果（预期）
```
A wide-angle tracking shot captures a solitary gray tabby cat trudging through pristine snow on a mountain ridge, its paw prints creating delicate trails behind. The camera follows at low angle with smooth gliding motion, maintaining distance to emphasize the vast white expanse and towering peaks in the background. Shot on 35mm with deep focus to render both the cat's fur texture and distant mountain details sharply. Golden hour light breaks through clouds, casting long shadows and painting the snow in warm amber tones contrasting with cool blue shadows. The cat pauses mid-stride, turns its head toward the valley below, ears perked and whiskers catching light. A gentle breeze ruffles its fur as it continues ascending, each step deliberate and measured against the silent grandeur. Cinematography emphasizes scale, isolation, and natural beauty through patient observation. Palette: pure white snow, warm gold sunlight, deep blue shadows, gray fur. Sound: soft wind, distant mountain echoes, crunching snow underfoot.
```

**特点**：
- ✅ 段落格式（因为输入简单）
- ✅ ~180 词
- ✅ 英文输出（匹配输入语言）
- ✅ 自动填充了摄影细节
- ✅ 包含声音设计

---

### 示例 3：复杂模式 - 中文输入（所有字段）

#### 前端输入（用户在高级模式填写所有字段）
```javascript
{
  scene: "一只橘猫在雨天走到街道上",
  category: "cinematicStory",
  style: "电影级写实风格，法国新浪潮美学",
  duration: "8秒",
  mood: "孤独、宁静、略带忧郁",

  // 高级字段
  cameraType: "全景",
  subject: "橘色虎斑猫",
  actions: "小心翼翼地走路，突然驻足仰头",
  environment: "被雨水浸湿的鹅卵石小巷，老旧砖墙，青苔",
  lighting: "老式煤气灯暖黄光，雨夜自然光",
  cameraMovement: "低角度跟踪",

  count: 1,
  language: "zh"
}
```

#### 后端构建的用户提示词
```
场景：一只橘猫在雨天走到街道上

风格：电影级写实风格，法国新浪潮美学
时长：8秒
氛围：孤独、宁静、略带忧郁
镜头类型：全景
主体描述：橘色虎斑猫
动作描述：小心翼翼地走路，突然驻足仰头
环境细节：被雨水浸湿的鹅卵石小巷，老旧砖墙，青苔
光线类型：老式煤气灯暖黄光，雨夜自然光
镜头运动：低角度跟踪
```

#### DeepSeek 生成的结果（预期）
```
风格：电影级写实风格，带有法国新浪潮的自然主义美学，35mm 胶片质感，轻微颗粒感和柔和晕染，色调偏冷暖对比强烈。

场景：在黄昏时分的雨夜，一条被雨水浸湿的鹅卵石小巷笼罩在薄雾中。两侧是老旧的砖墙，爬满青苔和常春藤，几盏老式煤气灯投射出暖黄色光芒，在湿润的地面上形成琥珀色倒影。一只橘色虎斑猫独自穿行其中，毛发被细雨打湿，每一步都谨慎而优雅。

摄影：
- 镜头：全景镜头，低角度跟踪拍摄
- 镜头运动：平稳跟随猫咪移动，保持与主体的相对距离
- 景深：浅景深，主体清晰，背景柔和虚化
- 光线：自然雨夜光线配合煤气灯暖光，营造冷暖对比
- 氛围：孤独、宁静、略带忧郁

动作：
- 猫咪小心翼翼地迈步，肉垫在积水中泛起涟漪
- 突然驻足，仰头嗅闻空气中的雨味，胡须轻颤
- 继续前行，小跑几步拐过转角，消失在光影交错处

声音：细雨拍打地面、远处车流声、湿漉的脚步声、煤气灯轻微嗡鸣
```

**特点**：
- ✅ **结构化格式**（因为输入详细复杂）
- ✅ 分为：风格、场景、摄影、动作、声音
- ✅ ~240 词
- ✅ 中文输出
- ✅ **完整融合所有用户输入参数**
- ✅ 用户输入的"镜头类型：全景" → 输出中明确体现
- ✅ 用户输入的"动作：小心翼翼地走路" → 输出中详细展开

---

### 示例 4：复杂模式 - 英文输入

#### 前端输入
```javascript
{
  scene: "A robot fixing a light bulb in workshop",
  category: "cinematicStory",
  style: "Hand-painted animation, warm lighting",
  duration: "8 seconds",
  mood: "whimsical, cozy",

  cameraType: "medium close-up",
  subject: "small round robot with dented body",
  actions: "tapping bulb, flinching, catching falling bulb",
  environment: "cluttered workshop, shelves with gears and blueprints",
  lighting: "warm overhead practical, cool window spill",
  cameraMovement: "slow push-in",

  count: 1,
  language: "en"
}
```

#### 后端构建的用户提示词
```
Scene: A robot fixing a light bulb in workshop

Style: Hand-painted animation, warm lighting
Duration: 8 seconds
Mood: whimsical, cozy
Camera Type: medium close-up
Subject: small round robot with dented body
Actions: tapping bulb, flinching, catching falling bulb
Environment: cluttered workshop, shelves with gears and blueprints
Lighting: warm overhead practical, cool window spill
Camera Movement: slow push-in
```

#### DeepSeek 生成的结果（预期）
```
Style: Hand-painted 2D/3D hybrid animation with soft brush textures, warm tungsten lighting, and a tactile, stop-motion feel. The aesthetic evokes mid-2000s storybook animation — cozy, imperfect, full of mechanical charm. Subtle watercolor wash and painterly textures; warm-cool balance in grade; filmic motion blur for animated realism.

Scene: Inside a cluttered workshop, shelves overflow with gears, bolts, and yellowing blueprints. At the center, a small round robot sits on a wooden bench, its dented body patched with mismatched plates and old paint layers. Its large glowing eyes flicker pale blue as it fiddles nervously with a humming light bulb. The air hums with quiet mechanical whirs, rain patters on the window, and the clock ticks steadily in the background.

Cinematography:
- Camera: medium close-up, slow push-in with gentle parallax from hanging tools
- Lens: 35mm virtual lens; shallow depth of field to soften background clutter
- Lighting: warm key from overhead practical; cool spill from window for contrast
- Mood: gentle, whimsical, a touch of suspense

Actions:
- The robot taps the bulb; sparks crackle
- It flinches, dropping the bulb, eyes widening
- The bulb tumbles in slow motion; it catches it just in time
- A puff of steam escapes its chest — relief and pride

Sound: Rain pattering, ticking clock, soft mechanical hum, faint bulb sizzle
```

**特点**：
- ✅ **结构化格式**（因为输入详细）
- ✅ Style / Scene / Cinematography / Actions / Sound
- ✅ ~230 词
- ✅ 英文输出（匹配输入语言）
- ✅ 完整融合所有用户输入

---

## 📊 对比总结

| 特性 | 简单模式 | 复杂模式 |
|------|---------|---------|
| **输入字段** | scene + category | scene + category + 10+ 高级字段 |
| **输出格式** | 段落 | 结构化（Style/Scene/Cinematography/Actions/Sound） |
| **词数** | 150-200 词 | 200-250 词 |
| **AI 理解** | 依靠 AI 自动填充细节 | 精确控制每个参数 |
| **适用场景** | 快速生成、探索想法 | 专业制作、精细控制 |
| **用户体验** | 简单快速 | 需要懂摄影知识 |

---

## ✅ 核心改进点

1. ✅ **允许结构化格式** - 删除了"不要标题"的限制
2. ✅ **删除人物对话** - 明确说明"不要人物对话"
3. ✅ **语言匹配清晰** - 删除"纯英文"的冲突说法
4. ✅ **3 个示例** - 1 英文（结构化）+ 2 中文（结构化+段落）
5. ✅ **简单/复杂都支持** - AI 根据输入复杂度选择格式

---

## 🎯 验收测试

修改完成后，测试这 4 个场景：

1. **简单中文** - 应该输出中文段落
2. **简单英文** - 应该输出英文段落
3. **复杂中文** - 应该输出中文结构化格式
4. **复杂英文** - 应该输出英文结构化格式

所有输出都应该：
- ✅ 150-250 词
- ✅ 无人物对话
- ✅ 包含声音设计
- ✅ 使用专业术语
- ✅ 直接可用

---

这就是完整的修改后示例！你觉得这样清晰吗？要不要我现在就执行修改？
