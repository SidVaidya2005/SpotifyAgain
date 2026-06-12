import { createClient } from '@/lib/supabase/server'
import type { Song } from '@/types'

// Liked Songs read: the songs a user has liked, newest like first. Embeds each
// like's song via the liked_songs → songs FK and returns the song rows. RLS scopes
// liked_songs to the owner, so callers pass their own id (from requireUser()).
// Reads degrade gracefully: log and return [] rather than throw.
export async function getLikedSongs(userId: string): Promise<Song[]> {
  const supabase = await createClient()
  // .returns<>() asserts the embed shape: the generated types mis-infer the
  // many-to-one `songs(*)` embed as an array, but PostgREST returns one song
  // object per like row (FK + NOT NULL song_id guarantee exactly one).
  const { data, error } = await supabase
    .from('liked_songs')
    .select('songs(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .returns<{ songs: Song }[]>()

  if (error) {
    console.error('[getLikedSongs]', error.message)
    return []
  }

  return (data ?? []).map((row) => row.songs)
}
