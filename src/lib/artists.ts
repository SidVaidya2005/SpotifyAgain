import type { Song } from '@/types'

export interface ArtistGroup {
  author: string
  songs: Song[]
}

// Group a song list by author for Home's "Browse by artist" shelves. Keeps only
// authors with at least `minSongs` tracks (default 2) — a single-song author would
// render as a one-card shelf, and those songs already surface in "Recently added",
// so a per-artist shelf earns its place only once an author has a real cluster.
// Sorted by track count (desc) then author name, and each group preserves the
// incoming order (getSongs is created_at desc). Pure: no Supabase, no React — the
// caller passes an already RLS-scoped list, so this never widens visibility.
export function groupSongsByAuthor(songs: Song[], minSongs = 2): ArtistGroup[] {
  const byAuthor = new Map<string, Song[]>()
  for (const song of songs) {
    const group = byAuthor.get(song.author)
    if (group) group.push(song)
    else byAuthor.set(song.author, [song])
  }

  return [...byAuthor.entries()]
    .map(([author, grouped]) => ({ author, songs: grouped }))
    .filter((group) => group.songs.length >= minSongs)
    .sort((a, b) => b.songs.length - a.songs.length || a.author.localeCompare(b.author))
}
