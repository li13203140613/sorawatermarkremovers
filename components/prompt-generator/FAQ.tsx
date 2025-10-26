'use client';

import Link from 'next/link';
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
    answer: (
      <div>
        只需三步：
        <br />
        1) 选择您想要的视频类别
        <br />
        2) 在快速模式输入创意，或在专业模式填写详细参数
        <br />
        3) 点击&ldquo;生成提示词&rdquo;按钮
        <br /><br />
        我们的 AI 会立即生成专业级 Sora 2 提示词供您使用。生成提示词后，您可以前往{' '}
        <Link href="/video-generation" className="text-primary hover:underline font-medium">
          AI 视频生成
        </Link>
        {' '}页面直接生成视频。
      </div>
    ),
  },
  {
    question: '生成的提示词可以直接在 Sora 2 中使用吗？',
    answer: (
      <div>
        是的！所有生成的提示词都完全兼容 Sora 2 平台。您可以直接复制提示词到 Sora 2 官方平台，立即开始生成高质量视频。
        我们的 AI 模型经过专门训练，确保生成的提示词符合 Sora 2 的最佳实践。
        <br /><br />
        还想看更多优质案例？访问{' '}
        <Link href="/soraprompting" className="text-primary hover:underline font-medium">
          Prompt 展示
        </Link>
        {' '}查看海量精选提示词。
      </div>
    ),
  },
  {
    question: '除了提示词生成，还有其他功能吗？',
    answer: (
      <div>
        当然！Sora Tools 提供完整的视频工具生态：
        <br /><br />
        •{' '}
        <Link href="/dashboard" className="text-primary hover:underline font-medium">
          视频去水印
        </Link>
        {' '}- 一键移除 Sora2 视频水印
        <br />
        •{' '}
        <Link href="/video-generation" className="text-primary hover:underline font-medium">
          AI 视频生成
        </Link>
        {' '}- 使用提示词直接生成视频
        <br />
        •{' '}
        <Link href="/soraprompting" className="text-primary hover:underline font-medium">
          Prompt 展示
        </Link>
        {' '}- 浏览优质提示词案例
        <br /><br />
        查看{' '}
        <Link href="/pricing" className="text-primary hover:underline font-medium">
          积分套餐
        </Link>
        {' '}了解更多功能详情。
      </div>
    ),
  },
  {
    question: '如何联系技术支持？',
    answer: (
      <div>
        您可以通过以下方式联系我们：
        <br />
        • 邮箱：support@sora-prompt.io
        <br />
        • 访问{' '}
        <Link href="/blog" className="text-primary hover:underline font-medium">
          博客
        </Link>
        {' '}查看详细教程和常见问题解答
        <br /><br />
        我们的专业团队会在 24 小时内回复您的问题。
      </div>
    ),
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
              <AccordionContent className="pb-4 text-gray-700 leading-relaxed">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
