'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FiSearch } from 'react-icons/fi'
import { useDebounce } from '@/hooks/useDebounce'

interface SearchInputProps {
  initialQuery: string
}

// Debounced search box that drives the URL (not local fetching): the page is a
// Server Component that reads `?q=` and runs the RLS-scoped read. We seed the box
// once from `initialQuery` (a prop, not useSearchParams — avoids the Suspense
// boundary that hook requires); later prop changes don't clobber what the user is
// typing, since useState ignores subsequent initial values.
export function SearchInput({ initialQuery }: SearchInputProps) {
  const router = useRouter()
  const [value, setValue] = useState(initialQuery)
  const debounced = useDebounce(value, 300)

  // No setState here, so this doesn't trip React 19's set-state-in-effect rule.
  // router.replace keeps each keystroke out of the back-history stack.
  useEffect(() => {
    router.replace(debounced ? `/search?q=${encodeURIComponent(debounced)}` : '/search')
  }, [debounced, router])

  return (
    <div className="relative w-full max-w-md">
      <FiSearch
        aria-hidden
        className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="What do you want to listen to?"
        aria-label="Search for songs"
        className="w-full rounded-full bg-surface-2 py-3 pl-12 pr-4 text-sm text-text placeholder:text-muted shadow-inset-border focus:outline-none"
      />
    </div>
  )
}
