'use client'

import { useUser } from '@/hooks/useUser'
import { useAuthModal } from '@/stores/use-auth-modal'
import { Button } from '@/components/Button'
import { UserMenu } from '@/components/UserMenu'

export function Header() {
  const { user } = useUser()
  const authModal = useAuthModal()

  return (
    <header className="flex shrink-0 items-center px-6 py-4">
      {/* Wordmark only below md, where the sidebar (which carries it) is hidden. */}
      <span className="text-xl font-bold text-accent md:hidden">SpotifyAgain</span>

      <div className="ml-auto flex items-center gap-3">
        {user ? (
          // Signed in: avatar + account dropdown (sign-out). Reachable at every
          // breakpoint since the sidebar is hidden below md.
          <UserMenu user={user} />
        ) : (
          <Button variant="pill" onClick={authModal.onOpen}>
            Log in
          </Button>
        )}
      </div>
    </header>
  )
}
