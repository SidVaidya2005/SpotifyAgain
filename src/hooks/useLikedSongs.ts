'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/hooks/useUser'

// The current user's liked song ids, as one shared React Query cache keyed
// ['liked-songs']. Every LikeButton derives its filled/outline state from this
// list, and the toggle mutation flips/invalidates this same key. Only runs when
// signed in (RLS would return nothing for an anon anyway); anon hearts stay
// outline. Returns a string[] of song ids; never throws to the component.
export function useLikedSongs() {
  const { user } = useUser()

  return useQuery({
    queryKey: ['liked-songs'],
    enabled: !!user,
    queryFn: async (): Promise<string[]> => {
      if (!user) return []
      const supabase = createClient()
      const { data, error } = await supabase
        .from('liked_songs')
        .select('song_id')
        .eq('user_id', user.id)
      if (error) {
        console.error('[useLikedSongs]', error.message)
        return []
      }
      return data.map((row) => row.song_id)
    },
  })
}
