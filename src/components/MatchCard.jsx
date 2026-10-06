import { STATUS_LABELS, formatDateTime } from '../utils/format.js'
import TeamCrest from './TeamCrest.jsx'

function Side({ team }) {
  return (
    <div className={`flex min-w-0 flex-1 flex-col items-center gap-1.5 text-center`}>
      <TeamCrest uri={team?.crest} size={32} />
      <span className="line-clamp-2 text-sm font-semibold leading-tight">
        {team?.shortName || team?.name || '?'}
      </span>
    </div>
  )
}

export default function MatchCard({ match }) {
  const isLive = match.status === 'IN_PLAY' || match.status === 'PAUSED'
  const home = match.score?.fullTime?.home
  const away = match.score?.fullTime?.away
  const hasScore = home != null && away != null

  return (
    <article className="rounded-2xl border border-line bg-surface p-4">
      <div className="mb-3 flex items-center justify-between gap-3 text-xs">
        <span className="text-muted">
          {match.matchday ? `Rodada ${match.matchday} · ` : ''}
          {formatDateTime(match.utcDate)}
        </span>
        {isLive ? (
          <span className="inline-flex items-center gap-1.5 font-bold uppercase tracking-wider text-danger">
            <span className="live-dot size-2 rounded-full bg-danger" aria-hidden="true" />
            Ao vivo
          </span>
        ) : (
          <span className="text-muted">{STATUS_LABELS[match.status] ?? match.status}</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Side team={match.homeTeam} />
        <div className="w-20 shrink-0 text-center font-heading text-3xl font-bold tabular-nums" aria-label="Placar">
          {hasScore || isLive ? (
            <span>
              {home ?? 0} <span className="text-muted">-</span> {away ?? 0}
            </span>
          ) : (
            <span className="text-lg font-semibold uppercase text-muted">vs</span>
          )}
        </div>
        <Side team={match.awayTeam} />
      </div>
    </article>
  )
}
