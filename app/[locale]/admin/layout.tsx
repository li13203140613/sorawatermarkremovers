/**
 * Admin layout for internationalized routes
 * This layout is used for /[locale]/admin/* routes
 */
export default function LocaleAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Don't wrap in html/body tags as the parent [locale]/layout.tsx already does that
  return <>{children}</>
}
