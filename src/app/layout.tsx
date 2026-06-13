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
      <body className="flex h-dvh flex-col">
        <UserProvider initialUser={user}>
          {/* React Query wraps the whole tree so both the grid (in <main>) and the
              layout-mounted PlayerBar share one liked-songs cache. */}
          <ReactQueryProvider>
            <TooltipProvider>
              <ToasterProvider />
              <ModalProvider />
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <div className="flex flex-1 flex-col overflow-hidden">
                  <Header />
                  <main className="flex-1 overflow-y-auto pb-48 md:pb-24">
                    {children}
                    {/* Author/portfolio links for mobile, where the sidebar (which
                        carries them md+) is hidden. Sits at the end of the scrollable
                        content; the pb-48 above keeps it clear of the player + BottomNav. */}
                    <div className="mt-12 px-6 md:hidden">
                      <PortfolioLinks variant="full" className="items-center text-center" />
                    </div>
                  </main>
                </div>
              </div>
              <PlayerBar />
              <BottomNav />
            </TooltipProvider>
          </ReactQueryProvider>
        </UserProvider>
      </body>
    </html>
  )
}
