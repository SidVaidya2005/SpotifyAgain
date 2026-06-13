'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FiPlus } from 'react-icons/fi'
import { useUser } from '@/hooks/useUser'
import { usePlaylistModal } from '@/stores/use-playlist-modal'
import { useUserPlaylists } from '@/hooks/useUserPlaylists'
import { Tooltip } from '@/components/Tooltip'

// The signed-in user's playlists in the sidebar. Hidden for anonymous viewers.
// The "+" opens the shared modal in create mode; create/rename/delete all
// invalidate ['user-playlists'] so this list stays fresh. Names only fit in the
// full (lg) sidebar — the md icon-rail shows just the create button.
export function PlaylistList() {
  const pathname = usePathname()
  const { user } = useUser()
  const onOpenCreate = usePlaylistModal((s) => s.onOpenCreate)
  const { data: playlists } = useUserPlaylists()

  if (!user) return null

  return (
    <div className="mt-6 flex min-h-0 flex-1 flex-col px-4 lg:px-6">
      <div className="flex items-center justify-center gap-2 lg:justify-between">
        <span className="hidden text-xs font-bold uppercase tracking-wide text-muted lg:inline">
          Playlists
        </span>
        <Tooltip content="Create playlist">
          <button
            type="button"
            aria-label="Create playlist"
            onClick={onOpenCreate}
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition hover:text-text"
          >
            <FiPlus className="h-5 w-5" />
          </button>
        </Tooltip>
      </div>

      <nav className="mt-2 hidden space-y-1 overflow-y-auto lg:block">
        {(playlists ?? []).map((p) => {
          const href = '/playlist/' + p.id
          const isActive = pathname === href
          return (
            <Link
              key={p.id}
              href={href}
              title={p.title}
              className={`block truncate rounded px-2 py-2 text-sm transition ${
                isActive ? 'font-bold text-text' : 'text-muted hover:text-text'
              }`}
            >
              {p.title}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
