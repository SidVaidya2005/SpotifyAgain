'use client'

import { SongItem } from '@/components/SongItem'
import { useOnPlay } from '@/hooks/useOnPlay'
import type { Song } from '@/types'

interface SongGridProps {
  songs: Song[]
  emptyMessage?: string
  // Pass through to each card to show a public/private chip (Library only).
  showVisibility?: boolean
}

// Shared responsive song grid (1→2→3→4→5 cols across xs/sm/md/lg/xl). Client
// component so it can wire playback: clicking a card plays the song and sets the
// queue to this grid's songs. Reused by Home and Library (and later
// Liked/Search/Playlist). Server pages render it fine — Song[] is serializable.
export function SongGrid({ songs, emptyMessage = 'No songs yet.', showVisibility }: SongGridProps) {
  const onPlay = useOnPlay(songs)

  if (songs.length === 0) {
    return <p className="text-sm text-muted">{emptyMessage}</p>
  }

  return (
    <div className="grid grid-cols-1 gap-4 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {songs.map((song) => (
        <SongItem key={song.id} song={song} onClick={onPlay} showVisibility={showVisibility} />
      ))}
    </div>
  )
}
