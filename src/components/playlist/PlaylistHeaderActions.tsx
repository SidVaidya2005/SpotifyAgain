'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { FiEdit2, FiPlus, FiTrash2 } from 'react-icons/fi'
import { toast } from 'sonner'
import { usePlaylistModal } from '@/stores/use-playlist-modal'
import { deletePlaylist } from '@/actions/delete-playlist'
import { Modal } from '@/components/Modal'
import { Button } from '@/components/Button'
import { Tooltip } from '@/components/Tooltip'

interface PlaylistHeaderActionsProps {
  id: string
  title: string
}

// Owner controls on the /playlist/[id] page: rename (opens the shared modal in
// rename mode) and delete (a confirm dialog, since delete is destructive and
// cascades the playlist's tracks). On delete success we invalidate the sidebar
// list and navigate home.
export function PlaylistHeaderActions({ id, title }: PlaylistHeaderActionsProps) {
  const router = useRouter()
  const qc = useQueryClient()
  const onOpenRename = usePlaylistModal((s) => s.onOpenRename)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const onConfirmDelete = async () => {
    setIsDeleting(true)
    const res = await deletePlaylist(id)
    if ('error' in res) {
      setIsDeleting(false)
      toast.error(res.error)
      return
    }
    toast.success('Playlist deleted.')
    qc.invalidateQueries({ queryKey: ['user-playlists'] })
    setConfirmOpen(false)
    router.push('/')
  }

  return (
    <>
      <div className="flex shrink-0 items-center gap-2">
        <Tooltip content="Add songs">
          <Link
            href="/search"
            aria-label="Add songs"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-2 text-text transition hover:scale-105 hover:text-accent"
          >
            <FiPlus className="h-5 w-5" />
          </Link>
        </Tooltip>
        <Tooltip content="Rename playlist">
          <button
            type="button"
            aria-label="Rename playlist"
            onClick={() => onOpenRename(id, title)}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-2 text-text transition hover:scale-105 hover:text-accent"
          >
            <FiEdit2 className="h-5 w-5" />
          </button>
        </Tooltip>
        <Tooltip content="Delete playlist">
          <button
            type="button"
            aria-label="Delete playlist"
            onClick={() => setConfirmOpen(true)}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-2 text-text transition hover:scale-105 hover:text-negative"
          >
            <FiTrash2 className="h-5 w-5" />
          </button>
        </Tooltip>
      </div>

      <Modal
        open={confirmOpen}
        onOpenChange={(open) => {
          if (!isDeleting) setConfirmOpen(open)
        }}
        title="Delete playlist?"
        description="This permanently deletes the playlist and its track list. This can't be undone."
      >
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={isDeleting}
            onClick={() => setConfirmOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="pill"
            disabled={isDeleting}
            onClick={onConfirmDelete}
            className="bg-negative text-black hover:bg-negative"
          >
            {isDeleting ? 'Deleting…' : 'Delete'}
          </Button>
        </div>
      </Modal>
    </>
  )
}
