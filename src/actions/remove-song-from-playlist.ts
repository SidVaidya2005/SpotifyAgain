'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ActionResult } from '@/types'

// Removes a song from one of the user's playlists. RLS scopes the DELETE to rows
// of playlists owned by auth.uid(), so a non-owner's delete simply affects zero
// rows; we still re-check getUser(). Leaving a gap in `position` is harmless —
// reads always order by position asc (getPlaylistSongs), so gaps don't reorder.
export async function removeSongFromPlaylist(
  playlistId: string,
  songId: string,
): Promise<ActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'You must be signed in to edit a playlist.' }

  const { error } = await supabase
    .from('playlist_songs')
    .delete()
    .eq('playlist_id', playlistId)
    .eq('song_id', songId)

  if (error) {
    console.error('[removeSongFromPlaylist]', error.message) // log raw server-side
    return { error: 'Could not remove the song. Please try again.' } // user-safe
  }

  revalidatePath('/playlist/' + playlistId)
  return { data: undefined }
}
