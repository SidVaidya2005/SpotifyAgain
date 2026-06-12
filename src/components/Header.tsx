'use client'

import { FiPlus } from 'react-icons/fi'
import { useUser } from '@/hooks/useUser'
import { useAuthModal } from '@/stores/use-auth-modal'
import { useUploadModal } from '@/stores/use-upload-modal'
import { Button } from '@/components/Button'
import { UserMenu } from '@/components/UserMenu'

export function Header() {
  const { user } = useUser()
  const authModal = useAuthModal()
  const uploadModal = useUploadModal()

  return (
    <header className="flex shrink-0 items-center px-6 py-4">
      {/* Wordmark only below md, where the sidebar (which carries it) is hidden. */}
      <span className="text-xl font-bold text-accent md:hidden">SpotifyAgain</span>

      <div className="ml-auto flex items-center gap-3">
        {user ? (
          // Signed in: upload trigger + avatar/account dropdown. Both reachable at
          // every breakpoint since the sidebar is hidden below md. (The upload
          // entry point moves into the Library page at Feature 08/12.)
          <>
            <button
              type="button"
              aria-label="Upload song"
              onClick={uploadModal.onOpen}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-2 text-text transition hover:scale-105 hover:text-accent"
            >
              <FiPlus className="h-5 w-5" />
            </button>
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
