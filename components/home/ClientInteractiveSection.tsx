/**
 * 客户端交互区域
 * 核心功能：视频去水印
 */
'use client';

import { GoogleOneTap } from '@/components/auth';
import { VideoProcessor } from '@/components/video/VideoProcessor';

export default function ClientInteractiveSection() {
  return (
    <>
      {/* Google One Tap - 客户端认证 */}
      <GoogleOneTap />

      {/* Video Watermark Removal Section */}
      <div className="bg-white py-10 border-b border-gray-200">
        <div className="container mx-auto px-4 max-w-4xl">
          <VideoProcessor />
        </div>
      </div>
    </>
  );
}
