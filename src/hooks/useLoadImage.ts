'use client'

import { useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { STORAGE_BUCKETS } from '@/lib/constants'
import type { Song } from '@/types'

// Resolves the public URL of a song's cover image. Synchronous like
// useLoadSongUrl. Returns null when no song so callers can fall back to a
// placeholder. The Supabase Storage host is already in next.config.ts
// images.remotePatterns, so the URL renders through <Image>.
export function useLoadImage(song?: Song): string | null {
  return useMemo(() => {
    if (!song) return null
    const supabase = createClient()
    const { data } = supabase.storage
      .from(STORAGE_BUCKETS.images)
      .getPublicUrl(song.image_path)
    return data.publicUrl
  }, [song])
}
