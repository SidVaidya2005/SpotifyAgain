'use client'

import { useContext } from 'react'
import { UserContext } from '@/providers/UserProvider'

// Client-side current user. Reads from UserProvider's context (seeded by the
// server, kept live via onAuthStateChange); never fetches data itself.
export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
