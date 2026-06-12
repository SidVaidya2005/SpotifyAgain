'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Song } from '@/types'

// Resolves the active track from its id for the layout-mounted player. The store
// holds only ids (it must not hold domain data), so the player fetches the Song
// here via the browser client — RLS scopes visibility (public to anyone, private
// to the owner). React Query is deferred to Feature 11, so this is a plain effect.
export function useGetSongById(id?: string): { song?: Song; isLoading: boolean } {
  const [song, setSong] = useState<Song | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    let active = true

    // All setState lives inside this async function (deferred), so it does not
    // trip React 19's react-hooks/set-state-in-effect rule the way a synchronous
    // setState in the effect body would.
    const run = async () => {
      if (!id) {
        setSong(undefined)
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      const supabase = createClient()
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .eq('id', id)
        .single()

      if (!active) return
      if (error) {
        console.error('[useGetSongById]', error.message)
        setSong(undefined)
      } else {
        setSong(data)
      }
      setIsLoading(false)
    }

    void run()

    return () => {
      active = false
    }
  }, [id])

  return { song, isLoading }
}
