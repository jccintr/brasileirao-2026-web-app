import { Link } from 'react-router-dom'
import { getTeams } from '../api/football.js'
import PageHeading from '../components/PageHeading.jsx'
import { EmptyState, ErrorState, LoadingState } from '../components/States.jsx'
import TeamCrest from '../components/TeamCrest.jsx'
import { useAsync } from '../hooks/useAsync.js'

const loadTeams = async (options) => {
  const data = await getTeams(options)
  return [...(data.teams ?? [])].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
}

export default function TeamsPage() {
  const { data: teams, error, loading, reload } = useAsync(loadTeams)

  return (
    <>
      <PageHeading title="Equipes" subtitle="Toque em um time para ver os jogos" onRefresh={teams ? reload : undefined} refreshing={loading} />

      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : !teams ? (
        <LoadingState label="Carregando equipes…" />
      ) : teams.length === 0 ? (
        <EmptyState>Nenhuma equipe encontrada.</EmptyState>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4">
          {teams.map((team) => (
            <li key={team.id}>
              <Link
                to={`/equipes/${team.id}`}
                className="flex h-full flex-col items-center gap-3 rounded-2xl border border-line bg-surface px-3 py-5 text-center transition-colors hover:border-primary/60 hover:bg-elevated focus-visible:outline-2 focus-visible:outline-primary"
              >
                <TeamCrest uri={team.crest} size={56} />
                <span className="text-sm font-semibold leading-tight">{team.shortName || team.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
