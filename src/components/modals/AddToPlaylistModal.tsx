'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FiPlus, FiMusic } from 'react-icons/fi'
import { toast } from 'sonner'
import { useAddToPlaylistModal } from '@/stores/use-add-to-playlist-modal'
import { usePlaylistModal } from '@/stores/use-playlist-modal'
import { useUserPlaylists } from '@/hooks/useUserPlaylists'
import { addSongToPlaylist } from '@/actions/add-song-to-playlist'
import { Modal } from '@/components/Modal'

// Lists the signed-in user's playlists and adds the chosen song to one. Opened from
// the AddToPlaylistButton on song cards / the player bar (the store carries the
// songId). The add Server Action owns revalidatePath for the server-rendered
// /playlist/[id]; here we router.refresh() so an open playlist page reflects the new
// track. Empty state offers to create a first playlist (hands off to PlaylistModal).
export function AddToPlaylistModal() {
  const { isOpen, songId, onClose } = useAddToPlaylistModal()
  const onOpenCreate = usePlaylistModal((s) => s.onOpenCreate)
  const { data: playlists, isLoading } = useUserPlaylists()
  const router = useRouter()
  const [pendingId, setPendingId] = useState<string | null>(null)

  const onOpenChange = (open: boolean) => {
    if (!open && !pendingId) onClose()
  }

  const onAdd = async (playlistId: string) => {
    if (!songId) return
    setPendingId(playlistId)
    const res = await addSongToPlaylist(playlistId, songId)
    setPendingId(null)
    if ('error' in res) {
      toast.error(res.error)
      return
    }
    toast.success('Added to playlist.')
    onClose()
    router.refresh()
  }

  const onCreateNew = () => {
    onClose()
    onOpenCreate()
  }

  const list = playlists ?? []

  return (
    <Modal
      open={isOpen}
      onOpenChange={onOpenChange}
      title="Add to playlist"
      description="Choose a playlist for this song."
    >
      {isLoading ? (
        <p className="text-center text-sm text-muted">Loading your playlists…</p>
      ) : list.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-2 text-center">
          <p className="text-sm text-muted">You don&apos;t have any playlists yet.</p>
          <button
            type="button"
            onClick={onCreateNew}
            className="inline-flex items-center gap-2 rounded-full bg-surface-2 px-4 py-2 text-sm font-bold text-text transition hover:bg-card-2"
          >
            <FiPlus className="h-4 w-4" />
            Create a playlist
          </button>
        </div>
      ) : (
        <div className="flex max-h-72 flex-col gap-1 overflow-y-auto">
          {list.map((p) => (
            <button
              key={p.id}
              type="button"
              disabled={pendingId !== null}
              onClick={() => onAdd(p.id)}
              className="flex items-center gap-3 rounded px-3 py-2 text-left text-sm text-text transition hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded bg-surface-2 text-muted">
                <FiMusic className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1 truncate font-bold">{p.title}</span>
              {pendingId === p.id && <span className="text-xs text-muted">Adding…</span>}
            </button>
          ))}
        </div>
      )}
    </Modal>
  )
}
