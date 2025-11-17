// Root layout - 必须包含 <html> 和 <body> 标签
// 实际的布局和国际化在 [locale]/layout.tsx 中处理
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
