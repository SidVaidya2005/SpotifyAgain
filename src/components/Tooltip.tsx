'use client'

import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { cn } from '@/lib/utils'

interface TooltipProps {
  content: string
  children: React.ReactNode
  side?: 'top' | 'right' | 'bottom' | 'left'
  // Extra classes for the content (e.g. `lg:hidden` to limit a tooltip to the md rail).
  className?: string
}

// Reusable hover/focus tooltip for icon-only controls (library-docs.md → Radix UI).
// Wraps a single trigger via `Trigger asChild`; the trigger keeps its own aria-label,
// so this is a pointer/keyboard affordance and never the only label (touch/AT fallback).
// Requires the root <TooltipProvider> (mounted in layout.tsx) as an ancestor.
export function Tooltip({ content, children, side = 'top', className }: TooltipProps) {
  return (
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side={side}
          sideOffset={6}
          className={cn(
            'z-50 select-none rounded-md bg-surface-2 px-2 py-1 text-xs text-text shadow-dialog',
            className,
          )}
        >
          {content}
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  )
}
