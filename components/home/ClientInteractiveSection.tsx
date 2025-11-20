/**
 * 客户端交互区域
 * 核心功能：视频去水印
 */
'use client';

import { useState } from 'react';
import { GoogleOneTap } from '@/components/auth';
import { VideoProcessor } from '@/components/video/VideoProcessor';
import SatisfactionRating from './SatisfactionRating';
import { useTranslations } from 'next-intl';

export default function ClientInteractiveSection() {
  const t = useTranslations('home');
  const [showRating, setShowRating] = useState(false);

  // 当视频处理成功时显示评分组件
  const handleVideoProcessed = () => {
    setShowRating(true);
  };

  return (
    <>
      {/* Google One Tap - 客户端认证 */}
      <GoogleOneTap />

      {/* Video Watermark Removal Section */}
      <div className="bg-white py-10 border-b border-gray-200">
        <div className="container mx-auto px-4 max-w-4xl">
          <VideoProcessor onVideoProcessed={handleVideoProcessed} />
        </div>
      </div>

      {/* Satisfaction Rating - 只在视频处理成功后显示 */}
      {showRating && (
        <div className="bg-white py-8 px-4 border-b border-gray-100">
          <div className="container mx-auto max-w-4xl">
            <SatisfactionRating
              title={t('satisfaction.title')}
              subtitle={t('satisfaction.subtitle')}
              prompt={t('satisfaction.prompt')}
              receivedMessage={t('satisfaction.received')}
            />
          </div>
        </div>
      )}
    </>
  );
}
