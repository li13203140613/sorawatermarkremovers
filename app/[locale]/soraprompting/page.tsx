import { Metadata } from 'next';
import PromptGrid from '@/components/soraprompting/PromptGrid';

export const metadata: Metadata = {
  title: 'Sora Prompts Gallery | SoraPrompting Collection',
  description: 'Browse and explore high-quality Sora AI video generation prompts from SoraPrompting.com',
};

// 从 R2 获取数据
async function getPrompts() {
  try {
    // 如果配置了 R2_PUBLIC_URL，从 R2 获取
    const r2Url = process.env.R2_PUBLIC_URL;
    if (r2Url) {
      const response = await fetch(`${r2Url}/soraprompting/prompts.json`, {
        cache: 'no-store', // 或使用 revalidate
      });
      if (response.ok) {
        const data = await response.json();
        return data.prompts || [];
      }
    }

    // 回退到本地 JSON（开发环境）
    const fs = require('fs');
    const path = require('path');
    const jsonPath = path.join(process.cwd(), 'data/soraprompting/prompts.json');

    if (fs.existsSync(jsonPath)) {
      const fileContent = fs.readFileSync(jsonPath, 'utf-8');
      const data = JSON.parse(fileContent);
      return data.prompts || [];
    }

    return [];
  } catch (error) {
    console.error('获取提示词数据失败:', error);
    return [];
  }
}

export default async function SoraPromptingPage() {
  const prompts = await getPrompts();

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Sora Prompts Gallery
            </h1>
            <p className="text-lg md:text-xl text-purple-100 mb-6">
              Curated collection of high-quality Sora AI video generation prompts
            </p>
            <div className="flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
                <span>{prompts.length} Prompts</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                </svg>
                <span>{prompts.filter((p: any) => p.videoUrl || p.r2VideoUrl).length} Videos</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                </svg>
                <span>Source: SoraPrompting.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {prompts.length > 0 ? (
          <PromptGrid prompts={prompts} />
        ) : (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-16 w-16 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">暂无数据</h3>
            <p className="mt-2 text-sm text-gray-500">
              请先运行爬虫脚本收集数据，或配置 R2 存储
            </p>
            <div className="mt-6">
              <a
                href="/R2_UPLOAD_GUIDE.md"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-purple-700 bg-purple-100 hover:bg-purple-200"
              >
                查看配置指南
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-sm text-gray-600">
            <p>
              Data sourced from{' '}
              <a
                href="https://www.soraprompting.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-600 hover:text-purple-800 font-medium"
              >
                SoraPrompting.com
              </a>
            </p>
            <p className="mt-2">
              For educational and reference purposes only
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
