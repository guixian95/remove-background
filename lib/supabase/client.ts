import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SB_SUPABASE_URL!,     // ← 改这里（最常见）
    process.env.NEXT_PUBLIC_SB_SUPABASE_ANON_KEY!, // ← 改这里
  )
}