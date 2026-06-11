'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { FiHome, FiSearch, FiMusic } from 'react-icons/fi'

const navItems = [
  { label: 'Home', href: '/', icon: FiHome },
  { label: 'Search', href: '/search', icon: FiSearch },
  { label: 'Library', href: '/library', icon: FiMusic },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <>
      {/* Full sidebar at lg+, icon rail at md, hidden below */}
      <aside className="hidden w-64 flex-col border-r border-border bg-surface md:flex md:w-24 lg:w-64">
        {/* Wordmark */}
        <div className="flex items-center justify-center px-6 py-8 lg:justify-start">
          <span className="hidden text-2xl font-bold text-accent lg:block">SpotifyAgain</span>
          <span className="flex items-center justify-center text-2xl font-bold text-accent md:block lg:hidden">♫</span>
        </div>

        {/* Nav items */}
        <nav className="space-y-4 px-4 lg:px-6">
          {navItems.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-4 rounded-pill px-4 py-3 transition ${
                  isActive
                    ? 'bg-surface-2 text-text font-bold'
                    : 'text-muted hover:text-text'
                }`}
              >
                <Icon className="h-6 w-6 flex-shrink-0" />
                <span className="hidden text-sm font-bold lg:inline">{label}</span>
              </Link>
            )
          })}
        </nav>
      </aside>
    </>
  )
}
