'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface FAQProps {
  locale?: string;
}

export default function FAQ({ locale = 'zh' }: FAQProps) {
  const t = useTranslations('promptGenerator.faq');

  const faqKeys = ['q1', 'q2', 'q3', 'q4'];

  const renderAnswer = (answerKey: string) => {
    const answer = t(`questions.${answerKey}.answer`);
    const parts = answer.split('{br}');

    return (
      <div>
        {parts.map((part, index) => (
          <span key={index}>
            {part}
            {index < parts.length - 1 && <br />}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 py-16 px-4 border-t border-gray-200">
      <div className="max-w-4xl mx-auto">
        {/* Section Title */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-3">
            <i className="fas fa-question-circle text-primary mr-2"></i>
            {t('title')}
          </h2>
          <p className="text-xl text-gray-600">{t('subtitle')}</p>
        </div>

        {/* FAQ Accordion */}
        <Accordion type="single" collapsible className="space-y-4">
          {faqKeys.map((key, index) => (
            <AccordionItem
              key={key}
              value={`item-${index}`}
              className="bg-white rounded-xl border-2 border-gray-200 px-6 overflow-hidden"
            >
              <AccordionTrigger className="py-4 hover:no-underline text-left">
                <span className="font-semibold text-gray-900 pr-4">
                  {t(`questions.${key}.question`)}
                </span>
              </AccordionTrigger>
              <AccordionContent className="pb-4 text-gray-700 leading-relaxed">
                {renderAnswer(key)}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
