import { create } from 'zustand'

// Ephemeral UI state for the create/rename playlist dialog (architecture.md →
// Invariants: stores never touch Supabase). `editing` carries the minimal context
// the form needs to prefill in rename mode — null means create mode.
interface PlaylistModalState {
  isOpen: boolean
  editing: { id: string; title: string } | null
  onOpenCreate: () => void
  onOpenRename: (id: string, title: string) => void
  onClose: () => void
}

export const usePlaylistModal = create<PlaylistModalState>((set) => ({
  isOpen: false,
  editing: null,
  onOpenCreate: () => set({ isOpen: true, editing: null }),
  onOpenRename: (id, title) => set({ isOpen: true, editing: { id, title } }),
  onClose: () => set({ isOpen: false, editing: null }),
}))
