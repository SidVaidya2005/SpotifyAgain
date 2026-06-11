import type { Metadata } from 'next'
import { Figtree } from 'next/font/google'
import './globals.css'
import { Sidebar } from '@/components/Sidebar'
import { BottomNav } from '@/components/BottomNav'
import { PlayerBar } from '@/components/player/PlayerBar'

const figtree = Figtree({ subsets: ['latin'], variable: '--font-sans', display: 'swap' })

export const metadata: Metadata = {
  title: 'SpotifyAgain',
  description: 'A full-stack music streaming app.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={figtree.variable}>
      <body className="flex h-dvh flex-col">
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto pb-48 md:pb-24">
            {children}
          </main>
        </div>
        <PlayerBar />
        <BottomNav />
      </body>
    </html>
  )
}
