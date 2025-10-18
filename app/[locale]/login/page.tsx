import { AuthForm, GoogleOneTap } from '@/components/auth'

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Google One Tap - 右上角自动弹出 */}
      <GoogleOneTap />

      {/* 传统登录表单 - 作为备选方案 */}
      <AuthForm />
    </main>
  )
}
