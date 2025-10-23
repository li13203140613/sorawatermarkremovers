'use client';

import { useState } from 'react';
import {
  getAllCategories,
  getCategoryById,
  validateForm,
  getFieldDisplayName,
  type PromptCategory,
  type CategoryConfig,
} from '@/lib/prompt-generator';

interface PromptGeneratorFormProps {
  onSubmit: (category: PromptCategory, values: Record<string, string>, promptCount: number) => void;
  loading?: boolean;
}

export default function PromptGeneratorForm({ onSubmit, loading = false }: PromptGeneratorFormProps) {
  const categories = getAllCategories();

  const [selectedCategory, setSelectedCategory] = useState<PromptCategory>('cinematic');
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [promptCount, setPromptCount] = useState<number>(3);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const currentCategory = getCategoryById(selectedCategory);

  // 处理分类切换
  const handleCategoryChange = (categoryId: PromptCategory) => {
    setSelectedCategory(categoryId);
    setFormValues({}); // 清空表单
    setErrors({}); // 清空错误
  };

  // 处理字段值变化
  const handleFieldChange = (fieldName: string, value: string) => {
    setFormValues(prev => ({
      ...prev,
      [fieldName]: value,
    }));
    // 清除该字段的错误
    if (errors[fieldName]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  // 处理表单提交
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentCategory) return;

    // 验证表单
    const validation = validateForm(currentCategory, formValues);

    if (!validation.valid) {
      setErrors(validation.errors);
      // 滚动到第一个错误字段
      const firstError = Object.keys(validation.errors)[0];
      const element = document.getElementById(`field-${firstError}`);
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // 提交表单
    onSubmit(selectedCategory, formValues, promptCount);
  };

  // 重置表单
  const handleReset = () => {
    setFormValues({});
    setErrors({});
  };

  if (!currentCategory) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <form onSubmit={handleSubmit}>
        {/* Tab 导航 */}
        <div className="mb-8">
          <div className="flex overflow-x-auto pb-2 gap-2 border-b-2 border-gray-200">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryChange(cat.id as PromptCategory)}
                className={`
                  flex items-center gap-2 px-6 py-3 rounded-t-lg whitespace-nowrap
                  transition-all font-medium
                  ${selectedCategory === cat.id
                    ? 'bg-green-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
                disabled={loading}
              >
                <span className="text-xl">{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 分类说明 */}
        <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
          <p className="text-sm text-gray-700">{currentCategory.description}</p>
        </div>

        {/* 生成数量选择 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            生成风格
          </label>
          <select
            value={promptCount}
            onChange={(e) => setPromptCount(Number(e.target.value))}
            className="w-full md:w-64 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
            disabled={loading}
          >
            <option value={1}>1个提示词</option>
            <option value={2}>2个提示词</option>
            <option value={3}>3个提示词</option>
          </select>
          <p className="mt-1 text-xs text-gray-500">
            选择要生成的提示词数量，系统会自动生成变体
          </p>
        </div>

        {/* 字段表单 - 3列布局 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {currentCategory.fields.map((field) => (
            <div key={field.name} id={`field-${field.name}`}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {getFieldDisplayName(field)}
              </label>

              {field.description && (
                <p className="text-xs text-gray-500 mb-2">{field.description}</p>
              )}

              {field.type === 'select' ? (
                <select
                  value={formValues[field.name] || field.defaultValue || ''}
                  onChange={(e) => handleFieldChange(field.name, e.target.value)}
                  className={`
                    w-full p-3 border rounded-md
                    focus:ring-2 focus:ring-green-500 focus:border-transparent
                    ${errors[field.name] ? 'border-red-500' : 'border-gray-300'}
                  `}
                  disabled={loading}
                >
                  {!formValues[field.name] && !field.defaultValue && (
                    <option value="">请选择...</option>
                  )}
                  {field.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={formValues[field.name] || ''}
                  onChange={(e) => handleFieldChange(field.name, e.target.value)}
                  placeholder={field.placeholder}
                  className={`
                    w-full p-3 border rounded-md
                    focus:ring-2 focus:ring-green-500 focus:border-transparent
                    ${errors[field.name] ? 'border-red-500' : 'border-gray-300'}
                  `}
                  disabled={loading}
                />
              )}

              {errors[field.name] && (
                <p className="mt-1 text-xs text-red-500">{errors[field.name]}</p>
              )}
            </div>
          ))}
        </div>

        {/* 操作按钮 */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            type="submit"
            disabled={loading}
            className="
              bg-green-500 hover:bg-green-600 text-white font-bold
              py-3 px-8 rounded-md transition-colors
              disabled:bg-gray-400 disabled:cursor-not-allowed
              shadow-md hover:shadow-lg
            "
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                生成中...
              </span>
            ) : (
              '生成提示词'
            )}
          </button>

          <button
            type="button"
            onClick={handleReset}
            disabled={loading}
            className="
              bg-gray-500 hover:bg-gray-600 text-white font-bold
              py-3 px-8 rounded-md transition-colors
              disabled:bg-gray-300 disabled:cursor-not-allowed
            "
          >
            重置
          </button>
        </div>

        {/* 示例提示 */}
        {currentCategory.examples && currentCategory.examples.length > 0 && (
          <div className="mt-8 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded">
            <p className="text-sm font-medium text-gray-700 mb-2">💡 示例提示词：</p>
            <div className="text-xs text-gray-600 space-y-2">
              {currentCategory.examples.slice(0, 1).map((example, index) => (
                <p key={index} className="italic">"{example.substring(0, 150)}..."</p>
              ))}
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
