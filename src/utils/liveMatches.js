// Status que a football-data.org usa quando a bola está rolando. Não existe um status
// único "LIVE" na API, então filtramos essa lista no cliente.
const LIVE_STATUSES = new Set(['IN_PLAY', 'PAUSED', 'EXTRA_TIME', 'PENALTY_SHOOTOUT'])

export function isLiveStatus(status) {
  return LIVE_STATUSES.has(status)
}

export function filterLiveMatches(matches) {
  return (matches ?? []).filter((match) => isLiveStatus(match.status))
}
