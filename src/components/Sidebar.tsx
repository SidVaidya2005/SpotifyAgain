'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { FiHome, FiSearch, FiMusic, FiHeart } from 'react-icons/fi'
import { useUser } from '@/hooks/useUser'
import { PlaylistList } from '@/components/PlaylistList'
import { PortfolioLinks } from '@/components/PortfolioLinks'
import { Tooltip } from '@/components/Tooltip'

const navItems = [
  { label: 'Home', href: '/', icon: FiHome },
  { label: 'Search', href: '/search', icon: FiSearch },
  { label: 'Library', href: '/library', icon: FiMusic },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user } = useUser()

  // Liked Songs is a personal page — only surface it when signed in.
  const items = user
    ? [...navItems, { label: 'Liked Songs', href: '/liked', icon: FiHeart }]
    : navItems

  // Full sidebar at lg+, icon rail at md, hidden below md (BottomNav takes over).
  // Separated from the main area by the bg-surface/bg-base shade contrast — no gray border.
  return (
    <aside className="hidden w-64 flex-col bg-surface pb-24 md:flex md:w-24 lg:w-64">
      {/* Wordmark */}
      <div className="flex items-center justify-center px-6 py-8 lg:justify-start">
        <span className="hidden text-2xl font-bold text-accent lg:block">SpotifyAgain</span>
        <span className="text-2xl font-bold text-accent lg:hidden">♫</span>
      </div>

      {/* Nav items */}
      <nav className="space-y-4 px-4 lg:px-6">
        {items.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          return (
            // Tooltip is rail-only (lg:hidden) — at lg the text label is already visible.
            <Tooltip key={href} content={label} side="right" className="lg:hidden">
              <Link
                href={href}
                aria-label={label}
                className={`flex items-center justify-center gap-4 rounded-pill px-4 py-3 transition lg:justify-start ${
                  isActive
                    ? 'bg-surface-2 text-text font-bold'
                    : 'text-muted hover:text-text'
                }`}
              >
                <Icon className="h-6 w-6 flex-shrink-0" />
                <span className="hidden text-sm font-bold lg:inline">{label}</span>
              </Link>
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
