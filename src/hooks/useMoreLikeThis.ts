'use client'

import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { usePlayer } from '@/stores/use-player'
import type { Song } from '@/types'

// Returns a handler that queues other songs by the current track's author right after it
// (browser client, RLS-scoped to public + own, excludes the current song). Queue-only —
// no DB write and no auth gate (anonymous visitors can play public songs). Mirrors the
// browser-client read pattern in useGetSongById.
export function useMoreLikeThis() {
  const addToQueueAfterActive = usePlayer((s) => s.addToQueueAfterActive)

  return async (song: Song) => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('songs')
      .select('*')
      .eq('author', song.author)
      .neq('id', song.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[useMoreLikeThis]', error.message)
      toast.error('Could not load more songs.')
      return
    }

    const ids = (data ?? []).map((s) => s.id)
    if (ids.length === 0) {
      toast(`No other songs by ${song.author}.`)
      return
    }

    addToQueueAfterActive(ids)
    toast.success(`Added ${ids.length} more by ${song.author} to your queue.`)
  }
}
