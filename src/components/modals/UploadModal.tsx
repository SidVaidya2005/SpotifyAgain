'use client'

import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { v4 as uuidv4 } from 'uuid'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useUser } from '@/hooks/useUser'
import { useUploadModal } from '@/stores/use-upload-modal'
import { createSong } from '@/actions/create-song'
import {
  STORAGE_BUCKETS,
  ACCEPTED_AUDIO_TYPES,
  ACCEPTED_IMAGE_TYPES,
} from '@/lib/constants'
import { Modal } from '@/components/Modal'
import { Button } from '@/components/Button'

interface UploadFormValues {
  title: string
  author: string
  song: FileList
  image: FileList
  isPublic: boolean
}

// readonly string[] views so .includes() accepts an arbitrary File.type string
// without casting to any (the constants are `as const` literal tuples).
const audioTypes: readonly string[] = ACCEPTED_AUDIO_TYPES
const imageTypes: readonly string[] = ACCEPTED_IMAGE_TYPES

const inputClass =
  'rounded bg-surface-2 px-3 py-2 text-sm text-text placeholder:text-muted shadow-inset-border focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'
const fileInputClass =
  'rounded bg-surface-2 px-3 py-2 text-sm text-muted shadow-inset-border file:mr-3 file:rounded-full file:border-0 file:bg-surface file:px-3 file:py-1 file:text-xs file:font-bold file:text-text disabled:cursor-not-allowed disabled:opacity-50'

export function UploadModal() {
  const { isOpen, onClose } = useUploadModal()
  const { user } = useUser()
  const router = useRouter()
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<UploadFormValues>({
    defaultValues: { title: '', author: '', isPublic: true },
  })

  const onOpenChange = (open: boolean) => {
    if (!open && !isSubmitting) {
      reset()
      onClose()
    }
  }

  const onSubmit = async (values: UploadFormValues) => {
    const songFile = values.song?.[0]
    const imageFile = values.image?.[0]

    // Defensive: the trigger is signed-in-only, but never trust that the session
    // is still valid by the time we submit.
    if (!user) {
      toast.error('You must be signed in to upload.')
      return
    }
    if (!songFile || !imageFile) {
      toast.error('Please add both an audio file and a cover image.')
      return
    }
    if (!audioTypes.includes(songFile.type)) {
      toast.error('The song must be an MP3 file.')
      return
    }
    if (!imageTypes.includes(imageFile.type)) {
      toast.error('The cover must be a JPG, PNG, or WebP image.')
      return
    }

    const supabase = createClient()
    const uid = uuidv4()
    const ext = imageFile.name.split('.').pop() ?? 'jpg'
    const songPath = `${user.id}/${uid}.mp3`
    const imagePath = `${user.id}/${uid}.${ext}`

    try {
      // 1) audio → songs bucket
      const { error: songErr } = await supabase.storage
        .from(STORAGE_BUCKETS.songs)
        .upload(songPath, songFile, { cacheControl: '3600', upsert: false })
      if (songErr) throw songErr

      // 2) cover → images bucket; clean up the audio object if this fails
      const { error: imgErr } = await supabase.storage
        .from(STORAGE_BUCKETS.images)
        .upload(imagePath, imageFile, { cacheControl: '3600', upsert: false })
      if (imgErr) {
        await supabase.storage.from(STORAGE_BUCKETS.songs).remove([songPath])
        throw imgErr
      }

      // 3) DB row via Server Action; clean up both objects if the insert fails
      const res = await createSong({
        title: values.title,
        author: values.author,
        songPath,
        imagePath,
        isPublic: values.isPublic,
      })
      if ('error' in res) {
        await supabase.storage.from(STORAGE_BUCKETS.songs).remove([songPath])
        await supabase.storage.from(STORAGE_BUCKETS.images).remove([imagePath])
        throw new Error(res.error)
      }

      toast.success('Song uploaded.')
      reset()
      onClose()
      router.refresh()
    } catch (err) {
      console.error('[UploadModal]', err instanceof Error ? err.message : err)
      toast.error('Could not upload song. Please try again.')
    }
  }

  return (
    <Modal
      open={isOpen}
      onOpenChange={onOpenChange}
      title="Add a song"
      description="Upload an MP3 with cover art."
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="title" className="text-sm font-bold text-text">
            Title
          </label>
          <input
            id="title"
            type="text"
            placeholder="Song title"
            disabled={isSubmitting}
            className={inputClass}
            {...register('title', { required: true })}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="author" className="text-sm font-bold text-text">
            Author
          </label>
          <input
            id="author"
            type="text"
            placeholder="Artist name"
            disabled={isSubmitting}
            className={inputClass}
            {...register('author', { required: true })}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="song" className="text-sm font-bold text-text">
            Song (MP3)
          </label>
          <input
            id="song"
            type="file"
            accept={audioTypes.join(',')}
            disabled={isSubmitting}
            className={fileInputClass}
            {...register('song', { required: true })}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="image" className="text-sm font-bold text-text">
            Cover image
          </label>
          <input
            id="image"
            type="file"
            accept={imageTypes.join(',')}
            disabled={isSubmitting}
            className={fileInputClass}
            {...register('image', { required: true })}
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-muted">
          <input
            type="checkbox"
            disabled={isSubmitting}
            className="h-4 w-4 accent-accent"
            {...register('isPublic')}
          />
          Make this song public
        </label>

        <Button type="submit" variant="pill" disabled={isSubmitting} className="mt-2 w-full">
          {isSubmitting ? 'Uploading…' : 'Upload'}
        </Button>
      </form>
    </Modal>
  )
}
