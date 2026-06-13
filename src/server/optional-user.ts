import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'

// Returns the authenticated user, or null when there is none — WITHOUT redirecting.
// The counterpart to requireUser() for PUBLIC pages that have signed-in-only
// sections (e.g. Home's "Made by you" / "Liked songs" shelves): anonymous visitors
// must still see the public sections, so we read the user conditionally rather than
// guard the route. Server-only: uses the server Supabase client and getUser()
// (never getSession()) for the auth decision.
export async function getOptionalUser(): Promise<User | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return user
}
