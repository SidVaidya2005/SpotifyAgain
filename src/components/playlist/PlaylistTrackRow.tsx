'use client'

import Image from 'next/image'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { MdDragIndicator } from 'react-icons/md'
import { FiX } from 'react-icons/fi'
import { useLoadImage } from '@/hooks/useLoadImage'
import { LikeButton } from '@/components/LikeButton'
import { cn } from '@/lib/utils'
import type { Song } from '@/types'

interface PlaylistTrackRowProps {
  song: Song
  index: number
  onPlay: (id: string) => void
  onRemove: (id: string) => void
  disabled?: boolean
}

// One sortable track row. The drag handle carries the dnd-kit attributes/listeners
// (touch-none so a touch-drag starting on the handle won't scroll the page);
// clicking the cover/title plays the song (queue = playlist order, set by the
// parent list). Like + remove are separate controls — remove hover-reveals.
export function PlaylistTrackRow({ song, index, onPlay, onRemove, disabled }: PlaylistTrackRowProps) {
  const imageUrl = useLoadImage(song)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: song.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(
        'group flex items-center gap-2 rounded-md px-2 py-2 transition hover:bg-surface-2 md:gap-3',
        isDragging && 'relative z-10 bg-surface-2 shadow-card',
      )}
    >
      <button
        type="button"
        aria-label="Drag to reorder"
        className="flex h-11 w-7 flex-shrink-0 touch-none cursor-grab items-center justify-center text-muted transition hover:text-text active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <MdDragIndicator className="h-5 w-5" />
      </button>

      <span className="w-5 flex-shrink-0 text-center text-sm tabular-nums text-muted">
        {index + 1}
      </span>

      <button
        type="button"
        onClick={() => onPlay(song.id)}
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
      >
        <span className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded bg-surface-2">
          {imageUrl && (
            <Image src={imageUrl} alt={song.title} fill sizes="40px" className="object-cover" />
          )}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-bold text-text">{song.title}</span>
          <span className="block truncate text-xs text-muted">{song.author}</span>
        </span>
      </button>

      <LikeButton songId={song.id} className="flex-shrink-0" />

      <button
        type="button"
        aria-label="Remove from playlist"
        disabled={disabled}
        onClick={(e) => {
          e.stopPropagation()
          onRemove(song.id)
        }}
        className="flex h-11 w-11 flex-shrink-0 items-center justify-center text-muted opacity-0 transition hover:text-negative focus:opacity-100 group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <FiX className="h-5 w-5" />
      </button>
    </li>
  )
}
