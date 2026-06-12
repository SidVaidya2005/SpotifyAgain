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

  const [play, { pause, sound, duration }] = useSound(songUrl, {
    format: ['mp3'],
    volume: isMuted ? 0 : volume,
    onplay: () => setIsPlaying(true),
    onpause: () => setIsPlaying(false),
    // Auto-advance to the next queued track is Feature 10; here it just stops.
    onend: () => setIsPlaying(false),
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
      </div>

      {/* Center: controls + seek bar */}
      <div className="flex max-w-[520px] flex-1 flex-col items-center gap-1">
        <div className="flex items-center gap-4 md:gap-6">
          {/* TODO(Feature 10): wire previous to walk the queue */}
          <button
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
          {/* TODO(Feature 10): wire next to walk the queue */}
          <button
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
