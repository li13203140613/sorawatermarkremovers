'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface FAQProps {
  locale?: string;
}

const FAQ_ITEMS = [
  {
    question: '如何使用提示词生成器创建 AI 视频？',
    answer: `只需三步：
1) 选择您想要的视频类别
2) 在快速模式输入创意，或在专业模式填写详细参数
3) 点击"生成提示词"按钮

我们的 AI 会立即生成专业级 Sora 2 提示词供您使用。`,
  },
  {
    question: '生成的提示词可以直接在 Sora 2 中使用吗？',
    answer: '是的！所有生成的提示词都完全兼容 Sora 2 平台。您可以直接复制提示词到 Sora 2 官方平台，立即开始生成高质量视频。我们的 AI 模型经过专门训练，确保生成的提示词符合 Sora 2 的最佳实践。',
  },
  {
    question: '有生成次数限制吗？',
    answer: '完全没有限制！Sora-Prompt 100% 免费使用，无需注册账号，无需绑定信用卡。您可以生成无限数量的提示词，所有历史记录都会自动保存在浏览器中，方便您随时查看和重用。',
  },
  {
    question: '如何联系技术支持？',
    answer: `您可以通过以下方式联系我们：
• 邮箱：support@sora-prompt.io
• 点击页面底部的"联系我们"链接

我们的专业团队会在 24 小时内回复您的问题。`,
  },
];

export default function FAQ({ locale = 'zh' }: FAQProps) {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 py-16 px-4 border-t border-gray-200">
      <div className="max-w-4xl mx-auto">
        {/* Section Title */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-3">
            <i className="fas fa-question-circle text-primary mr-2"></i>
            常见问题
          </h2>
          <p className="text-xl text-gray-600">解答您关心的问题</p>
        </div>

        {/* FAQ Accordion */}
        <Accordion type="single" collapsible className="space-y-4">
          {FAQ_ITEMS.map((item, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="bg-white rounded-xl border-2 border-gray-200 px-6 overflow-hidden"
            >
              <AccordionTrigger className="py-4 hover:no-underline text-left">
                <span className="font-semibold text-gray-900 pr-4">
                  {item.question}
                </span>
              </AccordionTrigger>
              <AccordionContent className="pb-4 text-gray-700 leading-relaxed whitespace-pre-line">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
