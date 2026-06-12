'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ActionResult } from '@/types'

// Deletes a playlist the current user owns. RLS scopes the DELETE to the owner;
// the playlist's playlist_songs rows cascade away via the FK (architecture.md →
// Data Model). We still re-check getUser().
export async function deletePlaylist(id: string): Promise<ActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'You must be signed in to delete a playlist.' }

  const { error } = await supabase.from('playlists').delete().eq('id', id)

  if (error) {
    console.error('[deletePlaylist]', error.message) // log raw server-side
    return { error: 'Could not delete the playlist. Please try again.' } // user-safe
  }

  revalidatePath('/')
  return { data: undefined }
}
