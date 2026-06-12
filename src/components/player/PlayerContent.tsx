'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import useSound from 'use-sound'
import {
  FiPlay,
  FiPause,
  FiSkipBack,
  FiSkipForward,
  FiVolume2,
  FiVolumeX,
} from 'react-icons/fi'
import { useLoadImage } from '@/hooks/useLoadImage'
import { SeekSlider } from '@/components/player/SeekSlider'
import { VolumeSlider } from '@/components/player/VolumeSlider'
import { LikeButton } from '@/components/LikeButton'
import { usePlayer } from '@/stores/use-player'
import type { Song } from '@/types'

interface PlayerContentProps {
  song: Song
  songUrl: string
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) seconds = 0
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

// Mounted by PlayerBar and keyed by songUrl, so it remounts (and use-sound
// reloads) whenever the active track changes. Owns ephemeral playback state
// (isPlaying / position / volume) locally — never the store.
export function PlayerContent({ song, songUrl }: PlayerContentProps) {
  const imageUrl = useLoadImage(song)
  const [isPlaying, setIsPlaying] = useState(false)
  const [position, setPosition] = useState(0) // seconds
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)

  // Advance to the next track, wrapping to the first at the end of the queue.
  // Reads live store state (not a render closure) so the onend callback captured
  // by use-sound at mount always walks the current queue.
  const onPlayNext = () => {
    const { ids, activeId, setId } = usePlayer.getState()
    if (ids.length === 0) return
    const i = ids.findIndex((id) => id === activeId)
    setId(ids[i + 1] ?? ids[0]) // wrap to first
  }

  const [play, { pause, sound, duration }] = useSound(songUrl, {
    format: ['mp3'],
    volume: isMuted ? 0 : volume,
    onplay: () => setIsPlaying(true),
    onpause: () => setIsPlaying(false),
    // Track finished: auto-advance to the next queued track (loops at the end).
    onend: onPlayNext,
  })

  // Autoplay once the Howl is ready; unload on track change / unmount so we
  // never leak Howl instances (library-docs.md → use-sound).
  useEffect(() => {
    sound?.play()
    return () => {
      sound?.unload()
    }
  }, [sound])

  // Poll the playhead while playing to drive the seek slider.
  useEffect(() => {
    if (!sound || !isPlaying) return
    const interval = setInterval(() => {
      const current = sound.seek()
      if (typeof current === 'number') setPosition(current)
    }, 500)
    return () => clearInterval(interval)
  }, [sound, isPlaying])

  const durationSeconds = duration ? duration / 1000 : 0

  const handlePlayPause = () => {
    if (isPlaying) pause()
    else play()
  }

  const handleSeek = (value: number) => {
    sound?.seek(value)
    setPosition(value)
  }

  const handleVolumeChange = (value: number) => {
    setVolume(value)
    setIsMuted(false)
  }

  // Spotify-style previous: restart the current track if more than 3s in,
  // otherwise step back one track (wrapping to the last).
  const onPlayPrevious = () => {
    const current = sound?.seek()
    const elapsed = typeof current === 'number' ? current : 0
    if (elapsed > 3) {
      sound?.seek(0)
      setPosition(0)
      return
    }
    const { ids, activeId, setId } = usePlayer.getState()
    if (ids.length === 0) return
    const i = ids.findIndex((id) => id === activeId)
    setId(ids[i - 1] ?? ids[ids.length - 1]) // wrap to last
  }

  return (
    <div className="flex h-full items-center justify-between gap-4 px-4 md:px-6">
      {/* Left: cover + title/author */}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded bg-surface-2">
          {imageUrl && (
            <Image
              src={imageUrl}
              alt={song.title}
              fill
              sizes="56px"
              className="object-cover"
            />
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-text">{song.title}</p>
          <p className="truncate text-xs text-muted">{song.author}</p>
        </div>
        {/* Like the now-playing track — always visible (covers touch widths). */}
        <LikeButton songId={song.id} className="flex-shrink-0" />
      </div>

      {/* Center: controls + seek bar */}
      <div className="flex max-w-[520px] flex-1 flex-col items-center gap-1">
        <div className="flex items-center gap-4 md:gap-6">
          <button
            onClick={onPlayPrevious}
            className="flex h-11 w-11 items-center justify-center text-muted transition hover:text-text"
            aria-label="Previous"
          >
            <FiSkipBack className="h-5 w-5" />
          </button>
          <button
            onClick={handlePlayPause}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-black transition hover:bg-accent-border"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <FiPause className="h-6 w-6" />
            ) : (
              <FiPlay className="h-6 w-6 fill-current" />
            )}
          </button>
          <button
            onClick={onPlayNext}
            className="flex h-11 w-11 items-center justify-center text-muted transition hover:text-text"
            aria-label="Next"
          >
            <FiSkipForward className="h-5 w-5" />
          </button>
        </div>

        <div className="flex w-full items-center gap-2">
          <span className="w-10 text-right text-2xs tabular-nums text-muted">
            {formatTime(position)}
          </span>
          <SeekSlider value={position} max={durationSeconds} onChange={handleSeek} />
          <span className="w-10 text-2xs tabular-nums text-muted">
            {formatTime(durationSeconds)}
          </span>
        </div>
      </div>

      {/* Right: volume (hidden on touch widths — hardware volume there) */}
      <div className="hidden min-w-0 flex-1 items-center justify-end gap-2 md:flex">
        <button
          onClick={() => setIsMuted((m) => !m)}
          className="text-muted transition hover:text-text"
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted || volume === 0 ? (
            <FiVolumeX className="h-5 w-5" />
          ) : (
            <FiVolume2 className="h-5 w-5" />
          )}
        </button>
        <VolumeSlider
          value={isMuted ? 0 : volume}
          onChange={handleVolumeChange}
        />
      </div>
    </div>
  )
}
