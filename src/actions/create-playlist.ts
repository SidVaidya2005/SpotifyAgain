'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ActionResult } from '@/types'

// Creates a new (empty) playlist owned by the current user. Re-checks getUser()
// and inserts under user.id — never trusts a client-passed id (architecture.md →
// Invariants). Tracks are added later (Feature 14).
export async function createPlaylist(title: string): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'You must be signed in to create a playlist.' }

  const name = title.trim()
  if (!name) return { error: 'Please enter a playlist name.' }

  const { data, error } = await supabase
    .from('playlists')
    .insert({ user_id: user.id, title: name })
    .select('id')
    .single()

  if (error) {
    console.error('[createPlaylist]', error.message) // log raw server-side
    return { error: 'Could not create the playlist. Please try again.' } // user-safe
  }

  revalidatePath('/')
  return { data: { id: data.id } }
}
