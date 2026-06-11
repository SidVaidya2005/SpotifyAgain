import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Server Supabase client for Server Components, src/server/* reads, Server
// Actions, and Route Handlers. Constructed ONLY here (see architecture.md →
// Invariants). cookies() is async in Next 16, so this fetcher is async too.
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // Called from a Server Component — cookie writes are not allowed there
            // and are safe to ignore; the root proxy refreshes the session instead.
          }
        },
      },
    },
  )
}
