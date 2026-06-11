import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// Next.js 16 request entry (formerly middleware.ts — renamed to proxy.ts; lives
// in src/ because the app does, and runs on the nodejs runtime). Refreshes the
// Supabase session on every matched request via updateSession, which also gates
// the personal routes.
export async function proxy(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  // Run on everything except Next internals and static asset files.
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
