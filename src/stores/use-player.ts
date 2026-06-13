import { create } from 'zustand'

// Fisher–Yates shuffle on a copy — never mutates the input.
function shuffle(arr: string[]): string[] {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

// Insert `newIds` (de-duped against `arr`) right after `activeId`; append if absent.
function insertAfterActive(
  arr: string[],
  activeId: string | undefined,
  newIds: string[],
): string[] {
  const additions = newIds.filter((id) => !arr.includes(id))
  if (additions.length === 0) return arr
  const i = activeId ? arr.indexOf(activeId) : -1
  if (i === -1) return [...arr, ...additions]
  return [...arr.slice(0, i + 1), ...additions, ...arr.slice(i + 1)]
}

// Ephemeral playback state only — the active track id, the queue it was launched from, and
// the shuffle toggle. Never holds domain data (Song objects) and never calls Supabase
// (architecture.md invariants); next/prev/auto-advance walk `ids`.
interface PlayerState {
  ids: string[] // the active queue, in play order (shuffled when isShuffled)
  originalOrder: string[] // the unshuffled launch order, restored when shuffle turns off
  activeId?: string
  isShuffled: boolean
  setId: (id: string) => void
  setIds: (ids: string[]) => void
  toggleShuffle: () => void
  addToQueueAfterActive: (newIds: string[]) => void
  reset: () => void
}

export const usePlayer = create<PlayerState>((set) => ({
  ids: [],
  originalOrder: [],
  activeId: undefined,
  isShuffled: false,
  setId: (id) => set({ activeId: id }),
  // Launch a list: remember its natural order; reshuffle now if shuffle is on (it's a
  // persistent global toggle), so a newly-played list respects the current shuffle state.
  setIds: (ids) =>
    set((state) => ({
      originalOrder: ids,
      ids: state.isShuffled ? shuffle(ids) : ids,
    })),
  // On: snapshot the current order, then shuffle. Off: restore it. activeId (the track
  // currently playing) is untouched, so the player never reloads on toggle.
  toggleShuffle: () =>
    set((state) =>
      state.isShuffled
        ? { isShuffled: false, ids: state.originalOrder }
        : { isShuffled: true, originalOrder: state.ids, ids: shuffle(state.ids) },
    ),
  // "More like this": queue songs right after the current track — in both the play order
  // and the saved natural order, so a later un-shuffle stays consistent.
  addToQueueAfterActive: (newIds) =>
    set((state) => ({
      ids: insertAfterActive(state.ids, state.activeId, newIds),
      originalOrder: insertAfterActive(state.originalOrder, state.activeId, newIds),
    })),
  reset: () =>
    set({ ids: [], originalOrder: [], activeId: undefined, isShuffled: false }),
}))
