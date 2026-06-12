'use client'

import { usePlayer } from '@/stores/use-player'
import type { Song } from '@/types'

// Returns a click handler that starts a song and sets the queue to the list it
// was launched from. No auth gate — anonymous visitors may play public songs
// (project-overview.md). Pass the full list rendered in the surface (e.g. all of
// Home's songs) so next/previous (Feature 10) can walk it.
export function useOnPlay(songs: Song[]) {
  const setId = usePlayer((s) => s.setId)
  const setIds = usePlayer((s) => s.setIds)

  return (id: string) => {
    setId(id)
    setIds(songs.map((song) => song.id))
  }
}
