import { cn } from '@/lib/utils'

// Pill button primitive (DESIGN-spotify.md §4). Variants used so far:
//  - pill:    green accent CTA (play/active/CTA only — functional green)
//  - white:   white pill, for OAuth provider buttons (colored logo reads on white)
//  - outline:  transparent w/ light border, secondary actions
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'pill' | 'white' | 'outline'
}

export function Button({
  variant = 'pill',
  className,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50',
        variant === 'pill' && 'bg-accent text-black hover:scale-105',
        variant === 'white' && 'bg-text text-black hover:opacity-90',
        variant === 'outline' &&
          'border border-border-light bg-transparent text-text hover:border-text',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
