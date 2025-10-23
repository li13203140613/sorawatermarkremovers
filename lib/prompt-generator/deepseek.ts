/**
 * DeepSeek V3.2-Exp Sora 提示词生成器
 * 通过 SiliconFlow API 调用
 */

import https from 'https';

// API 配置
const API_KEY = process.env.SILICONFLOW_API_KEY;
const API_URL = 'api.siliconflow.cn';
const API_PATH = '/v1/chat/completions';
const MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-ai/DeepSeek-V3.2-Exp';

/**
 * 生成 Sora 提示词的输入参数
 */
export interface SoraPromptInput {
  scene: string;           // 场景描述
  style?: string;          // 风格（可选）
  duration?: string;       // 时长（可选）
  mood?: string;           // 氛围（可选）
  language?: 'en' | 'zh';  // 语言（可选，默认英文）
  temperature?: number;    // 温度（可选，默认0.8）- 用于控制多样性
}

/**
 * API 响应类型
 */
interface DeepSeekResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * 生成结果类型
 */
export interface GenerateResult {
  prompt: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  cost: {
    inputCost: number;
    outputCost: number;
    totalCost: number;
  };
}

/**
 * 调用 SiliconFlow DeepSeek API
 */
async function callDeepSeekAPI(
  messages: Array<{ role: string; content: string }>,
  maxTokens: number = 200,
  temperature: number = 0.8
): Promise<DeepSeekResponse> {
  return new Promise((resolve, reject) => {
    const requestBody = JSON.stringify({
      model: MODEL,
      messages,
      stream: false,
      max_tokens: maxTokens,
      temperature,
      top_p: 0.7,
      top_k: 50,
      frequency_penalty: 0.5,
      n: 1,
      response_format: {
        type: 'text'
      }
    });

    const options = {
      hostname: API_URL,
      path: API_PATH,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestBody)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const response = JSON.parse(data) as DeepSeekResponse;
            resolve(response);
          } catch (error) {
            reject(new Error(`Failed to parse response: ${error instanceof Error ? error.message : 'Unknown error'}`));
          }
        } else {
          reject(new Error(`API request failed (${res.statusCode}): ${data}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`Network request failed: ${error.message}`));
    });

    req.write(requestBody);
    req.end();
  });
}

/**
 * 生成 Sora 2 视频提示词
 */
export async function generateSoraPrompt(
  input: SoraPromptInput
): Promise<GenerateResult> {
  const language = input.language || 'zh';

  // 新的系统提示词 - 支持结构化格式
  const systemPrompt = `你是 Sora 2 提示词生成器。用户会给你一个想法,你的任务是生成一个专业的 Sora 视频提示词。

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

Sound: Rain pattering, ticking clock, soft mechanical hum, faint bulb sizzle`;

  // scene已经是完整的结构化prompt，直接使用
  let userPrompt = input.scene;

  // 只添加时长（如果有）
  if (input.duration) {
    userPrompt += `\n时长：${input.duration}`;
  }

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ];

  try {
    const temperature = input.temperature ?? 0.8; // 默认温度0.8

    // 🔍 日志：完整的DeepSeek API请求参数
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🤖 [DeepSeek API] 请求详情');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📤 完整Prompt:\n');
    console.log(userPrompt);
    console.log('\n🎛️ 参数:');
    console.log(`   模型: ${MODEL}`);
    console.log(`   温度: ${temperature}`);
    console.log(`   最大Token: 800`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const response = await callDeepSeekAPI(messages, 800, temperature);

    const prompt = response.choices[0].message.content;
    const usage = response.usage;

    // 成本计算 (¥12/M tokens)
    const pricePerMillion = 12; // CNY
    const inputCost = (usage.prompt_tokens / 1000000) * pricePerMillion;
    const outputCost = (usage.completion_tokens / 1000000) * pricePerMillion;
    const totalCost = inputCost + outputCost;

    // 📥 日志：收到的响应
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📥 [DeepSeek API] 收到响应');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 Token 使用情况:');
    console.log(`   输入: ${usage.prompt_tokens} tokens`);
    console.log(`   输出: ${usage.completion_tokens} tokens`);
    console.log(`   总计: ${usage.total_tokens} tokens`);
    console.log('\n💰 成本统计:');
    console.log(`   输入成本: ¥${inputCost.toFixed(6)} (${(inputCost * 100).toFixed(4)}分)`);
    console.log(`   输出成本: ¥${outputCost.toFixed(6)} (${(outputCost * 100).toFixed(4)}分)`);
    console.log(`   总成本: ¥${totalCost.toFixed(6)} (${(totalCost * 100).toFixed(4)}分)`);
    console.log('\n✨ 生成的提示词:');
    console.log(prompt);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    return {
      prompt,
      usage: {
        promptTokens: usage.prompt_tokens,
        completionTokens: usage.completion_tokens,
        totalTokens: usage.total_tokens
      },
      cost: {
        inputCost,
        outputCost,
        totalCost
      }
    };
  } catch (error) {
    // ❌ 日志：错误
    console.error('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ [DeepSeek API] 请求失败');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('错误信息:', error instanceof Error ? error.message : error);
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    throw new Error(
      `Failed to generate Sora prompt: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
