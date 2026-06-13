import type { Metadata } from 'next'
import { Figtree } from 'next/font/google'
import './globals.css'
import { createClient } from '@/lib/supabase/server'
import { UserProvider } from '@/providers/UserProvider'
import { ReactQueryProvider } from '@/providers/ReactQueryProvider'
import { ModalProvider } from '@/providers/ModalProvider'
import { ToasterProvider } from '@/providers/ToasterProvider'
import { TooltipProvider } from '@/providers/TooltipProvider'
import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'
import { BottomNav } from '@/components/BottomNav'
import { PortfolioLinks } from '@/components/PortfolioLinks'
import { PlayerBar } from '@/components/player/PlayerBar'

const figtree = Figtree({ subsets: ['latin'], variable: '--font-sans', display: 'swap' })

export const metadata: Metadata = {
  title: 'SpotifyAgain',
  description: 'A full-stack music streaming app.',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Seed the client UserProvider from the server so the Header renders the
  // correct auth state on first paint. getUser() returns null for anonymous
  // visitors (the expected no-session state) — that's fine.
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <html lang="en" className={figtree.variable}>
      <body className="h-dvh overflow-hidden">
        <UserProvider initialUser={user}>
          {/* React Query wraps the whole tree so both the grid (in <main>) and the
              layout-mounted PlayerBar share one liked-songs cache. */}
          <ReactQueryProvider>
            <TooltipProvider>
              <ToasterProvider />
              <ModalProvider />
              {/* Fixed app-shell (DESIGN §10.1): the Header (full-width top), Sidebar (left,
                  inset between header & player), and PlayerBar (bottom) are all fixed — only
                  <main> scrolls, so the chrome never moves on scroll. main is offset by the
                  header height (top-16), sidebar width (md:left-24 / lg:left-64), and player
                  height (bottom-24); pb-28 clears the mobile BottomNav. */}
              <Header />
              <Sidebar />
              <main className="fixed inset-x-0 top-16 bottom-24 overflow-y-auto pb-28 md:left-24 md:pb-6 lg:left-64">
                {/* Subtle top-of-content gradient for depth (DESIGN §10.4). */}
                <div
                  aria-hidden
                  className="top-fade pointer-events-none absolute inset-x-0 top-0 -z-10 h-48"
                />
                {children}
                {/* Author/portfolio links for mobile, where the sidebar (which carries them
                    md+) is hidden. Sits at the end of the scrollable content; the pb-28 above
                    keeps it clear of the BottomNav. */}
                <div className="mt-12 px-6 md:hidden">
                  <PortfolioLinks variant="full" className="items-center text-center" />
                </div>
              </main>
              <PlayerBar />
              <BottomNav />
            </TooltipProvider>
          </ReactQueryProvider>
        </UserProvider>
      </body>
    </html>
  )
}
