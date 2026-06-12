'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { usePlaylistModal } from '@/stores/use-playlist-modal'
import { createPlaylist } from '@/actions/create-playlist'
import { renamePlaylist } from '@/actions/rename-playlist'
import { Modal } from '@/components/Modal'
import { Button } from '@/components/Button'

interface PlaylistFormValues {
  title: string
}

const inputClass =
  'rounded bg-surface-2 px-3 py-2 text-sm text-text placeholder:text-muted shadow-inset-border focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'

// One modal, two modes (architecture: PlaylistModal create/rename). `editing` from
// the store decides: null → create, set → rename (prefilled). Server Actions own
// revalidatePath for the server-rendered page; here we invalidate the client
// ['user-playlists'] sidebar cache so the list updates without a reload.
export function PlaylistModal() {
  const { isOpen, editing, onClose } = usePlaylistModal()
  const router = useRouter()
  const qc = useQueryClient()
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<PlaylistFormValues>({
    defaultValues: { title: '' },
  })

  const isRename = editing !== null

  // Prefill the title when opening in rename mode; clear it for create. reset() is
  // a react-hook-form call (not setState), so it doesn't trip React 19's
  // set-state-in-effect rule. Keyed on open + which playlist is being edited.
  useEffect(() => {
    if (isOpen) reset({ title: editing?.title ?? '' })
  }, [isOpen, editing, reset])

  const onOpenChange = (open: boolean) => {
    if (!open && !isSubmitting) {
      reset()
      onClose()
    }
  }

  const onSubmit = async (values: PlaylistFormValues) => {
    if (editing) {
      const res = await renamePlaylist(editing.id, values.title)
      if ('error' in res) {
        toast.error(res.error)
        return
      }
      toast.success('Playlist renamed.')
      reset()
      onClose()
      qc.invalidateQueries({ queryKey: ['user-playlists'] })
      router.refresh()
      return
    }

    const res = await createPlaylist(values.title)
    if ('error' in res) {
      toast.error(res.error)
      return
    }
    toast.success('Playlist created.')
    reset()
    onClose()
    qc.invalidateQueries({ queryKey: ['user-playlists'] })
    router.push('/playlist/' + res.data.id)
  }

  return (
    <Modal
      open={isOpen}
      onOpenChange={onOpenChange}
      title={isRename ? 'Rename playlist' : 'Create playlist'}
      description={isRename ? 'Give your playlist a new name.' : 'Name your new playlist.'}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="playlist-title" className="text-sm font-bold text-text">
            Playlist name
          </label>
          <input
            id="playlist-title"
            type="text"
            placeholder="My playlist"
            autoFocus
            disabled={isSubmitting}
            className={inputClass}
            {...register('title', { required: true })}
          />
        </div>

        <Button type="submit" variant="pill" disabled={isSubmitting} className="mt-2 w-full">
          {isSubmitting ? 'Saving…' : isRename ? 'Save' : 'Create'}
        </Button>
      </form>
    </Modal>
  )
}
