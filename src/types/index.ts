export interface Song {
  id: string
  user_id: string
  title: string
  author: string
  song_path: string
  image_path: string
  is_public: boolean
  created_at: string
}

export type ActionResult<T = void> = { data: T } | { error: string }
