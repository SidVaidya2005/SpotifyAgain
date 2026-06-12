import { createClient } from '@/lib/supabase/server'
import type { Song } from '@/types'

export async function searchSongs(query: string): Promise<Song[]> {
  const supabase = await createClient()
  // Strip characters that have meaning in PostgREST's filter grammar ( , ( ) * : " \ )
  // and escape ilike wildcards (% _), so user input can't break or extend the .or() filter.
  const q = query.replace(/[,()*:"\\]/g, ' ').replace(/[%_]/g, '\\$&').trim()
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
