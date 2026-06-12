import Link from 'next/link'
import { notFound } from 'next/navigation'
import { FiPlus } from 'react-icons/fi'
import { requireUser } from '@/server/require-user'
import { getPlaylistById } from '@/server/get-playlist'
import { getPlaylistSongs } from '@/server/get-playlist-songs'
import { PlaylistHeaderActions } from '@/components/playlist/PlaylistHeaderActions'
import { PlaylistTrackList } from '@/components/playlist/PlaylistTrackList'

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

  const tracks = await getPlaylistSongs(id)
  const trackLabel = tracks.length === 1 ? '1 song' : `${tracks.length} songs`

  return (
    <div className="space-y-8 p-6">
      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-muted">Playlist</p>
          <h1 className="mt-1 truncate text-2xl font-bold text-text">{playlist.title}</h1>
          <p className="mt-1 text-sm text-muted">{trackLabel}</p>
        </div>
        <PlaylistHeaderActions id={playlist.id} title={playlist.title} />
      </div>

      {tracks.length === 0 ? (
        <div className="space-y-4">
          <p className="text-sm text-muted">
            This playlist has no songs yet. Search the catalog and use the &ldquo;Add to
            playlist&rdquo; button on any song to add one.
          </p>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 rounded-full bg-text px-6 py-3 text-sm font-bold text-black transition hover:opacity-90"
          >
            <FiPlus className="h-4 w-4" />
            Add songs
          </Link>
        </div>
      ) : (
        // Keyed by the server song-id order so add/remove/reorder remounts the list
        // with fresh props (and reseeds its optimistic local state) after a refresh.
        <PlaylistTrackList
          key={tracks.map((t) => t.id).join(',')}
          playlistId={id}
          songs={tracks}
        />
      )}
    </div>
  )
}
