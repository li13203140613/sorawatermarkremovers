'use client';

import { useState } from 'react';
import {
  getAllCategories,
  getCategoryById,
  type PromptCategory,
  type GeneratedPrompt
} from '@/lib/prompt-generator';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';

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
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [promptCount, setPromptCount] = useState(3);
  const [outputLanguage, setOutputLanguage] = useState('zh'); // 输出语言选择
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const currentCategory = getCategoryById(selectedCategory);

  // 处理分类切换
  const handleCategoryChange = (categoryId: PromptCategory) => {
    setSelectedCategory(categoryId);
    setFormValues({}); // 重置表单值
    setError(null);
  };

  // 更新字段值
  const handleFieldChange = (fieldName: string, value: string) => {
    setFormValues(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  // 处理生成 - 使用新的批量 API
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
        // 需求1: 简单模式也要包含分类信息
        scene = `分类：${currentCategory.name}\n描述：${simpleIdea.trim()}`;
      } else {
        // 高级模式：组合所有字段值
        const fieldValues: string[] = [];

        // 需求1: 添加分类信息
        fieldValues.push(`分类：${currentCategory.name}`);

        // 需求2: 添加创意描述（如果有填写）
        if (simpleIdea.trim()) {
          fieldValues.push(`创意描述：${simpleIdea.trim()}`);
        }

        currentCategory.fields.forEach(field => {
          const value = formValues[field.name];
          if (value && value.trim()) {
            fieldValues.push(`${field.label}：${value}`);
          }
        });

        // 验证：至少要有分类+创意描述，或者分类+其他字段
        if (fieldValues.length === 1) {
          setError('请填写创意描述或至少一个字段参数');
          setLoading(false);
          return;
        }

        scene = fieldValues.join('\n');
      }

      // 调用新的批量生成 API
      const response = await fetch('/api/prompt-generator/generate-batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scene,
          category: selectedCategory,
          count: promptCount,
          language: outputLanguage // 需求3: 使用用户选择的输出语言
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

  // 重置表单
  const handleReset = () => {
    setSimpleIdea('');
    setFormValues({});
    setError(null);
  };

  if (!currentCategory) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl overflow-visible">
      {/* Category Tabs */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2 justify-center">
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? 'default' : 'outline'}
              onClick={() => handleCategoryChange(cat.id)}
              disabled={loading}
            >
              {cat.icon} {cat.name}
            </Button>
          ))}
        </div>
      </div>

      <Card className="p-6 overflow-visible">
        {/* Mode Toggle */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold mb-1">AI 提示词生成器</h2>
            <p className="text-sm text-muted-foreground">
              {currentCategory.description}
            </p>
          </div>
          <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)}>
            <TabsList>
              <TabsTrigger value="simple">简单模式</TabsTrigger>
              <TabsTrigger value="advanced">高级模式</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Simple Mode */}
        {mode === 'simple' && (
          <div className="mb-6">
            <Label htmlFor="simple-idea" className="mb-2 block">
              输入您的创意描述 <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="simple-idea"
              placeholder={`例如: 一只橘猫在雨天走到街道上`}
              value={simpleIdea}
              onChange={(e) => setSimpleIdea(e.target.value)}
              rows={3}
              className="resize-none"
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground mt-2">
              在简单模式下，系统会自动为您配置最佳的拍摄参数
            </p>
          </div>
        )}

        {/* Advanced Mode - All Fields */}
        {mode === 'advanced' && (
          <div className="space-y-4 mb-6 overflow-visible">
            {/* 需求2: 高级模式添加创意描述字段 */}
            <div className="mb-4">
              <Label htmlFor="advanced-idea" className="mb-2 block">
                创意描述 <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="advanced-idea"
                placeholder="例如: 一只橘猫在雨天走到街道上"
                value={simpleIdea}
                onChange={(e) => setSimpleIdea(e.target.value)}
                rows={3}
                className="resize-none"
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground mt-2">
                描述您的核心创意，下方的高级参数会帮助完善细节
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-visible">
              {currentCategory.fields.map((field) => (
                <div key={field.name}>
                  <Label htmlFor={field.name} className="mb-2 block">
                    {field.label}
                    {field.required && <span className="text-destructive ml-1">*</span>}
                  </Label>

                  {/* Text Input */}
                  {field.type === 'text' && (
                    <Input
                      id={field.name}
                      placeholder={field.placeholder}
                      value={formValues[field.name] || ''}
                      onChange={(e) => handleFieldChange(field.name, e.target.value)}
                      disabled={loading}
                    />
                  )}

                  {/* Textarea */}
                  {field.type === 'textarea' && (
                    <Textarea
                      id={field.name}
                      placeholder={field.placeholder}
                      value={formValues[field.name] || ''}
                      onChange={(e) => handleFieldChange(field.name, e.target.value)}
                      rows={3}
                      className="resize-none"
                      disabled={loading}
                    />
                  )}

                  {/* Select Dropdown */}
                  {field.type === 'select' && field.options && (
                    <Select
                      value={formValues[field.name] || field.defaultValue || ''}
                      onValueChange={(value) => handleFieldChange(field.name, value)}
                      disabled={loading}
                    >
                      <SelectTrigger id={field.name}>
                        <SelectValue placeholder={`选择${field.label}...`} />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {/* Field Description */}
                  {field.description && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {field.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Generation Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Prompt Count */}
          <div>
            <Label htmlFor="count" className="mb-2 block">
              生成提示词数量
            </Label>
            <Select
              value={String(promptCount)}
              onValueChange={(v) => setPromptCount(Number(v))}
              disabled={loading}
            >
              <SelectTrigger id="count">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 个提示词</SelectItem>
                <SelectItem value="3">3 个提示词</SelectItem>
                <SelectItem value="5">5 个提示词</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 需求3: 输出语言选择（仅高级模式显示） */}
          {mode === 'advanced' && (
            <div>
              <Label htmlFor="language" className="mb-2 block">
                输出语言
              </Label>
              <Select
                value={outputLanguage}
                onValueChange={setOutputLanguage}
                disabled={loading}
              >
                <SelectTrigger id="language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="zh">中文</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                选择生成提示词的语言
              </p>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={handleGenerate}
            size="lg"
            className="flex-1"
            disabled={loading}
          >
            {loading ? '生成中...' : '生成提示词'}
          </Button>
          <Button
            onClick={handleReset}
            variant="outline"
            size="lg"
            className="px-8"
            disabled={loading}
          >
            重置
          </Button>
        </div>
      </Card>
    </div>
  );
}
