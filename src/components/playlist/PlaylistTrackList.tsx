'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { restrictToVerticalAxis, restrictToParentElement } from '@dnd-kit/modifiers'
import { useOnPlay } from '@/hooks/useOnPlay'
import { reorderPlaylist } from '@/actions/reorder-playlist'
import { removeSongFromPlaylist } from '@/actions/remove-song-from-playlist'
import { PlaylistTrackRow } from '@/components/playlist/PlaylistTrackRow'
import type { Song } from '@/types'

interface PlaylistTrackListProps {
  playlistId: string
  songs: Song[]
}

// Drag-sortable track list for /playlist/[id]. The server read is canonical: this
// list is keyed in the page by the server song-id order, so an add/remove (or a
// reorder that changed the order) remounts it with fresh props and reseeds local
// state. Reorder is optimistic — drop reorders `items` instantly (event handler, not
// an effect, so it never trips React 19's set-state-in-effect rule), then persists
// via reorderPlaylist and router.refresh(); a failure rolls back and toasts.
export function PlaylistTrackList({ playlistId, songs }: PlaylistTrackListProps) {
  const router = useRouter()
  const [items, setItems] = useState<Song[]>(songs)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const onPlay = useOnPlay(items)

  const sensors = useSensors(
    // Small distance so a click-to-play isn't read as a drag; touch-drag works via
    // the handle (touch-none on it stops the page scrolling mid-drag).
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const onDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = items.findIndex((s) => s.id === active.id)
    const newIndex = items.findIndex((s) => s.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    const previous = items
    const next = arrayMove(items, oldIndex, newIndex)
    setItems(next) // optimistic

    const res = await reorderPlaylist(
      playlistId,
      next.map((s) => s.id),
    )
    if ('error' in res) {
      setItems(previous) // rollback
      toast.error(res.error)
      return
    }
    router.refresh()
  }

  const onRemove = async (songId: string) => {
    setRemovingId(songId)
    const res = await removeSongFromPlaylist(playlistId, songId)
    if ('error' in res) {
      setRemovingId(null)
      toast.error(res.error)
      return
    }
    toast.success('Removed from playlist.')
    // The page re-reads and remounts this list (new key) with the row gone.
    router.refresh()
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis, restrictToParentElement]}
      onDragEnd={onDragEnd}
    >
      <SortableContext items={items.map((s) => s.id)} strategy={verticalListSortingStrategy}>
        <ol className="flex flex-col gap-1">
          {items.map((song, index) => (
            <PlaylistTrackRow
              key={song.id}
              song={song}
              index={index}
              onPlay={onPlay}
              onRemove={onRemove}
              disabled={removingId !== null}
            />
          ))}
        </ol>
      </SortableContext>
    </DndContext>
  )
}
