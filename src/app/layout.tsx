import type { Metadata } from 'next'
import { Figtree } from 'next/font/google'
import './globals.css'
import { createClient } from '@/lib/supabase/server'
import { UserProvider } from '@/providers/UserProvider'
import { ModalProvider } from '@/providers/ModalProvider'
import { ToasterProvider } from '@/providers/ToasterProvider'
import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'
import { BottomNav } from '@/components/BottomNav'
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
          <ToasterProvider />
          <ModalProvider />
          <div className="flex flex-1 overflow-hidden">
            <Sidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
              <Header />
              <main className="flex-1 overflow-y-auto pb-48 md:pb-24">
                {children}
              </main>
            </div>
          </div>
          <PlayerBar />
          <BottomNav />
        </UserProvider>
      </body>
    </html>
  )
}
