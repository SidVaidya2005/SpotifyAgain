'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { FiHome, FiSearch, FiMusic, FiHeart } from 'react-icons/fi'
import { useUser } from '@/hooks/useUser'
import { useAuthModal } from '@/stores/use-auth-modal'

// requiresAuth items (Library, Liked Songs) are shown to everyone but prompt sign-in for
// anon instead of navigating — the proxy would otherwise just bounce them back to Home.
const navItems = [
  { label: 'Home', href: '/', icon: FiHome, requiresAuth: false },
  { label: 'Search', href: '/search', icon: FiSearch, requiresAuth: false },
  { label: 'Library', href: '/library', icon: FiMusic, requiresAuth: true },
  { label: 'Liked Songs', href: '/liked', icon: FiHeart, requiresAuth: true },
]

export function BottomNav() {
  const pathname = usePathname()
  const { user } = useUser()
  const authModal = useAuthModal()

  return (
    <nav className="fixed bottom-24 left-0 right-0 z-30 flex justify-around bg-surface py-4 shadow-[0_-1px_0_var(--color-base)] md:hidden">
      {navItems.map(({ label, href, icon: Icon, requiresAuth }) => {
        const isActive = pathname === href || pathname.startsWith(href + '/')
        const className = `flex items-center justify-center p-3 transition ${
          isActive ? 'text-accent' : 'text-muted hover:text-text'
        }`
        // requiresAuth items open the sign-in modal for anon instead of navigating.
        if (requiresAuth && !user) {
          return (
            <button
              key={href}
              type="button"
              onClick={authModal.onOpen}
              className={className}
              title={label}
              aria-label={label}
            >
              <Icon className="h-6 w-6" />
            </button>
          )
        }
        return (
          <Link key={href} href={href} className={className} title={label} aria-label={label}>
            <Icon className="h-6 w-6" />
          </Link>
        )
      })}
    </nav>
  )
}
