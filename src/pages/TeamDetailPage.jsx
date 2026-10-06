import { useCallback, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { FiChevronLeft } from 'react-icons/fi'
import { getTeamMatches, getTeams } from '../api/football.js'
import MatchCard from '../components/MatchCard.jsx'
import PageHeading from '../components/PageHeading.jsx'
import { EmptyState, ErrorState, LoadingState } from '../components/States.jsx'
import TeamCrest from '../components/TeamCrest.jsx'
import { useAsync } from '../hooks/useAsync.js'
import { splitTeamMatches } from '../utils/matchday.js'

function TeamDetail({ teamId }) {
  const load = useCallback(
    async (options) => {
      // A lista de equipes costuma estar no cache; ela só serve para descobrir nome e escudo.
      const [teamsData, matchesData] = await Promise.all([
        getTeams(options).catch(() => null),
        getTeamMatches(teamId, options),
      ])
      const matches = matchesData.matches ?? []
      const fromList = teamsData?.teams?.find((t) => String(t.id) === String(teamId))
      const fromMatch = matches
        .flatMap((m) => [m.homeTeam, m.awayTeam])
        .find((t) => String(t?.id) === String(teamId))
      return { team: fromList ?? fromMatch ?? null, matches }
    },
    [teamId],
  )
  const { data, error, loading, reload } = useAsync(load)
  const sections = useMemo(() => (data ? splitTeamMatches(data.matches) : []), [data])
  const team = data?.team
  const name = team?.shortName || team?.name

  return (
    <>
      <Link
        to="/equipes"
        className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-soft hover:text-fg focus-visible:outline-2 focus-visible:outline-primary"
      >
        <FiChevronLeft className="size-4" aria-hidden="true" />
        Equipes
      </Link>

      {team && (
        <div className="mb-5 flex items-center gap-4">
          <TeamCrest uri={team.crest} size={56} />
          <PageHeading title={name} onRefresh={reload} refreshing={loading} className="" />
        </div>
      )}
      {!team && <h1 className="sr-only">Equipe</h1>}

      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : !data ? (
        <LoadingState label="Carregando jogos…" />
      ) : sections.length === 0 ? (
        <EmptyState>Nenhuma partida encontrada.</EmptyState>
      ) : (
        <div className="space-y-8">
          {sections.map((section) => (
            <section key={section.title} aria-labelledby={`sec-${section.title}`}>
              <h2 id={`sec-${section.title}`} className="mb-3 text-lg font-bold text-soft">
                {section.title}
              </h2>
              <ul className="grid gap-3 md:grid-cols-2">
                {section.matches.map((match) => (
                  <li key={match.id}>
                    <MatchCard match={match} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </>
  )
}

// `key` remonta a página quando o time muda, refazendo a busca do zero.
export default function TeamDetailPage() {
  const { teamId } = useParams()
  return <TeamDetail key={teamId} teamId={teamId} />
}
