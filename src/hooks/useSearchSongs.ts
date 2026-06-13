'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { sanitizeSearchQuery } from '@/lib/search'
import type { Song } from '@/types'

// Browser-client live search for the header dropdown. RLS-scoped (public to all, plus the
// signed-in viewer's own), capped to a few results. Mirrors the server `searchSongs` read
// but client-side, sharing the same sanitize. All setState lives in the async run() (a
// deferred callback), so it doesn't trip React 19's react-hooks/set-state-in-effect rule
// (same pattern as useGetSongById).
export function useSearchSongs(
  query: string,
  limit = 6,
): { results: Song[]; isLoading: boolean } {
  const [results, setResults] = useState<Song[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    let active = true

    const run = async () => {
      const q = sanitizeSearchQuery(query)
      if (!q) {
        setResults([])
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      const supabase = createClient()
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .or(`title.ilike.%${q}%,author.ilike.%${q}%`)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (!active) return
      if (error) {
        console.error('[useSearchSongs]', error.message)
        setResults([])
      } else {
        setResults(data ?? [])
      }
      setIsLoading(false)
    }

    void run()

    return () => {
      active = false
    }
  }, [query, limit])

  return { results, isLoading }
}
