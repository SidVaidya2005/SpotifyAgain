'use client'

import { FiSkipBack, FiPlay, FiSkipForward, FiVolume2 } from 'react-icons/fi'

export function PlayerBar() {
  return (
    <div className="fixed bottom-0 left-0 right-0 h-24 bg-surface shadow-card">
      <div className="flex h-full items-center justify-between px-6">
        {/* Left: Cover + Title/Author */}
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <div className="h-16 w-16 rounded bg-surface-2 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-text">Now Playing</p>
            <p className="truncate text-xs text-muted">Artist Name</p>
          </div>
        </div>

        {/* Center: Controls */}
        <div className="flex items-center gap-8 flex-shrink-0">
          <button
            className="text-muted hover:text-text transition"
            title="Previous"
          >
            <FiSkipBack className="h-6 w-6" />
          </button>
          <button
            className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-base transition hover:bg-accent-border"
            title="Play"
          >
            <FiPlay className="h-6 w-6 text-base fill-current" />
          </button>
          <button
            className="text-muted hover:text-text transition"
            title="Next"
          >
            <FiSkipForward className="h-6 w-6" />
          </button>
        </div>

        {/* Right: Volume */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <FiVolume2 className="h-5 w-5 text-muted" />
          <div className="w-24 h-1 bg-surface-2 rounded-pill" />
        </div>
      </div>
    </div>
  )
}
