'use client'

import { useUser } from '@/hooks/useUser'
import { useAuthModal } from '@/stores/use-auth-modal'
import { Button } from '@/components/Button'

export function Header() {
  const { user } = useUser()
  const authModal = useAuthModal()

  const initial = (user?.email ?? '?').charAt(0).toUpperCase()

  return (
    <header className="flex shrink-0 items-center px-6 py-4">
      {/* Wordmark only below md, where the sidebar (which carries it) is hidden. */}
      <span className="text-xl font-bold text-accent md:hidden">SpotifyAgain</span>

      <div className="ml-auto flex items-center gap-3">
        {user ? (
          // Minimal signed-in indicator for Feature 04; avatar + sign-out menu
          // arrive in Feature 05.
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-2 text-sm font-bold text-text"
            title={user.email ?? 'Signed in'}
            aria-label={`Signed in as ${user.email ?? 'user'}`}
          >
            {initial}
          </div>
        ) : (
          <Button variant="pill" onClick={authModal.onOpen}>
            Log in
          </Button>
        )}
      </div>
    </header>
  )
}
