const ONE_DAY_MS = 24 * 60 * 60 * 1000

// Agrupa as partidas por rodada, ordenadas por data dentro de cada rodada.
export function groupMatchesByRound(matches) {
  const byRound = new Map()
  for (const match of matches) {
    if (match.matchday == null) continue
    if (!byRound.has(match.matchday)) byRound.set(match.matchday, [])
    byRound.get(match.matchday).push(match)
  }
  for (const list of byRound.values()) {
    list.sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate))
  }
  return byRound
}

// Rodada "atual": a que está em andamento hoje (com 1 dia de folga para cada lado) ou,
// se não houver, a próxima agendada. Se a temporada terminou, a última rodada.
export function computeCurrentMatchday(matches, fallback = 1) {
  if (!matches || matches.length === 0) return fallback

  const rounds = [...groupMatchesByRound(matches).entries()]
    .map(([day, list]) => {
      const times = list.map((m) => new Date(m.utcDate).getTime())
      return { day, min: Math.min(...times), max: Math.max(...times) }
    })
    .sort((a, b) => a.day - b.day)

  if (rounds.length === 0) return fallback

  const now = Date.now()
  const ongoing = rounds.find((r) => now >= r.min - ONE_DAY_MS && now <= r.max + ONE_DAY_MS)
  if (ongoing) return ongoing.day

  const next = rounds.find((r) => r.min > now)
  if (next) return next.day

  return rounds[rounds.length - 1].day
}

// Separa os jogos de um time em "próximos" (mais próximo primeiro) e "últimos resultados"
// (mais recente primeiro). Seções vazias são omitidas.
const isUpcoming = (match, now) =>
  match.status === 'SCHEDULED' || match.status === 'TIMED' || new Date(match.utcDate).getTime() >= now

export function splitTeamMatches(matches, now = Date.now()) {
  const upcoming = matches
    .filter((m) => isUpcoming(m, now))
    .sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate))
  const past = matches
    .filter((m) => !isUpcoming(m, now))
    .sort((a, b) => new Date(b.utcDate) - new Date(a.utcDate))
  return [
    { title: 'Próximos jogos', matches: upcoming },
    { title: 'Últimos resultados', matches: past },
  ].filter((section) => section.matches.length > 0)
}
