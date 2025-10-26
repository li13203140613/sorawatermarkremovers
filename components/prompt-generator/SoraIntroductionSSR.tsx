/**
 * Sora Introduction - 服务端渲染版本
 * 用于 SEO 优化，静态内容在服务端渲染
 */

interface SoraIntroductionSSRProps {
  locale?: string;
}

export default function SoraIntroductionSSR({ locale = 'zh' }: SoraIntroductionSSRProps) {
  return (
    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 py-16 px-4 border-t border-gray-200">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              <i className="fas fa-video text-primary mr-3"></i>
              什么是 Sora 2？
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p className="text-lg">
                <strong className="text-primary">Sora 2</strong> 是 OpenAI 最新推出的 AI 视频生成模型。
                只需输入简单的文字描述，即可生成高质量的视频内容。
              </p>
              <p>
                无论是电影级特效、真实场景还是创意动画，我们的提示词生成器都能帮您创建最完美的提示词，
                释放 Sora 2 的全部潜能。
              </p>
              <div className="flex gap-4 mt-6">
                <div className="flex-1 bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-3xl font-bold text-primary mb-1">10M+</div>
                  <div className="text-sm text-gray-600">生成次数</div>
                </div>
                <div className="flex-1 bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-3xl font-bold text-green-600 mb-1">98%</div>
                  <div className="text-sm text-gray-600">满意度</div>
                </div>
                <div className="flex-1 bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-3xl font-bold text-amber-600 mb-1">24/7</div>
                  <div className="text-sm text-gray-600">在线服务</div>
                </div>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl p-8 text-white">
              <i className="fas fa-quote-left text-4xl opacity-50 mb-4"></i>
              <p className="text-lg mb-6">
                &ldquo;使用 Sora-Prompt 后，我的视频创作效率提升了 300%！AI 生成的提示词专业且富有创意。&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                  <i className="fas fa-user text-primary text-xl"></i>
                </div>
                <div>
                  <div className="font-bold">张小明</div>
                  <div className="text-sm opacity-90">独立视频创作者</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
