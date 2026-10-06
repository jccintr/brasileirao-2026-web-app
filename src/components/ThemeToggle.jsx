import { FiMonitor, FiMoon, FiSun } from 'react-icons/fi'
import { useTheme } from '../context/ThemeContext.jsx'

const OPTIONS = [
  { value: 'light', label: 'Claro', Icon: FiSun },
  { value: 'system', label: 'Sistema', Icon: FiMonitor },
  { value: 'dark', label: 'Escuro', Icon: FiMoon },
]

// Versão compacta para o cabeçalho (cores vêm dos tokens --header-*).
export default function ThemeToggle() {
  const { preference, setPreference } = useTheme()

  return (
    <div role="group" aria-label="Tema" className="inline-flex rounded-full border border-header-fg/30 p-0.5">
      {OPTIONS.map(({ value, label, Icon }) => {
        const selected = preference === value
        return (
          <button
            key={value}
            type="button"
            aria-pressed={selected}
            aria-label={`Tema ${label.toLowerCase()}`}
            title={label}
            onClick={() => setPreference(value)}
            className={`flex size-8 cursor-pointer items-center justify-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-gold ${
              selected ? 'bg-header-fg text-header' : 'text-header-fg/75 hover:text-header-fg'
            }`}
          >
            <Icon className="size-4" aria-hidden="true" />
          </button>
        )
      })}
    </div>
  )
}
