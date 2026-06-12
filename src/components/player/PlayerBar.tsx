'use client'

import { FiSkipBack, FiPlay, FiSkipForward, FiVolume2 } from 'react-icons/fi'
import { usePlayer } from '@/stores/use-player'
import { useGetSongById } from '@/hooks/useGetSongById'
import { useLoadSongUrl } from '@/hooks/useLoadSongUrl'
import { PlayerContent } from '@/components/player/PlayerContent'

// Mounted once in the root layout (never unmounts on navigation). Resolves the
// active track from the store's activeId, then hands a fully-loaded song + URL to
// PlayerContent. The bar always occupies its fixed slot; it shows an idle
// placeholder until the first song is played.
export function PlayerBar() {
  const activeId = usePlayer((s) => s.activeId)
  const { song } = useGetSongById(activeId)
  const songUrl = useLoadSongUrl(song)

  return (
    <div className="fixed bottom-0 left-0 right-0 h-24 bg-surface shadow-card">
      {song && songUrl ? (
        // key forces a remount on track change so use-sound reloads the audio.
        <PlayerContent key={songUrl} song={song} songUrl={songUrl} />
      ) : (
        <IdlePlayer />
      )}
    </div>
  )
}

// Static, non-interactive placeholder shown before anything is playing.
function IdlePlayer() {
  return (
    <div className="flex h-full items-center justify-between px-6">
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <div className="h-16 w-16 flex-shrink-0 rounded bg-surface-2" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-muted">Nothing playing</p>
          <p className="truncate text-xs text-muted">Pick a song to start</p>
        </div>
      </div>

      <div className="flex flex-shrink-0 items-center gap-8">
        <FiSkipBack className="h-6 w-6 text-border" aria-hidden />
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-muted">
          <FiPlay className="h-6 w-6 fill-current" aria-hidden />
        </div>
        <FiSkipForward className="h-6 w-6 text-border" aria-hidden />
      </div>

      <div className="hidden flex-shrink-0 items-center gap-4 md:flex">
        <FiVolume2 className="h-5 w-5 text-border" aria-hidden />
        <div className="h-1 w-24 rounded-pill bg-surface-2" />
      </div>
    </div>
  )
}
