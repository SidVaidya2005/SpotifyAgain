import { searchSongs } from '@/server/search-songs'
import { SearchInput } from '@/components/SearchInput'
import { SongGrid } from '@/components/SongGrid'

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>
}

// Public page (not in the proxy's protectedPaths) — anyone can search the catalog.
// searchParams is async in Next 16. The URL is the source of truth: SearchInput
// writes ?q=, this Server Component reads it and runs the RLS-scoped search.
export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams
  const query = q?.trim() ?? ''
  const songs = query ? await searchSongs(query) : []

  return (
    <div className="space-y-8 p-6">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-text">Search</h1>
        <SearchInput initialQuery={query} />
      </div>

      {query === '' ? (
        <p className="text-sm text-muted">Search for songs by title or artist.</p>
      ) : (
        <SongGrid songs={songs} emptyMessage={`No songs found for “${query}”.`} />
      )}
    </div>
  )
}
