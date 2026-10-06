import { Link } from 'react-router-dom'
import { getStandings } from '../api/football.js'
import PageHeading from '../components/PageHeading.jsx'
import { EmptyState, ErrorState, LoadingState } from '../components/States.jsx'
import TeamCrest from '../components/TeamCrest.jsx'
import ZoneLegend from '../components/ZoneLegend.jsx'
import { QUALIFICATION_ZONES, getZoneForPosition } from '../config/qualificationZones.js'
import { useAsync } from '../hooks/useAsync.js'

const loadStandings = async (options) => {
  const data = await getStandings(options)
  const total = data.standings?.find((group) => group.type === 'TOTAL') ?? data.standings?.[0]
  return total?.table ?? []
}

const STAT_COLS = [
  { key: 'points', label: 'Pts', title: 'Pontos', strong: true },
  { key: 'playedGames', label: 'PJ', title: 'Jogos' },
  { key: 'won', label: 'V', title: 'Vitórias' },
  { key: 'draw', label: 'E', title: 'Empates' },
  { key: 'lost', label: 'D', title: 'Derrotas' },
  { key: 'goalsFor', label: 'GP', title: 'Gols pró', wide: true },
  { key: 'goalsAgainst', label: 'GC', title: 'Gols contra', wide: true },
  { key: 'goalDifference', label: 'SG', title: 'Saldo de gols' },
]

export default function StandingsPage() {
  const { data: rows, error, loading, reload } = useAsync(loadStandings)

  return (
    <>
      <PageHeading
        title="Classificação"
        subtitle="Campeonato Brasileiro Série A"
        onRefresh={rows ? reload : undefined}
        refreshing={loading}
      />

      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : !rows ? (
        <LoadingState label="Carregando classificação…" />
      ) : rows.length === 0 ? (
        <EmptyState>A classificação ainda não está disponível.</EmptyState>
      ) : (
        <div className="space-y-4">
          <ZoneLegend zones={QUALIFICATION_ZONES} />
          <div className="overflow-hidden rounded-2xl border border-line bg-surface">
            <table className="w-full border-collapse text-[13px] tabular-nums sm:text-sm">
              <caption className="sr-only">Tabela de classificação do Brasileirão Série A</caption>
              <thead>
                <tr className="border-b border-line text-xs text-muted">
                  <th scope="col" className="w-8 py-2.5 pl-3 text-left font-semibold sm:w-9">#</th>
                  <th scope="col" className="py-2.5 text-left font-semibold">Equipe</th>
                  {STAT_COLS.map((col) => (
                    <th
                      key={col.key}
                      scope="col"
                      title={col.title}
                      className={`w-8 py-2.5 text-center font-semibold last:pr-3 sm:w-11 ${col.wide ? 'hidden md:table-cell' : ''}`}
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const zone = getZoneForPosition(row.position)
                  const name = row.team.shortName || row.team.name
                  return (
                    <tr key={row.team.id} className="border-b border-line last:border-b-0 hover:bg-elevated">
                      <td
                        className="py-2.5 pl-2 font-semibold"
                        style={{ boxShadow: `inset 4px 0 0 ${zone?.color ?? 'transparent'}` }}
                      >
                        <span className="pl-1">{row.position}</span>
                      </td>
                      <td className="max-w-0 py-2.5 pr-1">
                        <Link
                          to={`/equipes/${row.team.id}`}
                          className="flex items-center gap-2 font-semibold hover:text-primary-text focus-visible:outline-2 focus-visible:outline-primary"
                        >
                          <TeamCrest uri={row.team.crest} size={22} />
                          <span className="truncate">{name}</span>
                        </Link>
                      </td>
                      {STAT_COLS.map((col) => (
                        <td
                          key={col.key}
                          className={`py-2.5 text-center last:pr-3 ${col.strong ? 'font-bold' : 'text-soft'} ${col.wide ? 'hidden md:table-cell' : ''}`}
                        >
                          {row[col.key]}
                        </td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  )
}
