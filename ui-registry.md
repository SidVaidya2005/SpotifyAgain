# UI Registry

Visual-consistency reference for SpotifyAgain components. Read before building any new
UI; match the patterns captured here. All values are Tailwind v4 `@theme` token
utilities (see `context/architecture.md` → Key Patterns) — never raw hex/px.

> This project's UI predates the registry (built across features 01–16). Only
> components imprinted from here forward are recorded. Run `/imprint audit` to establish
> a full baseline across the existing components.

---

### PortfolioLinks

File: `src/components/PortfolioLinks.tsx`
Last updated: 2026-06-13

| Property         | Class                                   |
| ---------------- | --------------------------------------- |
| Background       | none (transparent, sits on `bg-surface`) |
| Border           | none                                    |
| Border radius    | none                                    |
| Text — primary   | n/a (icon links)                        |
| Text — secondary | `text-muted` (credit + default icon color) |
| Text — credit    | `text-xs` (Small type role, weight 400) |
| Spacing          | container `gap-3`; icon row `gap-4`; sidebar wrapper `px-4 py-6 lg:px-6` |
| Hover state      | `transition hover:text-text` (muted → text) |
| Shadow           | none                                    |
| Accent usage     | none — intentional (DESIGN §7: accent green is functional-only) |
| Icon size        | `h-5 w-5` (standard inline-action icon size) |

**Pattern notes:**
- **Icon-only links/buttons in the app shell** use `text-muted` → `hover:text-text`
  with `transition`, icon `h-5 w-5`, and a required `aria-label`. Matches the existing
  Header action buttons and `PlaylistList`. Never use accent green for these.
- **External links** carry `target="_blank" rel="noopener noreferrer"`; in-app actions
  (e.g. `mailto:`) omit `target`.
- **Variant pattern:** `variant="full"` adds a `text-xs text-muted` credit line above the
  icon row (use where there's horizontal room — full `lg` sidebar, full-width mobile
  footer); `variant="compact"` is icons-only, `justify-center` (the narrow `md` rail).
- **App-shell clearance rule (important):** the player bar is `fixed bottom-0 h-24`
  (96px) full-width. Any bottom-pinned shell content must reserve `pb-24` to clear it —
  `<main>` uses `md:pb-24`, and the `Sidebar` aside now uses `pb-24` so its `mt-auto`
  footer floats above the player instead of hiding behind it. Anything pinned to the
  bottom of the sidebar/main in future must keep this clearance.
