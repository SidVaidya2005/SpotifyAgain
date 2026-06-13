import { SongGrid } from '@/components/SongGrid'
import { groupSongsByAuthor } from '@/lib/artists'
import { getLikedSongs } from '@/server/get-liked-songs'
import { getOptionalUser } from '@/server/optional-user'
import { getSongs } from '@/server/get-songs'
import { getSongsByUser } from '@/server/get-songs-by-user'
import type { Song } from '@/types'

// Home is public: anonymous visitors see the catalog sections; signed-in users
// additionally see their personal shelves. We read the user conditionally
// (getOptionalUser — never redirects) so browsing stays open. Sections are derived
// from real data only (recency + author + ownership) — no "made for you"/algorithmic
// feeds (out of scope, and we have no signal to make them honest).
export default async function Home() {
  // getSongs doesn't depend on the user, so resolve both together.
  const [user, songs] = await Promise.all([getOptionalUser(), getSongs()])

  let myUploads: Song[] = []
  let liked: Song[] = []
  if (user) {
    ;[myUploads, liked] = await Promise.all([getSongsByUser(user.id), getLikedSongs(user.id)])
  }

  const recent = songs.slice(0, 12)
  const artists = groupSongsByAuthor(songs) // authors with >= 2 songs

  return (
    <div className="space-y-8 p-6">
      <h1 className="sr-only">Home</h1>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-text">Recently added</h2>
        <SongGrid songs={recent} emptyMessage="No songs yet." />
      </section>

      {user && myUploads.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-text">Made by you</h2>
          <SongGrid songs={myUploads.slice(0, 12)} showVisibility />
        </section>
      )}

      {user && liked.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-text">Liked songs</h2>
          <SongGrid songs={liked.slice(0, 12)} />
        </section>
      )}

      {artists.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-text">Browse by artist</h2>
          <div className="space-y-8">
            {artists.map((artist) => (
              <section key={artist.author} className="space-y-4">
                <h3 className="text-lg font-semibold text-text">{artist.author}</h3>
                <SongGrid songs={artist.songs} />
              </section>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
