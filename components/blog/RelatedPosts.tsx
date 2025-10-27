import Link from 'next/link';
import { BlogPost } from '@/lib/blog/types';
import { ArrowRight, Clock } from 'lucide-react';

interface RelatedPostsProps {
  posts: BlogPost[];
  locale: string;
}

export default function RelatedPosts({ posts, locale }: RelatedPostsProps) {
  if (posts.length === 0) {
    return null;
  }

  return (
    <section className="mt-16 pt-12 border-t border-gray-200">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          相关文章推荐
        </h2>
        <p className="text-gray-600">
          您可能对这些内容也感兴趣
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/${locale}/blog/${post.slug}`}
            className="group block bg-white rounded-xl border-2 border-gray-200 hover:border-primary hover:shadow-lg transition-all duration-200 overflow-hidden"
          >
            {/* 卡片头部 */}
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-6">
              <h3 className="font-bold text-lg text-gray-900 group-hover:text-primary transition-colors line-clamp-2">
                {post.title}
              </h3>
            </div>

            {/* 卡片内容 */}
            <div className="p-6 space-y-4">
              {/* 描述 */}
              <p className="text-sm text-gray-600 line-clamp-3">
                {post.description}
              </p>

              {/* 标签 */}
              <div className="flex flex-wrap gap-2">
                {post.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-md"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* 元信息 */}
              <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{post.readingTime}</span>
                </div>
                <div className="flex items-center gap-1 text-primary font-medium group-hover:gap-2 transition-all">
                  <span>阅读文章</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* SEO 内链说明 */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
        <p className="text-sm text-blue-800">
          💡 <strong>提示：</strong>这些相关文章根据标签自动匹配，帮助您深入了解相关主题。
        </p>
      </div>
    </section>
  );
}
