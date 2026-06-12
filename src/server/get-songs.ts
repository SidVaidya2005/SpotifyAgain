import { createClient } from '@/lib/supabase/server'
import type { Song } from '@/types'

// Catalog read for Home. RLS returns public songs to everyone (incl. anonymous),
// plus the viewer's own rows — so a signed-in uploader also sees their own private
// songs here. Reads degrade gracefully: log and return [] rather than throw.
export async function getSongs(): Promise<Song[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('songs')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[getSongs]', error.message)
    return []
  }
  return data ?? []
}
