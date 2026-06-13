'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { FiX } from 'react-icons/fi'
import { Tooltip } from '@/components/Tooltip'

// Reusable Radix Dialog shell (library-docs.md → Radix UI). All app modals
// (Auth now; Upload/Playlist later) wrap this and drive open/onOpenChange from
// their Zustand store. Content always lives inside Dialog.Portal and includes a
// Title + Description for accessibility.
interface ModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  children: React.ReactNode
}

export function Modal({ open, onOpenChange, title, description, children }: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-base/80 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-card p-8 text-text shadow-dialog focus:outline-none">
          <Dialog.Title className="text-center text-2xl font-bold">{title}</Dialog.Title>
          <Dialog.Description className="mt-2 text-center text-sm text-muted">
            {description}
          </Dialog.Description>
          <div className="mt-6">{children}</div>
          <Tooltip content="Close">
            <Dialog.Close
              aria-label="Close"
              className="absolute right-4 top-4 text-muted transition hover:text-text focus:outline-none"
            >
              <FiX className="h-5 w-5" />
            </Dialog.Close>
          </Tooltip>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
