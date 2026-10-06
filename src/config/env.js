// Configuração lida das variáveis de ambiente do Vite (arquivo .env).
export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || 'https://api.football-data.org/v4'
).replace(/\/$/, '')

export const API_TOKEN = import.meta.env.VITE_FOOTBALL_DATA_TOKEN || ''

// Com uma URL própria (proxy), a chave fica no servidor e o navegador não precisa dela.
export const USES_CUSTOM_API = Boolean(import.meta.env.VITE_API_BASE_URL)
export const TOKEN_MISSING = !API_TOKEN && !USES_CUSTOM_API

// BSA = Brasileirão Série A
export const COMPETITION_CODE = 'BSA'
export const COMPETITION_ID = '2013'
export const SEASON = 2026

// 20 clubes, turno e returno.
export const TOTAL_MATCHDAYS = 38
