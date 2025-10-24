'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Film,
  Mountain,
  User,
  Package,
  Zap,
  Palette,
  Video,
  Minus,
  Plus,
  ChevronDown,
  AlertCircle
} from 'lucide-react';
import type { PromptCategory, GeneratedPrompt } from '@/lib/prompt-generator/types';
import { getAllCategories, getCategoryById } from '@/lib/prompt-generator';

const videoStyles: Array<{ id: PromptCategory; label: string; icon: any }> = [
  { id: 'cinematic', label: '电影叙事', icon: Film },
  { id: 'nature', label: '自然风光', icon: Mountain },
  { id: 'portrait', label: '人物肖像', icon: User },
  { id: 'product', label: '产品展示', icon: Package },
  { id: 'action', label: '动作运动', icon: Zap },
  { id: 'abstract', label: '抽象艺术', icon: Palette },
  { id: 'lifestyle', label: '生活记录', icon: Video },
];

type Mode = 'simple' | 'advanced';

interface PromptGeneratorV2Props {
  onGenerated: (prompts: GeneratedPrompt[]) => void;
  loading?: boolean;
}

export default function PromptGeneratorV2({ onGenerated, loading: externalLoading = false }: PromptGeneratorV2Props) {
  const [selectedStyle, setSelectedStyle] = useState<PromptCategory>('cinematic');
  const [mode, setMode] = useState<Mode>('simple');
  const [simpleIdea, setSimpleIdea] = useState('');
  const [advancedIdea, setAdvancedIdea] = useState('');
  const [promptCount, setPromptCount] = useState(3);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [temperature, setTemperature] = useState(0.7);
  const [formValues, setFormValues] = useState<Record<string, string>>({});

  const currentDescription = mode === 'simple' ? simpleIdea : advancedIdea;
  const setCurrentDescription = mode === 'simple' ? setSimpleIdea : setAdvancedIdea;
  const isLoading = loading || externalLoading;

  // 获取当前分类的字段配置
  const currentCategory = useMemo(() => getCategoryById(selectedStyle), [selectedStyle]);

  // 切换风格时清空表单
  useEffect(() => {
    setFormValues({});
    setError(null);
  }, [selectedStyle]);

  const handleGenerate = async () => {
    try {
      setLoading(true);
      setError(null);

      // 构建场景描述
      let scene = '';

      if (mode === 'simple') {
        // 简单模式：直接使用用户输入
        scene = simpleIdea.trim() || '生成一个创意视频';
      } else {
        // 高级模式：组合创意描述 + 字段值（带字段名称）
        const fieldValues: string[] = [];

        // 添加创意描述（如果有）
        if (advancedIdea.trim()) {
          fieldValues.push(advancedIdea.trim());
        }

        // 添加专业模式的字段值，带上字段标签
        Object.entries(formValues).forEach(([fieldName, value]) => {
          if (value && value.trim()) {
            const field = currentCategory?.fields.find(f => f.name === fieldName);
            if (field) {
              fieldValues.push(`${field.label}：${value.trim()}`);
            }
          }
        });

        scene = fieldValues.length > 0 ? fieldValues.join('\n') : '生成一个创意视频';
      }

      // 获取选中风格的中文名称
      const selectedStyleName = videoStyles.find(s => s.id === selectedStyle)?.label || '';

      // 调用批量生成 API
      const response = await fetch('/api/prompt-generator/generate-batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scene,
          category: selectedStyle,
          style: selectedStyleName,  // 传递中文风格名称
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

  return (
    <Card className="border-border/50 shadow-lg">
      <div className="space-y-8 p-6 md:p-8">
        {/* Mode Toggle - Tabs 组件 */}
        <div className="space-y-4">
          <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)}>
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 bg-gray-100 h-10 p-1 rounded-lg">
              <TabsTrigger
                value="simple"
                disabled={isLoading}
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md"
              >
                快速模式
              </TabsTrigger>
              <TabsTrigger
                value="advanced"
                disabled={isLoading}
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md"
              >
                专业模式
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Video Style Selection - 固定 4+3 布局 */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded border-2 border-blue-600 bg-blue-50">
              <Film className="h-3 w-3 text-blue-600" />
            </div>
            <Label className="text-base font-semibold">选择您的视频风格</Label>
          </div>
          {/* 第一行：前4个 */}
          <div className="grid grid-cols-4 gap-3">
            {videoStyles.slice(0, 4).map((style) => {
              const Icon = style.icon;
              return (
                <button
                  key={style.id}
                  onClick={() => setSelectedStyle(style.id)}
                  disabled={isLoading}
                  className={`group relative flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all hover:border-blue-300 hover:bg-blue-50/30 disabled:opacity-50 disabled:cursor-not-allowed ${
                    selectedStyle === style.id
                      ? 'border-blue-600 bg-blue-50/50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 transition-colors ${
                      selectedStyle === style.id
                        ? 'text-blue-600'
                        : 'text-gray-500 group-hover:text-gray-700'
                    }`}
                  />
                  <span
                    className={`text-sm font-medium transition-colors ${
                      selectedStyle === style.id
                        ? 'text-gray-900'
                        : 'text-gray-600 group-hover:text-gray-900'
                    }`}
                  >
                    {style.label}
                  </span>
                </button>
              );
            })}
          </div>
          {/* 第二行：后3个居中 */}
          <div className="grid grid-cols-3 gap-3 max-w-[75%] mx-auto">
            {videoStyles.slice(4).map((style) => {
              const Icon = style.icon;
              return (
                <button
                  key={style.id}
                  onClick={() => setSelectedStyle(style.id)}
                  disabled={isLoading}
                  className={`group relative flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all hover:border-blue-300 hover:bg-blue-50/30 disabled:opacity-50 disabled:cursor-not-allowed ${
                    selectedStyle === style.id
                      ? 'border-blue-600 bg-blue-50/50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 transition-colors ${
                      selectedStyle === style.id
                        ? 'text-blue-600'
                        : 'text-gray-500 group-hover:text-gray-700'
                    }`}
                  />
                  <span
                    className={`text-sm font-medium transition-colors ${
                      selectedStyle === style.id
                        ? 'text-gray-900'
                        : 'text-gray-600 group-hover:text-gray-900'
                    }`}
                  >
                    {style.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Description Input */}
        <div className="space-y-3">
          <Label htmlFor="description" className="text-base font-semibold">
            {mode === 'simple' ? '描述您的创意' : '创意描述'}
          </Label>
          <Textarea
            id="description"
            placeholder="例如：一只橘猫在雨天的街道上行走，镜头缓缓推进..."
            value={currentDescription}
            onChange={(e) => setCurrentDescription(e.target.value)}
            disabled={isLoading}
            className="min-h-[160px] resize-none bg-gray-50 text-base leading-relaxed border-gray-200"
          />
          <div className="flex justify-end">
            <span className="text-sm text-muted-foreground">
              {currentDescription.length} 字
            </span>
          </div>
        </div>

        {/* Advanced Mode Fields - Dynamic */}
        {mode === 'advanced' && currentCategory && (
          <div className="space-y-6">
            {/* Dynamic Fields Grid */}
            <div className="grid gap-4 grid-cols-3">
              {currentCategory.fields.map((field) => (
                <div key={field.name} className="space-y-2">
                  <Label htmlFor={field.name} className="text-sm font-medium">
                    {field.label}
                  </Label>

                  {field.type === 'select' && field.options ? (
                    <>
                      <Input
                        id={field.name}
                        list={`${field.name}List`}
                        type="text"
                        placeholder={field.placeholder || `选择或输入${field.label}...`}
                        value={formValues[field.name] || ''}
                        onChange={(e) => setFormValues(prev => ({ ...prev, [field.name]: e.target.value }))}
                        disabled={isLoading}
                        className="bg-gray-50 border-gray-200"
                      />
                      <datalist id={`${field.name}List`}>
                        {field.options.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </datalist>
                    </>
                  ) : field.type === 'textarea' ? (
                    <Textarea
                      id={field.name}
                      placeholder={field.placeholder || `请输入${field.label}...`}
                      value={formValues[field.name] || ''}
                      onChange={(e) => setFormValues(prev => ({ ...prev, [field.name]: e.target.value }))}
                      disabled={isLoading}
                      className="bg-gray-50 border-gray-200 min-h-[100px]"
                    />
                  ) : (
                    <Input
                      id={field.name}
                      type="text"
                      placeholder={field.placeholder || `选择或输入${field.label}...`}
                      value={formValues[field.name] || ''}
                      onChange={(e) => setFormValues(prev => ({ ...prev, [field.name]: e.target.value }))}
                      disabled={isLoading}
                      className="bg-gray-50 border-gray-200"
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Advanced Options Accordion */}
            <div className="space-y-3">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                disabled={isLoading}
                className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium transition-colors hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>高级选项</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    showAdvanced ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {showAdvanced && (
                <div className="space-y-4 rounded-lg border border-gray-200 bg-gray-50/50 p-4">
                  <div className="space-y-2">
                    <Label htmlFor="temperature" className="text-sm font-medium">
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
                      disabled={isLoading}
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>保守</span>
                      <span className="font-medium">{temperature.toFixed(1)}</span>
                      <span>创意</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Count Selector */}
        <div className="space-y-3">
          <Label className="text-base font-semibold text-center block">生成提示词数量</Label>
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPromptCount(Math.max(1, promptCount - 1))}
              disabled={isLoading || promptCount <= 1}
              className="h-10 w-10 rounded-lg border-gray-300 hover:bg-gray-100"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="text-3xl font-bold text-gray-900 min-w-[60px] text-center">{promptCount}</span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPromptCount(Math.min(5, promptCount + 1))}
              disabled={isLoading || promptCount >= 5}
              className="h-10 w-10 rounded-lg border-gray-300 hover:bg-gray-100"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Generate Button */}
        <Button
          onClick={handleGenerate}
          disabled={!currentDescription.trim() || isLoading}
          className="h-12 w-full text-base font-semibold bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50"
          size="lg"
        >
          {isLoading ? (
            <>
              <div className="animate-spin h-5 w-5 border-3 border-white border-t-transparent rounded-full mr-2"></div>
              生成中...
            </>
          ) : (
            '生成提示词'
          )}
        </Button>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center">
            <div className="inline-flex items-center gap-3 bg-blue-50 px-6 py-4 rounded-lg">
              <div className="animate-spin h-5 w-5 border-3 border-blue-600 border-t-transparent rounded-full"></div>
              <span className="text-blue-700 font-medium">AI 正在生成创意提示词...</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
