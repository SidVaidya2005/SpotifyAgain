import { FiGithub, FiLinkedin, FiMail, FiGlobe } from 'react-icons/fi'
import { PORTFOLIO_LINKS } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface PortfolioLinksProps {
  // 'full' shows a "Built by" credit above the icon row (where there's room);
  // 'compact' is icons-only (the narrow md sidebar rail).
  variant?: 'full' | 'compact'
  className?: string
}

// Plain presentational component (no hooks / no 'use client') so it can render in
// both the client Sidebar and the server root layout. Accent green stays
// functional-only (DESIGN §7) — links go muted → text on hover.
const LINKS = [
  { href: PORTFOLIO_LINKS.github, label: 'GitHub repository', icon: FiGithub, external: true },
  { href: PORTFOLIO_LINKS.linkedin, label: 'LinkedIn profile', icon: FiLinkedin, external: true },
  { href: PORTFOLIO_LINKS.email, label: 'Email Siddarth Vaidya', icon: FiMail, external: false },
  { href: PORTFOLIO_LINKS.website, label: 'Personal website', icon: FiGlobe, external: true },
] as const

export function PortfolioLinks({ variant = 'full', className }: PortfolioLinksProps) {
  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {variant === 'full' && (
        <span className="text-xs text-muted">Built by Siddarth Vaidya</span>
      )}
      <div
        className={cn(
          'flex flex-wrap items-center gap-4',
          variant === 'compact' && 'justify-center',
        )}
      >
        {LINKS.map(({ href, label, icon: Icon, external }) => (
          <a
            key={href}
            href={href}
            aria-label={label}
            {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            className="text-muted transition hover:text-text"
          >
            <Icon className="h-5 w-5" />
          </a>
        ))}
      </div>
    </div>
  )
}
