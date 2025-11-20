import Link from 'next/link'
import { getAllPosts } from '@/lib/blog/utils'
import { Language } from '@/lib/blog/types'
import { getTranslations, getMessages } from 'next-intl/server'
import { generateHomePageSchema, generateFAQSchema, HOME_FAQ_DATA } from '@/lib/seo/structured-data'
import ClientInteractiveSectionWithProviders from '@/components/home/ClientInteractiveSectionWithProviders'
import UserReviews from '@/components/home/UserReviews'

const STAR_COUNT = 5

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'home' })
  const messages = await getMessages({ locale })

  const blogLang: Language = locale.startsWith('zh') ? 'zh' : 'en'
  const recommendedPosts = getAllPosts(blogLang).slice(0, 3)

  const usageSteps = [
    {
      id: 1,
      title: t('usage.steps.stepOneTitle'),
      description: t('usage.steps.stepOneDescription'),
    },
    {
      id: 2,
      title: t('usage.steps.stepTwoTitle'),
      description: t('usage.steps.stepTwoDescription'),
    },
    {
      id: 3,
      title: t('usage.steps.stepThreeTitle'),
      description: t('usage.steps.stepThreeDescription'),
    },
  ]

  const reasonItems = [
    {
      key: 'fast',
      icon: '⚡',
      title: t('reasons.items.fast.title'),
      description: t('reasons.items.fast.description'),
    },
    {
      key: 'private',
      icon: '🔒',
      title: t('reasons.items.private.title'),
      description: t('reasons.items.private.description'),
    },
    {
      key: 'instant',
      icon: '⏱️',
      title: t('reasons.items.instant.title'),
      description: t('reasons.items.instant.description'),
    },
    {
      key: 'clean',
      icon: '🧹',
      title: t('reasons.items.clean.title'),
      description: t('reasons.items.clean.description'),
    },
    {
      key: 'aiSafe',
      icon: '🛡️',
      title: t('reasons.items.aiSafe.title'),
      description: t('reasons.items.aiSafe.description'),
    },
    {
      key: 'support',
      icon: '🤝',
      title: t('reasons.items.support.title'),
      description: t('reasons.items.support.description'),
    },
  ]

  const formatBlogDate = (value: string) => {
    try {
      return new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).format(new Date(value))
    } catch {
      return value
    }
  }

  const blogPath = `/${locale}/blog`
  const pricingPath = `/${locale}/pricing`
  const privacyPath = `/${locale}/privacy`
  const pricingLabel = messages.nav?.pricing ?? 'Pricing'
  const blogLabel = messages.nav?.blog ?? 'Blog'

  const homeSchemas = generateHomePageSchema()
  const faqSchemaJson = generateFAQSchema(HOME_FAQ_DATA)

  return (
    <>
      {/* Structured data - JSON-LD for SEO */}
      {homeSchemas.map((schema, index) => {
        try {
          JSON.parse(schema)
        } catch {
          console.error('Invalid schema JSON:', schema)
          return null
        }
        return (
          <script
            key={`schema-${index}`}
            id={`structured-data-${index}`}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: schema }}
          />
        )
      })}
      <script
        id="structured-data-faq"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            {
              '@context': 'https://schema.org',
              ...faqSchemaJson,
            },
            null,
            0
          ),
        }}
      />

      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-20 px-4 text-center overflow-hidden">
          {/* 装饰性背景图案 */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
            <div className="absolute top-0 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
          </div>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 text-indigo-700 text-sm font-semibold mb-6">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>100% Free to Use • No Login Required</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 leading-tight mb-6">
              {t('hero.title')}
            </h1>
            <p className="text-lg md:text-2xl text-gray-700 max-w-3xl mx-auto font-medium">
              {t('hero.subtitle')}
            </p>
          </div>
        </div>

        {/* Client interactive section (包含视频处理和满意度评分) */}
        <ClientInteractiveSectionWithProviders locale={locale} messages={messages} />

        {/* Rating Banner - 轻量卡片式 */}
        <div className="py-8 px-4">
          <div className="container mx-auto max-w-6xl flex justify-center">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-4 inline-flex items-center gap-6">
              {/* 头像组 */}
              <div className="flex -space-x-2">
                <img
                  src="https://ui-avatars.com/api/?name=Iris+M&background=4F46E5&color=fff&size=64"
                  alt="User"
                  className="w-9 h-9 rounded-full border-2 border-white shadow-sm"
                />
                <img
                  src="https://ui-avatars.com/api/?name=Finnian+C&background=10B981&color=fff&size=64"
                  alt="User"
                  className="w-9 h-9 rounded-full border-2 border-white shadow-sm"
                />
                <img
                  src="https://ui-avatars.com/api/?name=Bastien+Y&background=F59E0B&color=fff&size=64"
                  alt="User"
                  className="w-9 h-9 rounded-full border-2 border-white shadow-sm"
                />
                <img
                  src="https://ui-avatars.com/api/?name=Sylvie+C&background=EC4899&color=fff&size=64"
                  alt="User"
                  className="w-9 h-9 rounded-full border-2 border-white shadow-sm"
                />
              </div>

              {/* 评分信息 */}
              <div className="flex items-center gap-2">
                <div className="text-left">
                  <div className="font-semibold text-gray-900 text-base">{t('rating.label')}</div>
                  <div className="text-gray-600 text-sm">
                    <span className="text-[#2A9D90] font-bold">{t('rating.scoreText')}</span> out of 5
                  </div>
                </div>
              </div>

              {/* 星星 + 信任评分 */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {Array.from({ length: STAR_COUNT }).map((_, index) => (
                    <svg
                      key={`star-${index}`}
                      className="w-4 h-4 text-yellow-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.945a1 1 0 00.95.69h4.155c.969 0 1.371 1.24.588 1.81l-3.367 2.447a1 1 0 00-.364 1.118l1.287 3.944c.3.921-.755 1.688-1.54 1.118L10 13.347l-3.366 2.447c-.784.57-1.84-.197-1.54-1.118l1.286-3.944a1 1 0 00-.364-1.118L2.65 9.372c-.783-.57-.38-1.81.588-1.81h4.154a1 1 0 00.951-.69l1.286-3.945z" />
                    </svg>
                  ))}
                  <svg width="12" height="11" viewBox="0 0 13 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="ml-1">
                    <path d="M9.98103 11.4999C9.92347 11.4996 9.86677 11.4864 9.8154 11.4614L6.49714 9.78399L3.18174 11.4614C3.12193 11.4908 3.05483 11.5039 2.98783 11.499C2.92083 11.4942 2.85651 11.4716 2.80194 11.4339C2.74755 11.3961 2.70531 11.3443 2.68006 11.2845C2.65481 11.2247 2.64756 11.1592 2.65916 11.0956L3.29311 7.54566L0.608807 5.03236C0.560652 4.98721 0.526591 4.92998 0.510485 4.86715C0.494378 4.80431 0.49687 4.73839 0.517677 4.67685C0.538484 4.61531 0.576776 4.56062 0.628212 4.51896C0.679649 4.4773 0.742174 4.45035 0.808702 4.44116L4.52104 3.9242L6.17446 0.693199C6.20416 0.635209 6.25013 0.58638 6.30716 0.552238C6.36418 0.518095 6.42999 0.5 6.49714 0.5C6.5643 0.5 6.63011 0.518095 6.68713 0.552238C6.74416 0.58638 6.79013 0.635209 6.81983 0.693199L8.47896 3.9242L12.1913 4.44116C12.2578 4.45035 12.3204 4.4773 12.3718 4.51896C12.4232 4.56062 12.4615 4.61531 12.4823 4.67685C12.5031 4.73839 12.5056 4.80431 12.4895 4.86715C12.4734 4.92998 12.4393 4.98721 12.3912 5.03236L9.70689 7.54566L10.3408 11.0956C10.3496 11.1457 10.3469 11.1971 10.3328 11.246C10.3187 11.295 10.2936 11.3403 10.2593 11.3789C10.2249 11.4175 10.1822 11.4483 10.1341 11.4692C10.086 11.4901 10.0338 11.5006 9.98103 11.4999Z" fill="#3BAF4F" />
                  </svg>
                </div>
                <div className="text-left">
                  <div className="font-semibold text-gray-900 text-sm">{t('rating.tagline')}</div>
                  <div className="text-gray-600 text-xs">Based on <span className="font-semibold text-gray-900">{t('rating.reviews')}</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Usage Steps */}
        <div className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t('usage.title')}</h2>
              <p className="text-gray-600 max-w-2xl mx-auto text-base">{t('usage.subtitle')}</p>
            </div>
            <div className="mt-10 grid gap-8 md:grid-cols-3">
              {/* Step 1 - 粘贴链接 */}
              <div className="rounded-3xl border-2 border-indigo-100 bg-white p-8 shadow-md transition hover:shadow-xl hover:border-indigo-300">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-400 to-indigo-500 shadow-lg">
                  <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-bold text-sm">
                    1
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{usageSteps[0].title}</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">{usageSteps[0].description}</p>
              </div>

              {/* Step 2 - 提交处理 */}
              <div className="rounded-3xl border-2 border-green-100 bg-white p-8 shadow-md transition hover:shadow-xl hover:border-green-300">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg">
                  <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600 font-bold text-sm">
                    2
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{usageSteps[1].title}</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">{usageSteps[1].description}</p>
              </div>

              {/* Step 3 - 下载视频 */}
              <div className="rounded-3xl border-2 border-purple-100 bg-white p-8 shadow-md transition hover:shadow-xl hover:border-purple-300">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-purple-400 to-pink-500 shadow-lg">
                  <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-purple-600 font-bold text-sm">
                    3
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{usageSteps[2].title}</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">{usageSteps[2].description}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Membership Callout */}
        <div className="bg-slate-900 py-16 px-4 text-white">
          <div className="container mx-auto max-w-6xl flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl space-y-3">
              <h2 className="text-3xl font-bold tracking-tight">{t('membership.title')}</h2>
              <p className="text-lg text-slate-200">{t('membership.description')}</p>
            </div>
            <Link
              href={pricingPath}
              className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold uppercase tracking-wide text-slate-900 transition hover:bg-gray-100"
            >
              {t('membership.cta')}
            </Link>
          </div>
        </div>

        {/* Reasons to trust */}
        <div className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="grid gap-10 md:grid-cols-3">
              <div className="space-y-4">
                <h2 className="text-4xl font-bold text-gray-900">{t('reasons.title')}</h2>
                <p className="text-gray-600">{t('reasons.subtitle')}</p>
              </div>
              <div className="md:col-span-2 grid gap-6 sm:grid-cols-2">
                {reasonItems.map(item => (
                  <div key={item.key} className="rounded-3xl border border-gray-100 p-6 shadow-sm">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{item.icon}</span>
                      <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                    </div>
                    <p className="mt-3 text-gray-600 text-sm">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* User Reviews */}
        <UserReviews
          title={t('reviews.title')}
          subtitle={t('reviews.subtitle')}
          reviews={messages.home?.reviews?.items || []}
        />

        {/* Recommended Articles */}
        <div className="py-16 px-4">
          <div className="container mx-auto max-w-6xl space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">{t('recommended.title')}</h2>
                <p className="text-gray-600">{t('recommended.subtitle')}</p>
              </div>
              <Link
                href={blogPath}
                className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 transition hover:text-indigo-500"
              >
                {t('recommended.viewMore')}
                <span aria-hidden="true">→</span>
              </Link>
            </div>
            {recommendedPosts.length === 0 ? (
              <p className="text-gray-500">{t('recommended.empty')}</p>
            ) : (
              <div className="grid gap-6 md:grid-cols-3">
                {recommendedPosts.map(post => (
                  <Link
                    href={`${blogPath}/${post.slug}`}
                    key={post.slug}
                    className="group block h-full rounded-3xl border border-gray-200 bg-white p-6 transition hover:border-indigo-500 hover:shadow-lg"
                  >
                    <div className="space-y-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.4em] text-gray-400">
                        {formatBlogDate(post.date)}
                      </p>
                      <h3 className="text-xl font-semibold text-gray-900 group-hover:text-indigo-600">
                        {post.title}
                      </h3>
                      <p className="text-gray-500 text-sm">{post.description}</p>
                    </div>
                    <div className="mt-6 flex items-center justify-between text-xs font-semibold text-gray-500">
                      <span>{post.readingTime}</span>
                      <span>{post.author}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* SEO Content */}
        <div className="py-16 px-4">
          <div className="container mx-auto max-w-6xl space-y-12">
            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Sora Watermark Remover FAQ</h2>
              <div className="space-y-6">
                {HOME_FAQ_DATA.map((item, idx) => (
                  <div key={idx} className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.question}</h3>
                    <p className="text-gray-700 leading-relaxed">{item.answer}</p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Technical notes for Sora &amp; Sora 2 watermark removal</h2>
              <p className="text-gray-700 mb-4">
                Optimized for searches like &quot;remove Sora watermark&quot;, &quot;Sora 2 watermark remover&quot;,
                &quot;download Sora video without watermark&quot;, and other Sora watermark removal keywords.
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                {[
                  'AI-based logo detection for Sora and Sora 2 videos with frame-level cleanup.',
                  'Edge-aware inpainting to avoid blur around the Sora watermark area.',
                  'Handles "sora watermark", "sora2 watermark", and custom logo placements.',
                  'Server-side processing keeps your Sora video secure; downloads use HTTPS.',
                ].map((note, idx) => (
                  <li key={idx}>{note}</li>
                ))}
              </ul>
            </section>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12 px-4">
          <div className="container mx-auto max-w-6xl grid gap-8 md:grid-cols-3">
            <div className="space-y-3">
              <p className="text-2xl font-bold">RemoveWM</p>
              <p className="text-gray-300">{t('footer.description')}</p>
            </div>
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.4em] text-gray-500">
                {t('footer.explore')}
              </p>
              <div className="space-y-2">
                <Link href={pricingPath} className="text-sm text-white transition hover:text-indigo-300">
                  {pricingLabel}
                </Link>
                <Link href={blogPath} className="text-sm text-white transition hover:text-indigo-300">
                  {blogLabel}
                </Link>
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.4em] text-gray-500">
                {t('footer.links')}
              </p>
              <div className="space-y-2">
                <Link href={privacyPath} className="text-sm text-white transition hover:text-indigo-300">
                  {t('footer.privacy')}
                </Link>
                <span className="text-sm text-gray-400">{t('footer.terms')}</span>
              </div>
            </div>
          </div>
          <div className="mt-10 text-sm text-gray-400 border-t border-gray-800 pt-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <p>{t('footer.copy')}</p>
            <p className="text-gray-500">{t('footer.description')}</p>
          </div>
        </footer>
      </div>
    </>
  )
}
