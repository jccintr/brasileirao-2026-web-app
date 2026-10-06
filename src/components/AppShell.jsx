import { NavLink, Outlet } from 'react-router-dom'
import { FiAward, FiCalendar, FiSettings, FiShield } from 'react-icons/fi'
import Logo from './Logo.jsx'
import ThemeToggle from './ThemeToggle.jsx'

const TABS = [
  { to: '/', label: 'Classificação', Icon: FiAward, end: true },
  { to: '/rodadas', label: 'Rodadas', Icon: FiCalendar },
  { to: '/equipes', label: 'Equipes', Icon: FiShield },
  { to: '/ajustes', label: 'Ajustes', Icon: FiSettings },
]

// Cabeçalho no topo (com abas no desktop) + barra de abas fixa embaixo no celular.
export default function AppShell() {
  return (
    <div className="min-h-dvh pb-24 md:pb-10">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-header text-header-fg dark:border-line">
        <div className="mx-auto flex h-16 max-w-5xl items-center gap-6 px-4 sm:px-6">
          <NavLink to="/" aria-label="Brasileirão 2026 — início">
            <Logo />
          </NavLink>

          <nav aria-label="Principal" className="ml-4 hidden gap-1 md:flex">
            {TABS.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-gold ${
                    isActive ? 'bg-header-fg/15 text-header-fg' : 'text-header-fg/75 hover:text-header-fg'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pt-6 sm:px-6">
        <Outlet />
      </main>

      <nav
        aria-label="Principal"
        className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        <ul className="mx-auto grid max-w-md grid-cols-4">
          {TABS.map(({ to, label, Icon, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold focus-visible:outline-2 focus-visible:outline-primary ${
                    isActive ? 'text-primary-text' : 'text-muted'
                  }`
                }
              >
                <Icon className="size-5" aria-hidden="true" />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
