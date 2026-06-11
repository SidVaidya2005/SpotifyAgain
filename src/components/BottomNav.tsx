'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { FiHome, FiSearch, FiMusic } from 'react-icons/fi'

const navItems = [
  { label: 'Home', href: '/', icon: FiHome },
  { label: 'Search', href: '/search', icon: FiSearch },
  { label: 'Library', href: '/library', icon: FiMusic },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-24 left-0 right-0 flex justify-around border-t border-border bg-surface py-4 lg:hidden md:hidden">
      {navItems.map(({ label, href, icon: Icon }) => {
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
