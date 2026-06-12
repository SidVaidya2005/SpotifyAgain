'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ActionResult } from '@/types'

// Toggle a like on/off for the signed-in user. The only DB write path for likes
// (architecture.md → Invariants: all DB writes go through Server Actions). Always
// re-checks getUser() and never trusts a client-passed user id; RLS additionally
// enforces that the song is visible (public OR own) on INSERT.
export async function toggleLike(
  songId: string,
): Promise<ActionResult<{ liked: boolean }>> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'You must be signed in to like songs.' }

  const { data: existing } = await supabase
    .from('liked_songs')
    .select('song_id')
    .eq('user_id', user.id)
    .eq('song_id', songId)
    .maybeSingle()

  if (existing) {
    const { error } = await supabase
      .from('liked_songs')
      .delete()
      .eq('user_id', user.id)
      .eq('song_id', songId)
    if (error) {
      console.error('[toggleLike]', error.message) // log raw server-side
      return { error: 'Could not update your like. Please try again.' } // user-safe
    }
    revalidatePath('/liked')
    return { data: { liked: false } }
  }

  const { error } = await supabase
    .from('liked_songs')
    .insert({ user_id: user.id, song_id: songId })
  if (error) {
    console.error('[toggleLike]', error.message)
    return { error: 'Could not update your like. Please try again.' }
  }
  revalidatePath('/liked')
  return { data: { liked: true } }
}
