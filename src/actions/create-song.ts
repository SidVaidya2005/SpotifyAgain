'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ActionResult } from '@/types'

// The DB write for an upload. Files go straight to Storage client-side (the one
// client-side write); this action does the row insert so every DB write stays
// server-side and auth-checked (architecture.md → Invariants). Never trusts a
// client-passed user id — re-checks getUser() and inserts under user.id.
interface CreateSongInput {
  title: string
  author: string
  songPath: string
  imagePath: string
  isPublic: boolean
}

export async function createSong(input: CreateSongInput): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'You must be signed in to upload.' }

  const { data, error } = await supabase
    .from('songs')
    .insert({
      user_id: user.id,
      title: input.title,
      author: input.author,
      song_path: input.songPath,
      image_path: input.imagePath,
      is_public: input.isPublic,
    })
    .select('id')
    .single()

  if (error) {
    console.error('[createSong]', error.message) // log raw server-side
    return { error: 'Could not save the song. Please try again.' } // user-safe
  }

  // Effective once Feature 08 wires Home/Library to real reads.
  revalidatePath('/library')
  revalidatePath('/')
  return { data: { id: data.id } }
}
