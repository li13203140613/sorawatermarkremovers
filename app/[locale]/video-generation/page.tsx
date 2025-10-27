'use client'

import { AuthProvider } from '@/lib/auth'
import { CreditsProvider } from '@/contexts/CreditsContext'
import VideoGenerator from '@/components/video-generation/VideoGenerator';

export default function VideoGenerationPage() {
  return (
    <AuthProvider>
      <CreditsProvider>
        <VideoGenerator />
      </CreditsProvider>
    </AuthProvider>
  );
}