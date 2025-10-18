# CLAUDE.md - Project Documentation

This file provides guidance to Claude Code when working with this codebase.

## Code Update Log

| Date | Module | Changes | Scope | Note |
|------|----------|----------|----------|------|
| 2025-10-18 | Other | Modified: sora-2-remove-watermark-guide.mdx | content/blog/en/sora-2-remove-watermark-guide.mdx | AI Auto |
| 2025-10-18 | Other | Modified: robots.ts | app/robots.ts | AI Auto |
| 2025-10-18 | Assets | Modified: robots.txt | public/robots.txt | AI Auto |
| 2025-10-18 | Docs | Modified: TROUBLESHOOTING.md | TROUBLESHOOTING.md | AI Auto |
| 2025-10-18 | Other | Modified: next.config.js | next.config.js | AI Auto |
| 2025-10-17 | Payment | Updated: Payment packages & pricing | lib/payment/types.ts, lib/payment/service.ts, components/payment/* | 更新积分价格:美元$10=30/$50=400/$100=1000,人民币¥10=10/¥50=70/¥100=200;添加积分用途说明组件 |
| 2025-10-17 | Components | Created: CreditUsage.tsx | components/payment/CreditUsage.tsx | 积分用途说明:去水印1积分,生成视频1积分,无水印生成2积分 |
| 2025-10-17 | I18n | Updated: Translation files | messages/en.json, messages/zh.json | 添加积分用途说明的中英文翻译 |
| 2025-10-17 | Components | Modified: CreditUsage.tsx | components/payment/CreditUsage.tsx | AI Auto |
| 2025-10-17 | Library | Modified: service.ts | lib/payment/service.ts | AI Auto |
| 2025-10-17 | Docs | Modified: CRAWL_SORA_PROMPTS_GUIDE.md | CRAWL_SORA_PROMPTS_GUIDE.md | AI Auto |
| 2025-10-17 | Other | Modified: crawl-sora-prompts.js | scripts/crawl-sora-prompts.js | AI Auto |
| 2025-10-17 | Components | Modified: VideoModal.tsx | components/prompt/VideoModal.tsx | AI Auto |
| 2025-10-17 | Components | Modified: CategoryFilter.tsx | components/prompt/CategoryFilter.tsx | AI Auto |
| 2025-10-17 | Components | Modified: PromptCard.tsx | components/prompt/PromptCard.tsx | AI Auto |
| 2025-10-17 | Docs | Modified: SORA2_PROMPT_WIREFRAME_SIMPLE.md | SORA2_PROMPT_WIREFRAME_SIMPLE.md | AI Auto |
| 2025-10-17 | Docs | Modified: CLOUDFLARE_R2_INTEGRATION.md | CLOUDFLARE_R2_INTEGRATION.md | AI Auto |
| 2025-10-17 | Tests | Modified: TEST_PHASE1.sql | supabase/migrations/TEST_PHASE1.sql | AI Auto |
| 2025-10-17 | Other | Modified: 20250116000000_add_subscriptions.sql | supabase/migrations/20250116000000_add_subscriptions.sql | AI Auto |
| 2025-10-17 | Other | Modified: check-task-status.js | check-task-status.js | AI Auto |
| 2025-10-16 | Components | Modified: VideoGenerator.tsx | components/aicoding/VideoGenerator.tsx | AI Auto |
| 2025-10-16 | Docs | Modified: FINAL-DESIGN.md | chrome-extension/FINAL-DESIGN.md | AI Auto |
| 2025-10-16 | Docs | Modified: UI-DESIGN.md | chrome-extension/UI-DESIGN.md | AI Auto |
| 2025-10-16 | Docs | Modified: WIREFRAME.md | chrome-extension/WIREFRAME.md | AI Auto |
| 2025-10-16 | Tests | Modified: test-popup.html | chrome-extension/test-popup.html | AI Auto |
| 2025-10-16 | Other | Modified: VERSION.txt | chrome-extension/VERSION.txt | AI Auto |
| 2025-10-16 | Docs | Modified: CLAUDE.md | CLAUDE.md | AI Auto |
| 2025-10-16 | Docs | Created: AICODING_INTEGRATION.md | AICODING_INTEGRATION.md | AI Coding API集成文档 |
| 2025-10-16 | Config | Modified: .env.local | .env.local | 添加AICODING_API_KEY配置 |
| 2025-10-16 | Tests | Created: page.tsx | app/test-aicoding/page.tsx | AI Coding测试页面 |
| 2025-10-16 | API | Created: route.ts | app/api/aicoding/status/[taskId]/route.ts | 查询任务状态API |
| 2025-10-16 | API | Created: route.ts | app/api/aicoding/create/route.ts | 创建视频生成任务API |
| 2025-10-16 | Components | Created: VideoGenerator.tsx | components/aicoding/VideoGenerator.tsx | AI视频生成组件 |
| 2025-10-16 | Tests | Created: test-aicoding.js | test-aicoding.js | Node.js测试脚本 |
| 2025-10-16 | Tests | Created: test-aicoding-api.html | test-aicoding-api.html | HTML测试页面 |
| 2025-10-16 | Tests | Modified: test-phase2.js | test-phase2.js | AI Auto |
| 2025-10-16 | Tests | Modified: test-phase2-complete.tmp | test-phase2-complete.tmp | AI Auto |
| 2025-10-16 | Tests | Modified: test-video-bearer-token.js | test-video-bearer-token.js | AI Auto |
| 2025-10-16 | API | Modified: test-video-api.js | test-video-api.js | AI Auto |
| 2025-10-16 | Tests | Modified: test-supabase-query.js | test-supabase-query.js | AI Auto |
| 2025-10-16 | Other | Modified: icon128.svg | chrome-extension/icons/icon128.svg | AI Auto |
| 2025-10-16 | Other | Modified: icon48.svg | chrome-extension/icons/icon48.svg | AI Auto |
| 2025-10-16 | Other | Modified: icon16.svg | chrome-extension/icons/icon16.svg | AI Auto |
| 2025-10-16 | Other | Modified: generate.py | chrome-extension/icons/generate.py | AI Auto |
| 2025-10-16 | Other | Modified: create-icons.html | chrome-extension/icons/create-icons.html | AI Auto |
| 2025-10-16 | Docs | Modified: ICON_GUIDE.md | chrome-extension/icons/ICON_GUIDE.md | AI Auto |
| 2025-10-16 | Other | Modified: manifest.json | chrome-extension/manifest.json | AI Auto |
| 2025-10-16 | Styles | Modified: content.css | chrome-extension/content.css | AI Auto |
| 2025-10-16 | Docs | Modified: TOKEN_EXPLANATION.md | chrome-extension/TOKEN_EXPLANATION.md | AI Auto |
| 2025-10-16 | API | Modified: error-classifier.ts | lib/api/error-classifier.ts | AI Auto |
| 2025-10-16 | Docs | Modified: VERCEL_CHECK.md | VERCEL_CHECK.md | AI Auto |
| 2025-10-16 | API | Modified: test-online-api-with-token.js | test-online-api-with-token.js | AI Auto |
| 2025-10-16 | Tests | Modified: test-service-role.js | test-service-role.js | AI Auto |
| 2025-10-16 | API | Modified: test-production-api.js | test-production-api.js | AI Auto |
| 2025-10-16 | Other | Modified: sora2-complete-prompt-guide.mdx | content/blog/en/sora2-complete-prompt-guide.mdx | AI Auto |
| 2025-10-16 | Tests | Modified: test-with-real-token.js | test-with-real-token.js | AI Auto |
| 2025-10-16 | API | Modified: test-local-api.js | test-local-api.js | AI Auto |
| 2025-10-16 | Tests | Modified: test-credits-query.js | test-credits-query.js | AI Auto |
| 2025-10-15 | Library | Modified: context.tsx | lib/auth/context.tsx | AI Auto |
| 2025-10-15 | Docs | Modified: TRANSLATE_GUIDE.md | scripts/TRANSLATE_GUIDE.md | AI Auto |
| 2025-10-15 | Other | Modified: translate-prompt.txt | scripts/translate-prompt.txt | AI Auto |
| 2025-10-15 | Other | Modified: create-blog-post.js | scripts/create-blog-post.js | AI Auto |
| 2025-10-15 | Other | Modified: sora-invitation-codes.mdx | content/blog/en/sora-invitation-codes.mdx | AI Auto |
| 2025-10-15 | Other | Modified: i18n.config.ts | i18n.config.ts | AI Auto |
| 2025-10-15 | Other | Modified: tailwind.config.ts | tailwind.config.ts | AI Auto |
| 2025-10-15 | Styles | Modified: blog.css | styles/blog.css | AI Auto |
| 2025-10-15 | Other | Modified: chrome-extension-guide.mdx | content/blog/en/chrome-extension-guide.mdx | AI Auto |
| 2025-10-15 | Other | Modified: ai-watermark-removal.mdx | content/blog/en/ai-watermark-removal.mdx | AI Auto |
| 2025-10-15 | Other | Modified: getting-started.mdx | content/blog/en/getting-started.mdx | AI Auto |
| 2025-10-15 | Components | Modified: BlogRelated.tsx | components/blog/BlogRelated.tsx | AI Auto |
| 2025-10-15 | Components | Modified: BlogSearch.tsx | components/blog/BlogSearch.tsx | AI Auto |
| 2025-10-15 | Components | Modified: BlogContent.tsx | components/blog/BlogContent.tsx | AI Auto |
| 2025-10-15 | Components | Modified: BlogHeader.tsx | components/blog/BlogHeader.tsx | AI Auto |
| 2025-10-15 | Components | Modified: BlogCard.tsx | components/blog/BlogCard.tsx | AI Auto |
| 2025-10-15 | Components | Modified: MDXComponents.tsx | components/blog/MDXComponents.tsx | AI Auto |
| 2025-10-15 | Library | Modified: utils.ts | lib/blog/utils.ts | AI Auto |
| 2025-10-15 | Other | Modified: i18n.ts | i18n.ts | AI Auto |
| 2025-10-15 | Components | Modified: VideoResult.tsx | components/video/VideoResult.tsx | AI Auto |
| 2025-10-14 | Other | Modified: 20250114_add_user_credits.sql | supabase/migrations/20250114_add_user_credits.sql | AI Auto |
| 2025-10-14 | Other | Modified: create-user-profile.js | create-user-profile.js | AI Auto |
| 2025-10-14 | Tests | Modified: test-user-credits.js | test-user-credits.js | AI Auto |
| 2025-10-14 | Other | Modified: background-oauth-bridge.js | sora-extension/background-oauth-bridge.js | AI Auto |
| 2025-10-14 | Other | Modified: google-auth.js | sora-extension/google-auth.js | AI Auto |
| 2025-10-14 | Other | Modified: background-oauth.js | sora-extension/background-oauth.js | AI Auto |
| 2025-10-14 | Other | Modified: auth.js | sora-extension/auth.js | AI Auto |
| 2025-10-14 | Other | Modified: config.js | sora-extension/config.js | AI Auto |
| 2025-10-14 | Docs | Modified: DEPLOYMENT_GUIDE.md | DEPLOYMENT_GUIDE.md | AI Auto |
| 2025-10-14 | Other | Modified: verify_table.sql | supabase/migrations/verify_table.sql | AI Auto |
| 2025-10-14 | Docs | Modified: ADMIN_SETUP.md | ADMIN_SETUP.md | AI Auto |
| 2025-10-14 | Components | Modified: LogsFilter.tsx | components/admin/LogsFilter.tsx | AI Auto |
| 2025-10-14 | Components | Modified: LogsTable.tsx | components/admin/LogsTable.tsx | AI Auto |
| 2025-10-14 | Components | Modified: UsersTable.tsx | components/admin/UsersTable.tsx | AI Auto |
| 2025-10-14 | Components | Modified: StatsCards.tsx | components/admin/StatsCards.tsx | AI Auto |
| 2025-10-14 | Library | Modified: auth.ts | lib/admin/auth.ts | AI Auto |
| 2025-10-14 | Library | Modified: queries.ts | lib/admin/queries.ts | AI Auto |
| 2025-10-14 | Assets | Modified: test-extension.html | public/test-extension.html | AI Auto |
| 2025-10-14 | Library | Modified: logger.ts | lib/admin/logger.ts | AI Auto |
| 2025-10-14 | Tests | Modified: test-cookie.js | sora-extension/test-cookie.js | AI Auto |
| 2025-10-14 | Tests | Modified: test-cookie.html | sora-extension/test-cookie.html | AI Auto |
| 2025-10-14 | Other | Modified: create_usage_logs.sql | supabase/migrations/create_usage_logs.sql | AI Auto |
| 2025-10-14 | Other | Modified: debug.html | sora-extension/debug.html | AI Auto |
| 2025-10-14 | Other | Modified: popup.js | sora-extension/popup.js | AI Auto |
| 2025-10-14 | Styles | Modified: popup.css | sora-extension/popup.css | AI Auto |
| 2025-10-14 | Other | Modified: popup.html | sora-extension/popup.html | AI Auto |
| 2025-10-13 | Other | Modified: icon.svg | sora-extension/icons/icon.svg | AI Auto |
| 2025-10-13 | Docs | Modified: README.md | sora-extension/icons/README.md | AI Auto |
| 2025-10-13 | Styles | Modified: styles.css | sora-extension/styles.css | AI Auto |
| 2025-10-13 | Other | Modified: background.js | sora-extension/background.js | AI Auto |
| 2025-10-13 | Other | Modified: content.js | sora-extension/content.js | AI Auto |
| 2025-10-13 | Docs | Modified: CORS-CONFIG.md | sora-extension/CORS-CONFIG.md | AI Auto |
| 2025-10-13 | Docs | Modified: ROADMAP.md | sora-extension/ROADMAP.md | AI Auto |
| 2025-10-12 | Components | Modified: PaymentPackages.tsx | components/payment/PaymentPackages.tsx | AI Auto |
| 2025-10-12 | Other | Modified: next-sitemap.config.js | next-sitemap.config.js | AI Auto |
| 2025-10-12 | Other | Modified: .gitignore | .gitignore | AI Auto |
| 2025-10-12 | Other | Modified: pre-commit | .husky/pre-commit | AI Auto |
| 2025-10-12 | Components | Modified: ClientLayout.tsx | components/layout/ClientLayout.tsx | AI Auto |
| 2025-10-12 | Components | Modified: LanguageSwitcher.tsx | components/language/LanguageSwitcher.tsx | AI Auto |
| 2025-10-12 | Components | Modified: NavBar.tsx | components/layout/NavBar.tsx | AI Auto |
| 2025-10-12 | Components | Modified: index.ts | components/auth/index.ts | AI Auto |
| 2025-10-12 | Components | Modified: NavUserProfile.tsx | components/auth/NavUserProfile.tsx | AI Auto |
| 2025-10-11 | Other | Modified: CreditsContext.tsx | contexts/CreditsContext.tsx | AI Auto |
| 2025-10-11 | API | Modified: route.ts | app/api/video/process/route.ts | AI Auto |
| 2025-10-11 | Library | Modified: verify.ts | lib/turnstile/verify.ts | AI Auto |
| 2025-10-11 | Components | Modified: TurnstileWidget.tsx | components/turnstile/TurnstileWidget.tsx | AI Auto |
| 2025-10-11 | Other | Modified: package.json | package.json | AI Auto |
| 2025-10-11 | Components | Modified: CreditsDisplay.tsx | components/credits/CreditsDisplay.tsx | AI Auto |
| 2025-10-11 | Hooks | Modified: useCredits.tsx | hooks/useCredits.tsx | AI Auto |
| 2025-10-11 | Library | Modified: types.ts | lib/credits/types.ts | AI Auto |
| 2025-10-11 | Other | Modified: en.json | messages/en.json | AI Auto |
| 2025-10-11 | Components | Modified: VideoProcessor.tsx | components/video/VideoProcessor.tsx | AI Auto |
| 2025-10-11 | Other | Modified: .env.local | .env.local | AI Auto |
| 2025-10-11 | Tests | Modified: page.tsx | app/test-cookie/page.tsx | AI Auto |
| 2025-10-11 | Library | Modified: cookie.ts | lib/cookie.ts | AI Auto |
| 2025-10-09 | Other | Modified: layout.tsx | app/layout.tsx | AI Auto |

