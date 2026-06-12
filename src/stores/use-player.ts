import { create } from 'zustand'

// Ephemeral playback state only — the active track id and the queue it was
// launched from. Never holds domain data (Song objects) and never calls Supabase
// (architecture.md invariants). Walking the queue (next/prev/auto-advance) lands
// in Feature 10; here it is only populated by useOnPlay.
interface PlayerState {
  ids: string[] // the active queue
  activeId?: string
  setId: (id: string) => void
  setIds: (ids: string[]) => void
  reset: () => void
}

export const usePlayer = create<PlayerState>((set) => ({
  ids: [],
  activeId: undefined,
  setId: (id) => set({ activeId: id }),
  setIds: (ids) => set({ ids }),
  reset: () => set({ ids: [], activeId: undefined }),
}))
