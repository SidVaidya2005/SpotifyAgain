'use client'

import { FiHeart } from 'react-icons/fi'
import { useUser } from '@/hooks/useUser'
import { useLikedSongs } from '@/hooks/useLikedSongs'
import { useToggleLike } from '@/hooks/useToggleLike'
import { useAuthModal } from '@/stores/use-auth-modal'
import { cn } from '@/lib/utils'

interface LikeButtonProps {
  songId: string
  className?: string
  // On cards: hide the heart until the card is hovered — but keep it visible when
  // the song IS liked, so likes are recognizable at a glance. The player bar
  // leaves this off (its heart is always shown).
  revealOnHover?: boolean
}

// Heart toggle shown on song cards (hover) and in the player bar (always). Filled
// accent-green when the song is in the user's likes, muted outline otherwise. An
// anonymous click opens the AuthModal instead of liking. All instances share the
// one ['liked-songs'] query, so they stay in sync and the toggle is optimistic.
export function LikeButton({ songId, className, revealOnHover }: LikeButtonProps) {
  const { user } = useUser()
  const { data: likedIds } = useLikedSongs()
  const { mutate } = useToggleLike(songId)
  const authModal = useAuthModal()

  const isLiked = !!likedIds?.includes(songId)

  const handleClick = (e: React.MouseEvent) => {
    // Never let a like toggle also trigger card-play.
    e.stopPropagation()
    if (!user) {
      authModal.onOpen()
      return
    }
    mutate()
  }

  return (
    <button
      onClick={handleClick}
      aria-label={isLiked ? 'Remove from your likes' : 'Add to your likes'}
      aria-pressed={isLiked}
      className={cn(
        'flex h-11 w-11 items-center justify-center transition hover:scale-105',
        // Hover-reveal on cards, but always show a heart that's already liked.
        revealOnHover && !isLiked && 'opacity-0 focus:opacity-100 group-hover:opacity-100',
        className,
      )}
    >
      <FiHeart
        className={cn(
          'h-5 w-5 transition',
          isLiked ? 'fill-accent text-accent' : 'fill-none text-muted hover:text-text',
        )}
      />
    </button>
  )
}
