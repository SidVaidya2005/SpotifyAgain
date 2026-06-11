import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Session-refresh helper invoked by the root proxy.ts on every matched request.
// Refreshes the Supabase session cookie and gates only the personal routes;
// browsing and playback of public songs stay open to anonymous visitors.
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  // Do not run code between createServerClient and getUser — it can break sessions.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Browsing and playback are public; only personal pages require a session.
  const protectedPaths = ['/library', '/liked', '/playlist']
  const needsAuth = protectedPaths.some((p) => request.nextUrl.pathname.startsWith(p))
  if (!user && needsAuth) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return response
}
