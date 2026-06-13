import { createClient } from '@/lib/supabase/server'
import { sanitizeSearchQuery } from '@/lib/search'
import type { Song } from '@/types'

export async function searchSongs(query: string): Promise<Song[]> {
  const supabase = await createClient()
  // Sanitize before interpolating into the .or() filter (see lib/search.ts).
  const q = sanitizeSearchQuery(query)
  if (!q) return []

  const { data, error } = await supabase
    .from('songs')
    .select('*')
    // match the sanitized query against BOTH title and author (RLS still limits to visible songs)
    .or(`title.ilike.%${q}%,author.ilike.%${q}%`)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[searchSongs]', error.message)
    return []
  }
  return data ?? []
}
