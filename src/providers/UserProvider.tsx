'use client'

import { createContext, useEffect, useMemo, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

interface UserContextValue {
  user: User | null
}

export const UserContext = createContext<UserContextValue | undefined>(undefined)

interface UserProviderProps {
  initialUser: User | null
  children: React.ReactNode
}

export function UserProvider({ initialUser, children }: UserProviderProps) {
  // One browser client per provider lifetime.
  const supabase = useMemo(() => createClient(), [])
  // Seeded from the server (layout.tsx getUser) so the first paint is already
  // correct — no logged-out → logged-in flicker on the Header.
  const [user, setUser] = useState<User | null>(initialUser)

  useEffect(() => {
    // Keep client state in sync with later auth events. OAuth sign-in completes
    // via a full-page redirect; sign-out (UserMenu) fires SIGNED_OUT here, which
    // clears the user — the Header then swaps back to the "Log in" pill.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [supabase])

  return <UserContext.Provider value={{ user }}>{children}</UserContext.Provider>
}
