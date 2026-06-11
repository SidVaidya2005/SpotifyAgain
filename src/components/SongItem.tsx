import type { Song } from '@/types'

interface SongItemProps {
  song: Song
}

export function SongItem({ song }: SongItemProps) {
  return (
    <div className="group cursor-pointer rounded-lg bg-card p-4 transition hover:bg-card-2">
      {/* Cover placeholder */}
      <div className="mb-4 aspect-square rounded bg-surface-2" />

      {/* Title */}
      <p className="truncate font-bold text-text">{song.title}</p>

      {/* Author */}
      <p className="truncate text-sm text-muted">{song.author}</p>
    </div>
  )
}
