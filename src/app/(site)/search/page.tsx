import { searchSongs } from '@/server/search-songs'
import { getSongs } from '@/server/get-songs'
import { SongGrid } from '@/components/SongGrid'

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>
}

// Public page (not in the proxy's protectedPaths) — anyone can search the catalog.
// searchParams is async in Next 16. The URL is the source of truth: the global
// header search (HeaderSearch, in the app shell) writes ?q=, this Server Component
// reads it and runs the RLS-scoped search.
export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams
  const query = q?.trim() ?? ''
  const songs = query ? await searchSongs(query) : []
  // No query: show the newest catalog songs as a browse default (RLS-scoped, like Home).
  const recent = query ? [] : (await getSongs()).slice(0, 12)

  return (
    <div className="space-y-8 p-6">
      <h1 className="text-2xl font-bold text-text">Search</h1>

      {query === '' ? (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-text">Recently added</h2>
          <SongGrid songs={recent} emptyMessage="No songs in the catalog yet." />
        </section>
      ) : (
        <SongGrid songs={songs} emptyMessage={`No songs found for “${query}”.`} />
      )}
    </div>
  )
}
