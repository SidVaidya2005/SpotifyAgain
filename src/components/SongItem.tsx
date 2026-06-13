'use client'

import Image from 'next/image'
import { FiPlay } from 'react-icons/fi'
import { useLoadImage } from '@/hooks/useLoadImage'
import { LikeButton } from '@/components/LikeButton'
import { AddToPlaylistButton } from '@/components/AddToPlaylistButton'
import { VisibilityBadge } from '@/components/VisibilityBadge'
import type { Song } from '@/types'

interface SongItemProps {
  song: Song
  onClick: (id: string) => void
  // Library only: show a public/private chip under the author. Off by default so
  // Home/Liked/Search cards stay unchanged (is_public is the owner's own data).
  showVisibility?: boolean
}

export function SongItem({ song, onClick, showVisibility }: SongItemProps) {
  const imageUrl = useLoadImage(song)

  return (
    <div
      onClick={() => onClick(song.id)}
      className="group relative cursor-pointer rounded-lg bg-card p-4 transition duration-200 hover:-translate-y-1 hover:bg-card-2 hover:shadow-card-glow"
    >
      {/* Cover */}
      <div className="relative mb-4 aspect-square overflow-hidden rounded bg-surface-2">
        {imageUrl && (
          <Image
            src={imageUrl}
            alt={song.title}
            fill
            sizes="(max-width: 575px) 100vw, (max-width: 767px) 50vw, (max-width: 1023px) 33vw, (max-width: 1279px) 25vw, 20vw"
            className="object-cover"
          />
        )}

        {/* Add to playlist (top-left): hover-reveal. */}
        <AddToPlaylistButton songId={song.id} revealOnHover className="absolute left-1 top-1" />

        {/* Like (top-right): hover-reveal, but stays visible once liked. */}
        <LikeButton songId={song.id} revealOnHover className="absolute right-1 top-1" />

        {/* Hover Circular Play (DESIGN §4/§9) */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onClick(song.id)
          }}
          className="absolute bottom-2 right-2 flex h-12 w-12 translate-y-2 items-center justify-center rounded-full bg-accent text-black opacity-0 shadow-card transition hover:scale-105 hover:bg-accent-border group-hover:translate-y-0 group-hover:opacity-100"
          aria-label={`Play ${song.title}`}
        >
          <FiPlay className="h-5 w-5 fill-current" />
        </button>
      </div>

      {/* Title */}
      <p className="truncate font-bold text-text">{song.title}</p>

      {/* Author */}
      <p className="truncate text-sm text-muted">{song.author}</p>

      {/* Public/private indicator (Library only) */}
      {showVisibility && <VisibilityBadge isPublic={song.is_public} className="mt-2" />}
    </div>
  )
}
