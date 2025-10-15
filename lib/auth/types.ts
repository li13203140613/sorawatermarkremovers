import { User } from '@supabase/supabase-js'

export interface AuthContextType {
  user: User | null
  loading: boolean
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signInWithGoogle: (customRedirect?: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
}

export interface UserProfile {
  id: string
  email: string
  credits: number
  created_at: string
}
