import { NavLink } from 'react-router-dom'

const items = [
  { to: '/',                label: 'Dashboard',       short: 'Dash'    },
  { to: '/prediction',      label: 'Prediction',      short: 'Assess'  },
  { to: '/model-analytics', label: 'Model Analytics', short: 'Models'  },
  { to: '/results',         label: 'Results',         short: 'Results' },
  { to: '/health-insights', label: 'Health Insights', short: 'Insights'},
  { to: '/history',         label: 'History',         short: 'History' },
  { to: '/about',           label: 'About',           short: 'About'   },
]

function navLinkClass({ isActive }) {
  const base = 'rounded-md px-3 py-2.5 font-mono text-[10px] uppercase text-muted-foreground transition-colors hover:text-foreground block text-center'
  return isActive
    ? `${base} bg-primary text-primary-foreground hover:text-primary-foreground`
    : base
}

function mobileNavLinkClass({ isActive }) {
  const base = 'shrink-0 px-3 py-3 font-mono text-[9px] uppercase text-muted-foreground'
  return isActive
    ? `${base} text-primary border-b-2 border-primary`
    : base
}

export default function AppShell({ children }) {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased md:flex">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 z-40 hidden h-screen w-[92px] shrink-0 flex-col items-center justify-between border-r border-border bg-card/70 py-6 md:flex">
        <NavLink
          to="/"
          className="font-display text-2xl uppercase"
          style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
        >
          Cardia
        </NavLink>
        <nav aria-label="Primary" className="flex flex-col gap-1">
          {items.map(({ to, label, short }) => (
            <NavLink
              key={to}
              to={to}
              aria-label={label}
              title={label}
              end={to === '/'}
              className={navLinkClass}
            >
              {short}
            </NavLink>
          ))}
        </nav>
        <span
          className="font-mono text-[9px] uppercase text-muted-foreground"
          style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
        >
          Cardiovascular atlas
        </span>
      </aside>

      {/* Mobile header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 md:hidden">
        <div className="flex h-14 items-center justify-between px-4">
          <NavLink to="/" className="font-display text-2xl uppercase">Cardia</NavLink>
          <span className="font-mono text-[9px] uppercase text-muted-foreground">Clinical atlas</span>
        </div>
        <nav aria-label="Mobile primary" className="flex overflow-x-auto border-t border-border px-2">
          {items.map(({ to, label, short }) => (
            <NavLink key={to} to={to} aria-label={label} end={to === '/'} className={mobileNavLinkClass}>
              {short}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="min-w-0 flex-1">{children}</main>
    </div>
  )
}

export function PageIntro({ index, label, title, copy }) {
  return (
    <header className="atlas-grid border-b border-border px-5 py-12 sm:px-8 lg:px-12 lg:py-16">
      <p className="font-mono text-[10px] uppercase text-muted-foreground">({index}) — {label}</p>
      <div className="mt-8 grid gap-6 lg:grid-cols-12 lg:items-end">
        <h1 className="font-display text-6xl uppercase leading-[0.88] sm:text-8xl lg:col-span-8 lg:text-9xl">{title}</h1>
        <p className="max-w-md text-sm leading-relaxed text-muted-foreground lg:col-span-4">{copy}</p>
      </div>
    </header>
  )
}

export function Unavailable({ children = 'Unavailable' }) {
  return (
    <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 font-mono text-[9px] uppercase text-primary">
      {children}
    </span>
  )
}
