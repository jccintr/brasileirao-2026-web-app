import { FiCheck, FiMonitor, FiMoon, FiSun } from 'react-icons/fi'
import PageHeading from '../components/PageHeading.jsx'
import { TOKEN_MISSING } from '../config/env.js'
import { useTheme } from '../context/ThemeContext.jsx'

const OPTIONS = [
  { value: 'system', label: 'Automático (sistema)', Icon: FiMonitor },
  { value: 'light', label: 'Claro', Icon: FiSun },
  { value: 'dark', label: 'Escuro', Icon: FiMoon },
]

export default function SettingsPage() {
  const { preference, setPreference } = useTheme()

  return (
    <>
      <PageHeading title="Ajustes" />

      <section aria-labelledby="appearance" className="mb-8 max-w-xl">
        <h2 id="appearance" className="mb-2 text-sm font-bold tracking-widest text-muted">
          Aparência
        </h2>
        <div role="radiogroup" aria-labelledby="appearance" className="overflow-hidden rounded-2xl border border-line bg-surface">
          {OPTIONS.map(({ value, label, Icon }) => {
            const selected = preference === value
            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setPreference(value)}
                className="flex w-full cursor-pointer items-center gap-3 border-b border-line px-4 py-3.5 text-left last:border-b-0 hover:bg-elevated focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary"
              >
                <Icon className="size-5 text-soft" aria-hidden="true" />
                <span className="flex-1 font-medium">{label}</span>
                {selected && <FiCheck className="size-5 text-primary-text" aria-hidden="true" />}
              </button>
            )
          })}
        </div>
      </section>

      <section aria-labelledby="about" className="max-w-xl">
        <h2 id="about" className="mb-2 text-sm font-bold tracking-widest text-muted">
          Sobre os dados
        </h2>
        <div className="space-y-3 rounded-2xl border border-line bg-surface p-4 text-sm text-soft">
          <p>Dados fornecidos por football-data.org — competição BSA (Campeonato Brasileiro Série A).</p>
          {TOKEN_MISSING && (
            <p role="alert" className="font-medium text-danger">
              Nenhuma chave de API configurada. Crie um arquivo .env com VITE_FOOTBALL_DATA_TOKEN (chave gratuita em
              football-data.org/client/register) e reinicie o servidor.
            </p>
          )}
          <a
            href="https://www.football-data.org"
            target="_blank"
            rel="noreferrer"
            className="inline-block font-semibold text-primary-text underline-offset-2 hover:underline"
          >
            football-data.org
          </a>
        </div>
      </section>
    </>
  )
}
