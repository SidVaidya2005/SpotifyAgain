import { create } from 'zustand'

// Ephemeral UI state for the auth dialog (architecture.md → Invariants: stores
// never touch Supabase). Carries no `next` path — AuthModal reads the current
// path itself via usePathname() at sign-in time.
interface AuthModalState {
  isOpen: boolean
  onOpen: () => void
  onClose: () => void
}

export const useAuthModal = create<AuthModalState>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}))
