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
  return apiRequest(`/teams/${teamId}/matches/?competitions=${COMPETITION_ID}`, options)
}
