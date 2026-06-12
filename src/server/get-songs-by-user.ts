import { createClient } from '@/lib/supabase/server'
import type { Song } from '@/types'

// Library read: a single user's own uploads (public + private). Callers pass the
// authenticated user's own id (from requireUser()); RLS independently scopes the
// `songs` SELECT to public rows + the viewer's own, so this only ever returns the
// owner's songs. Reads degrade gracefully: log and return [] rather than throw.
export async function getSongsByUser(userId: string): Promise<Song[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('songs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[getSongsByUser]', error.message)
    return []
  }
  return data ?? []
}
