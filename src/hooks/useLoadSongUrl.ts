'use client'

import { useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { STORAGE_BUCKETS } from '@/lib/constants'
import type { Song } from '@/types'

// Resolves the public URL of a song's audio object. getPublicUrl is synchronous,
// so this is a memoized derivation, not an effect. Returns '' when no song.
export function useLoadSongUrl(song?: Song): string {
  return useMemo(() => {
    if (!song) return ''
    const supabase = createClient()
    const { data } = supabase.storage
      .from(STORAGE_BUCKETS.songs)
      .getPublicUrl(song.song_path)
    return data.publicUrl
  }, [song])
}
