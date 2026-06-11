import { createBrowserClient } from '@supabase/ssr'

// Browser Supabase client for use in 'use client' components and src/hooks/*.
// Constructed ONLY here (see architecture.md → Invariants); never call
// createBrowserClient elsewhere.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
