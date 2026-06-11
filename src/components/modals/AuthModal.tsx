'use client'

import { usePathname } from 'next/navigation'
import { FcGoogle } from 'react-icons/fc'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useAuthModal } from '@/stores/use-auth-modal'
import { Modal } from '@/components/Modal'
import { Button } from '@/components/Button'

export function AuthModal() {
  const { isOpen, onClose } = useAuthModal()
  const pathname = usePathname()

  const onOpenChange = (open: boolean) => {
    if (!open) onClose()
  }

  const onContinueWithGoogle = async () => {
    const supabase = createClient()
    // Return the user to where they were; the callback validates `next` is a
    // same-origin relative path before redirecting back.
    const redirectTo = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=${encodeURIComponent(pathname)}`
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    })
    // On success the browser is redirected to Google by signInWithOAuth; we only
    // reach here on a client-side failure to start the flow.
    if (error) {
      console.error('[AuthModal]', error.message)
      toast.error('Could not start Google sign-in. Please try again.')
    }
  }

  return (
    <Modal
      open={isOpen}
      onOpenChange={onOpenChange}
      title="Log in to SpotifyAgain"
      description="Sign in to upload, like, and build playlists."
    >
      <Button variant="white" onClick={onContinueWithGoogle} className="w-full">
        <FcGoogle className="h-5 w-5" />
        Continue with Google
      </Button>
    </Modal>
  )
}
