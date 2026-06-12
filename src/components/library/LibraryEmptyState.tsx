'use client'

import { FiMusic } from 'react-icons/fi'
import { LibraryUploadButton } from '@/components/library/LibraryUploadButton'

// Polished empty state for /library when the user has no uploads. Carries the
// upload CTA itself (reusing LibraryUploadButton), so the page hides the header
// button while empty and the two CTAs never stack.
export function LibraryEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-lg bg-surface py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-2 text-muted">
        <FiMusic className="h-7 w-7" />
      </div>
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-text">Your library is empty</h2>
        <p className="text-sm text-muted">Upload your first song to get started.</p>
      </div>
      <LibraryUploadButton />
    </div>
  )
}
