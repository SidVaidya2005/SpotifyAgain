'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { FiHome, FiSearch, FiMusic, FiHeart } from 'react-icons/fi'
import { useUser } from '@/hooks/useUser'
import { useAuthModal } from '@/stores/use-auth-modal'
import { PlaylistList } from '@/components/PlaylistList'
import { PortfolioLinks } from '@/components/PortfolioLinks'
import { Tooltip } from '@/components/Tooltip'

// requiresAuth items (Library, Liked Songs) are shown to everyone but prompt sign-in for
// anon instead of navigating — the proxy would otherwise just bounce them back to Home.
const navItems = [
  { label: 'Home', href: '/', icon: FiHome, requiresAuth: false },
  { label: 'Search', href: '/search', icon: FiSearch, requiresAuth: false },
  { label: 'Library', href: '/library', icon: FiMusic, requiresAuth: true },
  { label: 'Liked Songs', href: '/liked', icon: FiHeart, requiresAuth: true },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user } = useUser()
  const authModal = useAuthModal()

  // Full sidebar at lg+, icon rail at md, hidden below md (BottomNav takes over).
  // Fixed between the header (top-16) and the player bar (bottom-24) — not full height
  // (DESIGN §10.1); scrolls internally if the playlist list overflows. Separated from the
  // main area by the bg-surface/bg-base shade contrast — no gray border.
  return (
    <aside className="fixed left-0 top-16 bottom-24 z-20 hidden w-64 flex-col overflow-y-auto bg-surface md:flex md:w-24 lg:w-64">
      {/* Nav items (the wordmark now lives in the Header — DESIGN §10.1). */}
      <nav className="space-y-4 px-4 pt-6 lg:px-6">
        {navItems.map(({ label, href, icon: Icon, requiresAuth }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          const className = `flex items-center justify-center gap-4 rounded-pill px-4 py-3 transition lg:justify-start ${
            isActive ? 'bg-surface-2 text-text font-bold' : 'text-muted hover:text-text'
          }`
          const inner = (
            <>
              <Icon className="h-6 w-6 flex-shrink-0" />
              <span className="hidden text-sm font-bold lg:inline">{label}</span>
            </>
          )
          // Tooltip is rail-only (lg:hidden) — at lg the text label is already visible.
          // requiresAuth items open the sign-in modal for anon instead of navigating.
          return (
            <Tooltip key={href} content={label} side="right" className="lg:hidden">
              {requiresAuth && !user ? (
                <button
                  type="button"
                  aria-label={label}
                  onClick={authModal.onOpen}
                  className={className}
                >
                  {inner}
                </button>
              ) : (
                <Link href={href} aria-label={label} className={className}>
                  {inner}
                </Link>
              )}
            </Tooltip>
          )
        })}
      </nav>

      {/* The user's playlists (signed-in only); hidden for anon. */}
      <PlaylistList />

      {/* Author/portfolio links pinned to the bottom — mt-auto keeps them at the
          base whether or not PlaylistList renders (it returns null for anon).
          Full credit + icons on the lg sidebar; icons-only on the md rail. */}
      <div className="mt-auto px-4 py-6 lg:px-6">
        <PortfolioLinks variant="full" className="hidden lg:flex" />
        <PortfolioLinks variant="compact" className="items-center lg:hidden" />
      </div>
    </aside>
  )
}
