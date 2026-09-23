import { cn } from 'cn'

/** The dark panel every screen opens on — always this exact panel from the design regardless of
 * the app's own light/dark theme, so its children (labels, diagrams, charts) stay legible no
 * matter which OS appearance the rest of the window is following. */
export function HeroBand({
  className,
  children
}: {
  className?: string
  children: React.ReactNode
}): React.JSX.Element {
  return (
    <div
      className={cn(
        'relative mx-3 mt-2 overflow-hidden rounded-[14px] border border-[var(--hero-border)] bg-[image:var(--hero-bg)] px-5 py-[18px] text-foreground shadow-[0_10px_26px_rgba(30,36,42,0.08)]',
        className
      )}
    >
      {children}
    </div>
  )
}
