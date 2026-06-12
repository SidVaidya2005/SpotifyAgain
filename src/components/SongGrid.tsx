import { SongItem } from '@/components/SongItem'
import type { Song } from '@/types'

interface SongGridProps {
  songs: Song[]
  emptyMessage?: string
}

// Shared responsive song grid (1→2→3→4→5 cols across xs/sm/md/lg/xl). Presentational
// and Server-renderable; reused by Home and Library (and later Liked/Search/Playlist).
export function SongGrid({ songs, emptyMessage = 'No songs yet.' }: SongGridProps) {
  if (songs.length === 0) {
    return <p className="text-sm text-muted">{emptyMessage}</p>
  }

  return (
    <div className="grid grid-cols-1 gap-4 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {songs.map((song) => (
        <SongItem key={song.id} song={song} />
      ))}
    </div>
  )
}
