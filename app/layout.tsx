// Root layout - 只用于定义基础HTML结构
// 实际的布局和国际化在 [locale]/layout.tsx 中处理
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
