import { SongGrid } from '@/components/SongGrid'
import { getSongs } from '@/server/get-songs'

export default async function Home() {
  const songs = await getSongs()

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-bold text-text">Recently Uploaded</h1>
        <p className="text-sm text-muted">Discover the latest tracks</p>
      </div>

      <SongGrid songs={songs} emptyMessage="No songs yet." />
    </div>
  )
}
