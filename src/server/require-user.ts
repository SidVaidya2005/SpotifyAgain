import { redirect } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'

// Personal-page guard: returns the authenticated user, or redirects to `/` when
// there is none. Defense-in-depth alongside src/proxy.ts (which already blocks
// anonymous requests to /library, /liked, /playlist) — call this at the top of
// every personal-page Server Component so the page itself never renders for a
// signed-out viewer. Server-only: uses the server Supabase client and getUser()
// (never getSession()) for the auth decision.
export async function requireUser(): Promise<User> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/')
  return user
}
