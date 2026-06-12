'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ActionResult } from '@/types'

// Rewrites the track order of one of the user's playlists. `orderedSongIds` is the
// full list of the playlist's song ids in their new order; each row's `position`
// is set to its index. RLS scopes the UPDATE to rows of playlists owned by
// auth.uid(); we still re-check getUser(). Safe to write positions sequentially —
// there is no unique(playlist_id, position) constraint, so transient duplicate
// positions during the rewrite can't violate anything.
export async function reorderPlaylist(
  playlistId: string,
  orderedSongIds: string[],
): Promise<ActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'You must be signed in to reorder a playlist.' }

  for (let i = 0; i < orderedSongIds.length; i++) {
    const { error } = await supabase
      .from('playlist_songs')
      .update({ position: i })
      .eq('playlist_id', playlistId)
      .eq('song_id', orderedSongIds[i])

    if (error) {
      console.error('[reorderPlaylist]', error.message) // log raw server-side
      return { error: 'Could not save the new order. Please try again.' } // user-safe
    }
  }

  revalidatePath('/playlist/' + playlistId)
  return { data: undefined }
}
