'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { FiHome, FiSearch, FiMusic, FiHeart } from 'react-icons/fi'
import { useUser } from '@/hooks/useUser'

const navItems = [
  { label: 'Home', href: '/', icon: FiHome },
  { label: 'Search', href: '/search', icon: FiSearch },
  { label: 'Library', href: '/library', icon: FiMusic },
]

export function BottomNav() {
  const pathname = usePathname()
  const { user } = useUser()

  // Liked Songs is a personal page — only surface it when signed in.
  const items = user
    ? [...navItems, { label: 'Liked Songs', href: '/liked', icon: FiHeart }]
    : navItems

  return (
    <nav className="fixed bottom-24 left-0 right-0 flex justify-around bg-surface py-4 shadow-[0_-1px_0_var(--color-base)] md:hidden">
      {items.map(({ label, href, icon: Icon }) => {
        const isActive = pathname === href || pathname.startsWith(href + '/')
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center justify-center p-3 transition ${
              isActive ? 'text-accent' : 'text-muted hover:text-text'
            }`}
            title={label}
          >
            <Icon className="h-6 w-6" />
          </Link>
        )
      })}
    </nav>
  )
}
