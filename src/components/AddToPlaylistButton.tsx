'use client'

import { MdPlaylistAdd } from 'react-icons/md'
import { useUser } from '@/hooks/useUser'
import { useAddToPlaylistModal } from '@/stores/use-add-to-playlist-modal'
import { useAuthModal } from '@/stores/use-auth-modal'
import { cn } from '@/lib/utils'

interface AddToPlaylistButtonProps {
  songId: string
  className?: string
  // On cards: hide until the card is hovered (the player bar leaves this off — its
  // control is always shown). Mirrors LikeButton.
  revealOnHover?: boolean
}

// "Add to playlist" affordance on song cards and the player bar. Opens the
// AddToPlaylistModal for this song when signed in; an anonymous click opens the
// AuthModal instead (same gate as LikeButton). stopPropagation so it never also
// triggers card-play.
export function AddToPlaylistButton({ songId, className, revealOnHover }: AddToPlaylistButtonProps) {
  const { user } = useUser()
  const addModal = useAddToPlaylistModal()
  const authModal = useAuthModal()

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!user) {
      authModal.onOpen()
      return
    }
    addModal.onOpen(songId)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Add to playlist"
      className={cn(
        'flex h-11 w-11 items-center justify-center text-muted transition hover:scale-105 hover:text-text',
        revealOnHover && 'opacity-0 focus:opacity-100 group-hover:opacity-100',
        className,
      )}
    >
      <MdPlaylistAdd className="h-5 w-5" />
    </button>
  )
}
