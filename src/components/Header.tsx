'use client'

import Link from 'next/link'
import { FiPlus } from 'react-icons/fi'
import { MdPlaylistAdd } from 'react-icons/md'
import { useUser } from '@/hooks/useUser'
import { useAuthModal } from '@/stores/use-auth-modal'
import { useUploadModal } from '@/stores/use-upload-modal'
import { usePlaylistModal } from '@/stores/use-playlist-modal'
import { Button } from '@/components/Button'
import { UserMenu } from '@/components/UserMenu'
import { Tooltip } from '@/components/Tooltip'
import { HeaderSearch } from '@/components/HeaderSearch'

export function Header() {
  const { user } = useUser()
  const authModal = useAuthModal()
  const uploadModal = useUploadModal()
  const playlistModal = usePlaylistModal()

  // Pinned top bar (DESIGN §10.1): logo (left) · search · actions (right). The wordmark now
  // lives here (the sidebar dropped it); the translucent bg + soft seam add depth.
  return (
    <header className="fixed inset-x-0 top-0 z-30 flex h-16 items-center gap-2 bg-base/80 px-4 shadow-[0_1px_0_var(--color-surface)] backdrop-blur-md md:gap-4 md:px-6">
      {/* App wordmark — the single home for the logo (all sizes). */}
      <Link href="/" className="shrink-0 text-lg font-bold text-accent md:text-xl">
        SpotifyAgain
      </Link>

      {/* Persistent live search — takes the available width, center-left. */}
      <div className="min-w-0 flex-1">
        <HeaderSearch />
      </div>

      <div className="flex shrink-0 items-center gap-3">
        {user ? (
          <>
            <Tooltip content="Create playlist">
              <button
                type="button"
                aria-label="Create playlist"
                onClick={playlistModal.onOpenCreate}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-2 text-text transition hover:scale-105 hover:text-accent hover:shadow-glow focus-visible:shadow-glow focus-visible:outline-none"
              >
                <MdPlaylistAdd className="h-5 w-5" />
              </button>
            </Tooltip>
            <Tooltip content="Upload song">
              <button
                type="button"
                aria-label="Upload song"
                onClick={uploadModal.onOpen}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-2 text-text transition hover:scale-105 hover:text-accent hover:shadow-glow focus-visible:shadow-glow focus-visible:outline-none"
              >
                <FiPlus className="h-5 w-5" />
              </button>
            </Tooltip>
            <UserMenu user={user} />
          </>
        ) : (
          <Button variant="pill" onClick={authModal.onOpen}>
            Log in
          </Button>
        )}
      </div>
    </header>
  )
}
