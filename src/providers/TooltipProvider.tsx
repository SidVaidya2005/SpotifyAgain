'use client'

import * as TooltipPrimitive from '@radix-ui/react-tooltip'

// Single root provider for all tooltips (Radix requires one Provider ancestor). Mounted
// in layout.tsx wrapping the shell + player, so the shared delay applies app-wide.
export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return (
    <TooltipPrimitive.Provider delayDuration={300} skipDelayDuration={300}>
      {children}
    </TooltipPrimitive.Provider>
  )
}
