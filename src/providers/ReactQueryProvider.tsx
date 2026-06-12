'use client'

import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Client-side server-state cache (architecture.md → stack). Mounted once in the
// root layout so every 'use client' consumer (LikeButton on cards + the player)
// shares one QueryClient. Held in useState so the client is created once per
// browser session, never re-instantiated on re-render.
export function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 60_000 } },
      }),
  )

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}
