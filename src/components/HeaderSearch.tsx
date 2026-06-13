'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { FiSearch } from 'react-icons/fi'
import { useDebounce } from '@/hooks/useDebounce'
import { useSearchSongs } from '@/hooks/useSearchSongs'
import { useOnPlay } from '@/hooks/useOnPlay'
import { useLoadImage } from '@/hooks/useLoadImage'
import type { Song } from '@/types'

// One dropdown result row. useLoadImage is a hook, so each row is its own component
// (can't call hooks in a map).
function ResultRow({ song, onPlay }: { song: Song; onPlay: (id: string) => void }) {
  const imageUrl = useLoadImage(song)
  return (
    <button
      type="button"
      onClick={() => onPlay(song.id)}
      className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition hover:bg-surface-2"
    >
      <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded bg-surface-2">
        {imageUrl && (
          <Image src={imageUrl} alt={song.title} fill sizes="40px" className="object-cover" />
        )}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-text">{song.title}</p>
        <p className="truncate text-xs text-muted">{song.author}</p>
      </div>
    </button>
  )
}

// Persistent header search with a live dropdown (DESIGN §10.2). Debounced browser-client
// search (RLS-scoped); clicking a result plays it (queue = the results); Enter or "Show all
// results" routes to the full /search page. No auth gate — anyone can search public songs.
export function HeaderSearch() {
  const router = useRouter()
  const [value, setValue] = useState('')
  const [open, setOpen] = useState(false)
  const debounced = useDebounce(value, 300)
  const { results, isLoading } = useSearchSongs(debounced)
  const onPlay = useOnPlay(results)
  const containerRef = useRef<HTMLDivElement>(null)

  // Close on outside-click / Escape. Listeners only (state set inside handlers), so this
  // doesn't trip React 19's set-state-in-effect rule.
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  const goToResultsPage = () => {
    const q = value.trim()
    if (!q) return
    router.push(`/search?q=${encodeURIComponent(q)}`)
    setOpen(false)
  }

  const handlePlay = (id: string) => {
    onPlay(id)
    setOpen(false)
  }

  const trimmed = value.trim()
  const showPanel = open && trimmed.length > 0

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          goToResultsPage()
        }}
      >
        <FiSearch
          aria-hidden
          className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          placeholder="What do you want to listen to?"
          aria-label="Search for songs"
          className="w-full rounded-full bg-surface-2 py-2.5 pl-12 pr-4 text-sm text-text placeholder:text-muted shadow-inset-border focus:outline-none"
        />
      </form>

      {showPanel && (
        <div className="absolute left-0 right-0 top-full z-40 mt-2 overflow-hidden rounded-lg bg-surface shadow-dialog">
          <div className="max-h-80 overflow-y-auto p-2">
            {results.length > 0 ? (
              results.map((song) => (
                <ResultRow key={song.id} song={song} onPlay={handlePlay} />
              ))
            ) : (
              <p className="px-2 py-3 text-sm text-muted">
                {isLoading ? 'Searching…' : `No results for “${trimmed}”.`}
              </p>
            )}
          </div>
          {results.length > 0 && (
            // Shade (bg-surface-2 on the bg-surface panel) separates the footer — no gray rule.
            <button
              type="button"
              onClick={goToResultsPage}
              className="block w-full bg-surface-2 px-4 py-2 text-left text-xs font-bold uppercase tracking-wide text-muted transition hover:text-text"
            >
              Show all results
            </button>
          )}
        </div>
      )}
    </div>
  )
}
