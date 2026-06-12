import { createClient } from '@/lib/supabase/server'
import type { Song } from '@/types'

// Playlist tracks read: the songs in a playlist, in saved track order. Embeds each
// join row's song via the playlist_songs → songs FK and returns the song rows
// ordered by `position`. RLS scopes playlist_songs to the owner (a row is reachable
// only if its parent playlist belongs to auth.uid()), so a non-owner gets []. Reads
// degrade gracefully: log and return [] rather than throw.
export async function getPlaylistSongs(playlistId: string): Promise<Song[]> {
  const supabase = await createClient()
  // .returns<>() asserts the embed shape: the generated types mis-infer the
  // many-to-one `songs(*)` embed as an array, but PostgREST returns one song
  // object per join row (FK + NOT NULL song_id guarantee exactly one). Same
  // override pattern as get-liked-songs.ts.
  const { data, error } = await supabase
    .from('playlist_songs')
    .select('position, songs(*)')
    .eq('playlist_id', playlistId)
    .order('position', { ascending: true })
    .returns<{ position: number; songs: Song }[]>()

  if (error) {
    console.error('[getPlaylistSongs]', error.message)
    return []
  }

  return (data ?? []).map((row) => row.songs)
}
