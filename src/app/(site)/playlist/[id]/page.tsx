import { notFound } from 'next/navigation'
import { requireUser } from '@/server/require-user'
import { getPlaylistById } from '@/server/get-playlist'
import { PlaylistHeaderActions } from '@/components/playlist/PlaylistHeaderActions'

interface PlaylistPageProps {
  params: Promise<{ id: string }>
}

export default async function PlaylistPage({ params }: PlaylistPageProps) {
  // params is async in Next 16. Owner-only page: redirect anon (defense-in-depth
  // with the proxy), then load the playlist. RLS returns null for a non-owner or
  // missing id → 404, with no existence leak.
  const { id } = await params
  await requireUser()
  const playlist = await getPlaylistById(id)
  if (!playlist) notFound()

  return (
    <div className="space-y-8 p-6">
      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-muted">Playlist</p>
          <h1 className="mt-1 truncate text-2xl font-bold text-text">{playlist.title}</h1>
        </div>
        <PlaylistHeaderActions id={playlist.id} title={playlist.title} />
      </div>

      {/* Tracks (add/remove/reorder) land in Feature 14; for now an empty shell. */}
      <p className="text-sm text-muted">This playlist has no songs yet.</p>
    </div>
  )
}
