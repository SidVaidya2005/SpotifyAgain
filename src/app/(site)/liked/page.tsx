import { SongGrid } from '@/components/SongGrid'
import { getLikedSongs } from '@/server/get-liked-songs'
import { requireUser } from '@/server/require-user'

export default async function Liked() {
  // Personal page: redirect anonymous viewers to `/` (defense-in-depth alongside
  // the proxy gate), then list this user's liked songs. Playing from the grid sets
  // the queue to these songs (SongGrid → useOnPlay).
  const user = await requireUser()
  const songs = await getLikedSongs(user.id)

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-bold text-text">Liked Songs</h1>
        <p className="text-sm text-muted">Songs you&apos;ve liked</p>
      </div>

      <SongGrid songs={songs} emptyMessage="Songs you like will appear here." />
    </div>
  )
}
