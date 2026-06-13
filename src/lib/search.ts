// Strip characters that have meaning in PostgREST's filter grammar ( , ( ) * : " \ )
// and escape ilike wildcards (% _), so user input can't break or extend an .or() filter.
// Single source of truth shared by the server read (search-songs) and the client
// live-search hook (useSearchSongs).
export function sanitizeSearchQuery(query: string): string {
  return query.replace(/[,()*:"\\]/g, ' ').replace(/[%_]/g, '\\$&').trim()
}
