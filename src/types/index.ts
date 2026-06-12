import type { Database } from '@/types/database.types'

// Domain aliases over the generated Supabase Row types — the single source of
// truth for table shapes is database.types.ts (regenerate it after a migration).
// Type every Supabase result against these.
export type Song = Database['public']['Tables']['songs']['Row']
export type Playlist = Database['public']['Tables']['playlists']['Row']
export type PlaylistSong = Database['public']['Tables']['playlist_songs']['Row']
export type LikedSong = Database['public']['Tables']['liked_songs']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']

// Shared return contract for every Server Action mutation.
export type ActionResult<T = void> = { data: T } | { error: string }
