import { SongCard } from '@/components/SongCard'
import type { Song } from '@/types'

const MOCK_SONGS: Song[] = [
  {
    id: '1',
    user_id: 'mock-user-1',
    title: 'Midnight Echo',
    author: 'Luna Woods',
    song_path: 'mock-user-1/mock-1.mp3',
    image_path: 'mock-user-1/mock-1.jpg',
    is_public: true,
    created_at: '2026-06-11T00:00:00Z',
  },
  {
    id: '2',
    user_id: 'mock-user-2',
    title: 'Neon Sunrise',
    author: 'Electric Dreams',
    song_path: 'mock-user-2/mock-2.mp3',
    image_path: 'mock-user-2/mock-2.jpg',
    is_public: true,
    created_at: '2026-06-10T00:00:00Z',
  },
  {
    id: '3',
    user_id: 'mock-user-3',
    title: 'Ocean Waves',
    author: 'Coastal Vibes',
    song_path: 'mock-user-3/mock-3.mp3',
    image_path: 'mock-user-3/mock-3.jpg',
    is_public: true,
    created_at: '2026-06-09T00:00:00Z',
  },
  {
    id: '4',
    user_id: 'mock-user-4',
    title: 'Urban Journey',
    author: 'City Sounds',
    song_path: 'mock-user-4/mock-4.mp3',
    image_path: 'mock-user-4/mock-4.jpg',
    is_public: true,
    created_at: '2026-06-08T00:00:00Z',
  },
  {
    id: '5',
    user_id: 'mock-user-5',
    title: 'Forest Trail',
    author: 'Nature Whispers',
    song_path: 'mock-user-5/mock-5.mp3',
    image_path: 'mock-user-5/mock-5.jpg',
    is_public: true,
    created_at: '2026-06-07T00:00:00Z',
  },
  {
    id: '6',
    user_id: 'mock-user-6',
    title: 'Sky Dancing',
    author: 'Ethereal Beats',
    song_path: 'mock-user-6/mock-6.mp3',
    image_path: 'mock-user-6/mock-6.jpg',
    is_public: true,
    created_at: '2026-06-06T00:00:00Z',
  },
]

export default function Home() {
  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-3xl font-bold text-text">Recently Uploaded</h1>
        <p className="text-sm text-muted">Discover the latest tracks</p>
      </div>

      <div className="grid grid-cols-1 gap-4 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {MOCK_SONGS.map((song) => (
          <SongCard key={song.id} song={song} />
        ))}
      </div>
    </div>
  )
}
