'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ActionResult } from '@/types'

// Adds a catalog song to one of the user's playlists. Re-checks getUser() and
// never trusts a client id; RLS independently enforces that the playlist is the
// user's AND the song is visible to them (public or own) on INSERT. The new row's
// position is appended after the current max (no (playlist_id, position) unique
// constraint, so a plain max+1 is safe). A duplicate hits the
// unique(playlist_id, song_id) constraint (Postgres 23505) — the one expected,
// user-correctable case, mapped to a friendly message; everything else is generic.
export async function addSongToPlaylist(
  playlistId: string,
  songId: string,
): Promise<ActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'You must be signed in to add songs to a playlist.' }

  // Next position = current max + 1 (0 for an empty playlist). RLS scopes this
  // read to the owner's playlist rows.
  const { data: last, error: posError } = await supabase
    .from('playlist_songs')
    .select('position')
    .eq('playlist_id', playlistId)
    .order('position', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (posError) {
    console.error('[addSongToPlaylist]', posError.message)
    return { error: 'Could not add the song. Please try again.' }
  }

  const nextPosition = (last?.position ?? -1) + 1

  const { error } = await supabase
    .from('playlist_songs')
    .insert({ playlist_id: playlistId, song_id: songId, position: nextPosition })

  if (error) {
    console.error('[addSongToPlaylist]', error.message) // log raw server-side
    // Strict allowlist on the error code for the one expected, user-correctable case.
    if (error.code === '23505') return { error: 'That song is already in this playlist.' }
    return { error: 'Could not add the song. Please try again.' } // user-safe
  }

  revalidatePath('/playlist/' + playlistId)
  return { data: undefined }
}
