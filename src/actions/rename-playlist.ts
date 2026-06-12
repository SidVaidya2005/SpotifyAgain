'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ActionResult } from '@/types'

// Renames a playlist the current user owns. RLS scopes the UPDATE to the owner,
// so a non-owner's update simply affects zero rows; we still re-check getUser().
export async function renamePlaylist(id: string, title: string): Promise<ActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'You must be signed in to rename a playlist.' }

  const name = title.trim()
  if (!name) return { error: 'Please enter a playlist name.' }

  const { error } = await supabase.from('playlists').update({ title: name }).eq('id', id)

  if (error) {
    console.error('[renamePlaylist]', error.message) // log raw server-side
    return { error: 'Could not rename the playlist. Please try again.' } // user-safe
  }

  revalidatePath('/playlist/' + id)
  revalidatePath('/')
  return { data: undefined }
}
