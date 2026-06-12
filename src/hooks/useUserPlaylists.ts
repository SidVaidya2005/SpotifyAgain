'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/hooks/useUser'

export interface UserPlaylist {
  id: string
  title: string
}

// The current user's playlists for the sidebar list, as one shared React Query
// cache keyed ['user-playlists']. The create/rename/delete callers invalidate
// this key so the sidebar stays fresh. Only runs when signed in (RLS scopes to
// the owner anyway); never throws to the component.
export function useUserPlaylists() {
  const { user } = useUser()

  return useQuery({
    queryKey: ['user-playlists'],
    enabled: !!user,
    queryFn: async (): Promise<UserPlaylist[]> => {
      if (!user) return []
      const supabase = createClient()
      const { data, error } = await supabase
        .from('playlists')
        .select('id, title')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (error) {
        console.error('[useUserPlaylists]', error.message)
        return []
      }
      return data ?? []
    },
  })
}
