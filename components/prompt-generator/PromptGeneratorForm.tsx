'use client';

import { useState } from 'react';
import {
  getAllCategories,
  getCategoryById,
  type PromptCategory,
  type GeneratedPrompt
} from '@/lib/prompt-generator';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

type Mode = 'simple' | 'advanced';

interface PromptGeneratorFormProps {
  onGenerated: (prompts: GeneratedPrompt[]) => void;
  loading?: boolean;
}

export default function PromptGeneratorForm({ onGenerated, loading: loadingProp = false }: PromptGeneratorFormProps) {
  const categories = getAllCategories();

  const [mode, setMode] = useState<Mode>('simple');
  const [selectedCategory, setSelectedCategory] = useState<PromptCategory>('cinematic');
  const [simpleIdea, setSimpleIdea] = useState('');
  const [advancedIdea, setAdvancedIdea] = useState('');
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [promptCount, setPromptCount] = useState(3);
  const [temperature, setTemperature] = useState(0.7);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const currentCategory = getCategoryById(selectedCategory);

  // 处理分类切换
  const handleCategoryChange = (categoryId: PromptCategory) => {
    setSelectedCategory(categoryId);
    setFormValues({});
    setError(null);
  };

  // 更新字段值
  const handleFieldChange = (fieldName: string, value: string) => {
    setFormValues(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  // 处理生成 - 使用批量 API
  const handleGenerate = async () => {
    if (!currentCategory) return;

    try {
      setLoading(true);
      setError(null);

      // 构建场景描述
      let scene = '';

      if (mode === 'simple') {
        // 简单模式：直接使用用户输入
        if (!simpleIdea.trim()) {
          setError('请输入您的创意描述');
          setLoading(false);
          return;
        }
        scene = simpleIdea.trim();
      } else {
        // 高级模式：组合创意描述 + 字段值
        if (!advancedIdea.trim()) {
          setError('请输入您的创意描述');
          setLoading(false);
          return;
        }

        const fieldValues: string[] = [advancedIdea.trim()];

        // 添加其他字段值
        Object.entries(formValues).forEach(([key, value]) => {
          if (value && value.trim()) {
            fieldValues.push(value.trim());
          }
        });

        scene = fieldValues.join(', ');
      }

      // 调用批量生成 API
      const response = await fetch('/api/prompt-generator/generate-batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scene,
          category: selectedCategory,
          count: promptCount,
          language: 'zh',
          temperature: temperature
        }),
      });

      if (!response.ok) {
        throw new Error(`API 请求失败: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || '生成失败');
      }

      // 返回生成的提示词
      onGenerated(data.data.prompts);
      setError(null);

      // 滚动到结果区域
      setTimeout(() => {
        const resultsSection = document.getElementById('results');
        if (resultsSection) {
          resultsSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);

    } catch (err: any) {
      console.error('Error generating prompts:', err);
      setError(err.message || '生成失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  if (!currentCategory) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Category Tabs */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
          选择风格
        </h3>
        <div className="flex flex-wrap gap-2 justify-center">
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? 'default' : 'outline'}
              onClick={() => handleCategoryChange(cat.id)}
              disabled={loading}
              className={`px-6 py-3 transition-all ${
                selectedCategory === cat.id
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/50 border-transparent scale-105 font-bold'
                  : 'hover:border-purple-300 hover:bg-purple-50'
              }`}
            >
              <span className="mr-2">{cat.icon}</span>
              {cat.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="flex justify-center mb-8">
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <Button
            variant="ghost"
            onClick={() => setMode('simple')}
            className={`px-6 py-2.5 rounded-md font-medium transition-all ${
              mode === 'simple'
                ? 'bg-gradient-to-r from-purple-700 to-indigo-700 text-white shadow-lg shadow-purple-500/50'
                : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            <i className="fas fa-bolt mr-2"></i>
            快速模式
          </Button>
          <Button
            variant="ghost"
            onClick={() => setMode('advanced')}
            className={`px-6 py-2.5 rounded-md font-medium transition-all ${
              mode === 'advanced'
                ? 'bg-gradient-to-r from-purple-700 to-indigo-700 text-white shadow-lg shadow-purple-500/50'
                : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            <i className="fas fa-sliders-h mr-2"></i>
            专业模式
          </Button>
        </div>
      </div>

      <Card className="shadow-lg">
        <CardHeader className="space-y-0 pb-4">
          <p className="text-gray-600">{currentCategory.description}</p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Simple Mode */}
          {mode === 'simple' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="simple-idea" className="text-sm font-medium text-gray-700 mb-3 block">
                  描述您的创意
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <Textarea
                  id="simple-idea"
                  placeholder="例如：一只橘猫在雨天的街道上行走，镜头缓缓推进..."
                  value={simpleIdea}
                  onChange={(e) => setSimpleIdea(e.target.value)}
                  rows={4}
                  className="resize-none"
                  disabled={loading}
                />
                <div className="flex items-center justify-between mt-2">
                  <p className="text-sm text-gray-500">
                    <i className="fas fa-lightbulb text-yellow-500 mr-1"></i>
                    AI 将自动配置最佳拍摄参数
                  </p>
                  <span className="text-sm text-gray-400">{simpleIdea.length} 字</span>
                </div>
              </div>
            </div>
          )}

          {/* Advanced Mode */}
          {mode === 'advanced' && (
            <div className="space-y-6">
              {/* 创意描述 */}
              <div>
                <Label htmlFor="advanced-idea" className="text-sm font-medium text-gray-700 mb-3 block">
                  创意描述
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <Textarea
                  id="advanced-idea"
                  placeholder="例如：一只橘猫在雨天的街道上行走，镜头缓缓推进..."
                  value={advancedIdea}
                  onChange={(e) => setAdvancedIdea(e.target.value)}
                  rows={4}
                  className="resize-none"
                  disabled={loading}
                />
                <p className="text-sm text-gray-500 mt-2">
                  <i className="fas fa-lightbulb text-yellow-500 mr-1"></i>
                  在专业模式下，您可以同时填写创意描述和详细参数
                </p>
              </div>

              {/* 详细参数 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="shotType" className="text-sm font-medium text-gray-700 mb-2 block">
                    镜头类型
                  </Label>
                  <Input
                    id="shotType"
                    list="shotTypeList"
                    type="text"
                    placeholder="选择或输入镜头类型..."
                    value={formValues.shotType || ''}
                    onChange={(e) => handleFieldChange('shotType', e.target.value)}
                    disabled={loading}
                  />
                  <datalist id="shotTypeList">
                    <option value="特写 (Close-up)" />
                    <option value="中景 (Medium shot)" />
                    <option value="远景 (Wide shot)" />
                    <option value="鸟瞰 (Aerial)" />
                    <option value="低角度 (Low angle)" />
                  </datalist>
                </div>

                <div>
                  <Label htmlFor="lighting" className="text-sm font-medium text-gray-700 mb-2 block">
                    光线
                  </Label>
                  <Input
                    id="lighting"
                    list="lightingList"
                    type="text"
                    placeholder="选择或输入光线效果..."
                    value={formValues.lighting || ''}
                    onChange={(e) => handleFieldChange('lighting', e.target.value)}
                    disabled={loading}
                  />
                  <datalist id="lightingList">
                    <option value="柔和自然光" />
                    <option value="戏剧性侧光" />
                    <option value="背光" />
                    <option value="霓虹灯" />
                    <option value="金色时光" />
                  </datalist>
                </div>

                <div>
                  <Label htmlFor="colorTone" className="text-sm font-medium text-gray-700 mb-2 block">
                    色调
                  </Label>
                  <Input
                    id="colorTone"
                    list="colorToneList"
                    type="text"
                    placeholder="选择或输入色调..."
                    value={formValues.colorTone || ''}
                    onChange={(e) => handleFieldChange('colorTone', e.target.value)}
                    disabled={loading}
                  />
                  <datalist id="colorToneList">
                    <option value="暖色调" />
                    <option value="冷色调" />
                    <option value="黑白" />
                    <option value="鲜艳" />
                    <option value="复古" />
                  </datalist>
                </div>

                <div>
                  <Label htmlFor="movement" className="text-sm font-medium text-gray-700 mb-2 block">
                    运动方式
                  </Label>
                  <Input
                    id="movement"
                    list="movementList"
                    type="text"
                    placeholder="选择或输入运动方式..."
                    value={formValues.movement || ''}
                    onChange={(e) => handleFieldChange('movement', e.target.value)}
                    disabled={loading}
                  />
                  <datalist id="movementList">
                    <option value="静止" />
                    <option value="缓慢平移" />
                    <option value="快速推进" />
                    <option value="旋转" />
                    <option value="跟随镜头" />
                  </datalist>
                </div>

                <div>
                  <Label htmlFor="time" className="text-sm font-medium text-gray-700 mb-2 block">
                    时间
                  </Label>
                  <Input
                    id="time"
                    list="timeList"
                    type="text"
                    placeholder="选择或输入时间..."
                    value={formValues.time || ''}
                    onChange={(e) => handleFieldChange('time', e.target.value)}
                    disabled={loading}
                  />
                  <datalist id="timeList">
                    <option value="黎明" />
                    <option value="正午" />
                    <option value="日落" />
                    <option value="夜晚" />
                    <option value="魔幻时刻" />
                  </datalist>
                </div>

                <div>
                  <Label htmlFor="weather" className="text-sm font-medium text-gray-700 mb-2 block">
                    天气
                  </Label>
                  <Input
                    id="weather"
                    list="weatherList"
                    type="text"
                    placeholder="选择或输入天气..."
                    value={formValues.weather || ''}
                    onChange={(e) => handleFieldChange('weather', e.target.value)}
                    disabled={loading}
                  />
                  <datalist id="weatherList">
                    <option value="晴天" />
                    <option value="阴天" />
                    <option value="雨天" />
                    <option value="雾天" />
                    <option value="雪天" />
                  </datalist>
                </div>
              </div>

              {/* Advanced Options Accordion */}
              <Accordion type="single" collapsible className="border border-gray-200 rounded-lg">
                <AccordionItem value="advanced" className="border-none">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-gray-50">
                    <span className="font-medium text-gray-700">
                      <i className="fas fa-cog mr-2"></i>高级选项
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4 pt-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="temperature" className="text-sm font-medium text-gray-700 mb-2 block">
                          温度 (创意度)
                        </Label>
                        <input
                          type="range"
                          id="temperature"
                          min="0"
                          max="100"
                          value={temperature * 100}
                          onChange={(e) => setTemperature(Number(e.target.value) / 100)}
                          className="w-full"
                          disabled={loading}
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>保守</span>
                          <span className="font-medium">{temperature.toFixed(1)}</span>
                          <span>创意</span>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="language" className="text-sm font-medium text-gray-700 mb-2 block">
                          语言
                        </Label>
                        <Input
                          id="language"
                          list="languageList"
                          type="text"
                          placeholder="选择语言..."
                          value={formValues.language || 'zh'}
                          onChange={(e) => handleFieldChange('language', e.target.value)}
                          disabled={loading}
                        />
                        <datalist id="languageList">
                          <option value="zh">中文</option>
                          <option value="en">English</option>
                        </datalist>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          )}

          {/* Prompt Count */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-3 block">
              生成数量
            </Label>
            <div className="flex gap-3">
              {[1, 3, 5].map((count) => (
                <Button
                  key={count}
                  variant="outline"
                  onClick={() => setPromptCount(count)}
                  disabled={loading}
                  className={`flex-1 px-6 py-3 transition-all ${
                    promptCount === count
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/50 border-transparent scale-105 font-bold'
                      : 'hover:border-purple-300 hover:bg-purple-50'
                  }`}
                >
                  {count} 个提示词
                </Button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription className="flex items-start gap-3">
                <i className="fas fa-exclamation-circle text-xl mt-0.5"></i>
                <div>
                  <h4 className="font-medium mb-1">生成失败</h4>
                  <p className="text-sm">{error}</p>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center">
            <Button
              onClick={handleGenerate}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-12 py-4 text-base shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin h-5 w-5 border-3 border-white border-t-transparent rounded-full mr-2"></div>
                  生成中...
                </>
              ) : (
                <>
                  <i className="fas fa-sparkles mr-2"></i>
                  生成提示词
                </>
              )}
            </Button>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center">
              <div className="inline-flex items-center gap-3 bg-purple-50 px-6 py-4 rounded-lg">
                <div className="animate-spin h-5 w-5 border-3 border-purple-600 border-t-transparent rounded-full"></div>
                <span className="text-purple-700 font-medium">AI 正在生成创意提示词...</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
