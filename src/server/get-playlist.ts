import { createClient } from '@/lib/supabase/server'
import type { Playlist } from '@/types'

// Single playlist by id for the /playlist/[id] page. RLS scopes SELECT to the
// owner, so a non-owner (or a missing id) yields null — the page turns that into
// a 404, with no existence leak. Reads degrade gracefully: log and return null.
export async function getPlaylistById(id: string): Promise<Playlist | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('playlists')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) {
    console.error('[getPlaylistById]', error.message)
    return null
  }
  return data
}
