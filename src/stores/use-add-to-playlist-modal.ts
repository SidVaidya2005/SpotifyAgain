import { create } from 'zustand'

// Ephemeral UI state for the "add to playlist" dialog (architecture.md → Invariants:
// stores never touch Supabase). `songId` carries which song the modal is acting on —
// null when closed.
interface AddToPlaylistModalState {
  isOpen: boolean
  songId: string | null
  onOpen: (songId: string) => void
  onClose: () => void
}

export const useAddToPlaylistModal = create<AddToPlaylistModalState>((set) => ({
  isOpen: false,
  songId: null,
  onOpen: (songId) => set({ isOpen: true, songId }),
  onClose: () => set({ isOpen: false, songId: null }),
}))
