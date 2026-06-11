'use client'

import { Toaster } from 'sonner'

// Single sonner mount for the whole app (library-docs.md → sonner). Dark theme
// to match the near-black surfaces; use toast.success/error with friendly copy.
export function ToasterProvider() {
  return <Toaster theme="dark" position="bottom-center" />
}
