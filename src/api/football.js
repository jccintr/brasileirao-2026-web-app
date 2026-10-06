import { apiRequest } from './client.js'
import { COMPETITION_CODE, COMPETITION_ID, SEASON } from '../config/env.js'

export function getCompetitionInfo(options) {
  return apiRequest(`/competitions/${COMPETITION_CODE}`, options)
}

export function getStandings(options) {
  return apiRequest(`/competitions/${COMPETITION_CODE}/standings`, options)
}

// Todas as partidas da temporada de uma vez: a tela de Rodadas troca de rodada
// sem nova chamada e descobre a rodada atual pela data.
export function getAllMatches(options) {
  return apiRequest(`/competitions/${COMPETITION_CODE}/matches`, options)
}

export function getTeams(options) {
  return apiRequest(`/competitions/${COMPETITION_CODE}/teams?season=${SEASON}`, options)
}

export function getTeamMatches(teamId, options) {
  return apiRequest(`/teams/${teamId}/matches?competitions=${COMPETITION_ID}`, options)
}

// Data local (YYYY-MM-DD), a mesma que a pessoa vê no calendário.
export function todayISODate(now = new Date()) {
  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

// Partidas de hoje (não só as "ao vivo"): a API não tem um status combinado para
// IN_PLAY + PAUSED, então trazemos o dia e filtramos no cliente (utils/liveMatches.js).
// Sempre ignora o cache: a aba Ao Vivo atualiza sozinha e precisa do placar mais recente.
export function getTodayMatches() {
  const today = todayISODate()
  return apiRequest(`/competitions/${COMPETITION_CODE}/matches?dateFrom=${today}&dateTo=${today}`, {
    skipCache: true,
  })
}
