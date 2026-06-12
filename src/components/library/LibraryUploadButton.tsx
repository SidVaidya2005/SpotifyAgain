'use client'

import { FiPlus } from 'react-icons/fi'
import { Button } from '@/components/Button'
import { useUploadModal } from '@/stores/use-upload-modal'

interface LibraryUploadButtonProps {
  className?: string
}

// Library's dedicated upload entry point (in addition to the global Header "+").
// White pill keeps the accent green exclusive to playback/active state. Opens the
// shared UploadModal via its Zustand store.
export function LibraryUploadButton({ className }: LibraryUploadButtonProps) {
  const uploadModal = useUploadModal()

  return (
    <Button variant="white" onClick={uploadModal.onOpen} className={className}>
      <FiPlus className="h-4 w-4" />
      Upload
    </Button>
  )
}
