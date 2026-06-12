'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { FiLogOut } from 'react-icons/fi'
import { toast } from 'sonner'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

interface UserMenuProps {
  user: User
}

export function UserMenu({ user }: UserMenuProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // user_metadata is loosely typed (Record<string, any>); read defensively.
  const meta = user.user_metadata ?? {}
  const avatarUrl = typeof meta.avatar_url === 'string' ? meta.avatar_url : null
  const name =
    (typeof meta.full_name === 'string' ? meta.full_name : null) ?? user.email ?? 'Account'
  const initial = name.charAt(0).toUpperCase()

  // Close the menu on outside-click or Escape. The effect only attaches/detaches
  // listeners; state is set inside the handlers (not synchronously in the effect),
  // so it doesn't trip React 19's set-state-in-effect rule.
  useEffect(() => {
    if (!open) return

    const onPointerDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const onSignOut = async () => {
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('[UserMenu]', error.message)
      toast.error('Could not sign out. Please try again.')
      return
    }
    // UserProvider's onAuthStateChange also clears the client user; refresh re-runs
    // the server layout so its getUser() seed (and any personal page) re-evaluates.
    setOpen(false)
    router.push('/')
    router.refresh()
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Account menu"
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-surface-2 text-sm font-bold text-text transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text"
      >
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt=""
            width={36}
            height={36}
            className="h-9 w-9 rounded-full object-cover"
          />
        ) : (
          initial
        )}
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Account"
          className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-md bg-card py-1 shadow-dialog"
        >
          <p className="truncate px-4 py-2 text-xs text-muted" title={name}>
            {name}
          </p>
          <button
            type="button"
            role="menuitem"
            onClick={onSignOut}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-bold text-text transition hover:bg-surface-2"
          >
            <FiLogOut className="h-4 w-4 flex-shrink-0" />
            Log out
          </button>
        </div>
      )}
    </div>
  )
}
