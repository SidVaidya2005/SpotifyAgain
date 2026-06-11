'use client'

import { AuthModal } from '@/components/modals/AuthModal'

// Single mount point for global modals. No mounted-guard needed: each modal's
// open state starts false on both server and client (Radix only portals content
// when open), so there's no hydration mismatch.
export function ModalProvider() {
  return (
    <>
      <AuthModal />
    </>
  )
}
