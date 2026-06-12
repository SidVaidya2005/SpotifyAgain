import { FiGlobe, FiLock } from 'react-icons/fi'
import { cn } from '@/lib/utils'

interface VisibilityBadgeProps {
  isPublic: boolean
  className?: string
}

// Public/private indicator chip for the user's own uploads (Library only). Kept
// achromatic — DESIGN §7/§9 reserve the accent green for functional highlights, so
// the two states are distinguished by icon + label, not color. Badge type role
// (DESIGN §3): 10px (text-2xs), semibold, pill geometry.
export function VisibilityBadge({ isPublic, className }: VisibilityBadgeProps) {
  const Icon = isPublic ? FiGlobe : FiLock

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full bg-surface-2 px-2 py-0.5 text-2xs font-semibold text-muted',
        className,
      )}
    >
      <Icon className="h-3 w-3" />
      {isPublic ? 'Public' : 'Private'}
    </span>
  )
}
