import { SongGrid } from '@/components/SongGrid'
import { LibraryEmptyState } from '@/components/library/LibraryEmptyState'
import { LibraryUploadButton } from '@/components/library/LibraryUploadButton'
import { getSongsByUser } from '@/server/get-songs-by-user'
import { requireUser } from '@/server/require-user'

export default async function Library() {
  // Personal page: redirect anonymous viewers to `/` (defense-in-depth alongside
  // the proxy gate), then list only this user's own uploads (public + private).
  const user = await requireUser()
  const songs = await getSongsByUser(user.id)

  return (
    <div className="space-y-8 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Your Library</h1>
          <p className="text-sm text-muted">Songs you&apos;ve uploaded</p>
        </div>
        {/* Empty state carries its own CTA, so hide the header button while empty. */}
        {songs.length > 0 && <LibraryUploadButton />}
      </div>

      {songs.length === 0 ? (
        <LibraryEmptyState />
      ) : (
        <SongGrid songs={songs} showVisibility />
      )}
    </div>
  )
}
