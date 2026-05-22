import { useAppNavigation } from './context'
import type { AppScreen } from './types'

const NAV_ITEMS: { id: AppScreen; label: string }[] = [
  { id: 'rams', label: 'RAMS' },
  { id: 'email', label: 'Email' },
  { id: 'settings', label: 'Settings' }
]

export function Sidebar(): React.JSX.Element {
  const { screen, navigate } = useAppNavigation()

  return (
    <nav
      className="flex w-52 shrink-0 flex-col border-r border-slate-700 bg-slate-900 px-3 py-4"
      aria-label="Main navigation"
    >
      <p className="mb-4 px-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        ALFA RAMS
      </p>
      <ul className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const active = screen === item.id
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => navigate(item.id)}
                aria-current={active ? 'page' : undefined}
                className={`w-full rounded-lg border px-3 py-2.5 text-left text-sm font-medium transition ${
                  active
                    ? 'border-sky-600 bg-slate-800 text-slate-100'
                    : 'border-transparent text-slate-400 hover:border-slate-600 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                {item.label}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
