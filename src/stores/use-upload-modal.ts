import { create } from 'zustand'

// Ephemeral UI state for the upload dialog (architecture.md → Invariants: stores
// never touch Supabase). Same minimal shape as use-auth-modal.
interface UploadModalState {
  isOpen: boolean
  onOpen: () => void
  onClose: () => void
}

export const useUploadModal = create<UploadModalState>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}))
