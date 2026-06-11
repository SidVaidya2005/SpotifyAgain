import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// The only Route Handler in the app: completes the OAuth PKCE flow by exchanging
// the authorization code for a session, then redirects to the validated
// same-origin `next` path. The profiles row is created by the handle_new_user DB
// trigger (Feature 06), so the callback never writes a profile itself.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // Only allow same-origin relative paths; never redirect to an external URL.
  const nextParam = searchParams.get('next')
  const next = nextParam?.startsWith('/') ? nextParam : '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      console.error('[auth/callback]', error.message)
      return NextResponse.redirect(`${origin}/`)
    }
    return NextResponse.redirect(`${origin}${next}`)
  }

  return NextResponse.redirect(`${origin}/`)
}
