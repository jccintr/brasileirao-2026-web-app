import { API_BASE_URL, API_TOKEN } from '../config/env.js'

// Cache simples em memória (por caminho) e deduplicação de chamadas em andamento.
// O plano gratuito da football-data.org permite só 10 requisições por minuto,
// então navegar entre telas não pode gerar chamadas repetidas.
const cache = new Map()
const inflight = new Map()
export const CACHE_TTL_MS = 60 * 1000

function friendlyMessage(status) {
  switch (status) {
    case 400:
      return 'Requisição inválida (parâmetro incorreto).'
    case 403:
      return 'Acesso negado pela API. Confira a chave VITE_FOOTBALL_DATA_TOKEN no arquivo .env e se o seu plano cobre esse recurso.'
    case 404:
      return 'Recurso não encontrado.'
    case 429:
      return 'Muitas requisições em pouco tempo (o plano gratuito permite 10 por minuto). Aguarde um instante e tente novamente.'
    default:
      return `A API retornou um erro (código ${status}).`
  }
}

async function request(path) {
  let response
  try {
    // Só envia o header quando há chave: sem ele a chamada não precisa de preflight de CORS.
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: API_TOKEN ? { 'X-Auth-Token': API_TOKEN } : undefined,
    })
  } catch {
    throw new Error(
      'Não foi possível conectar à API. Verifique sua internet (ou se a API liberou o acesso pelo navegador — CORS).',
    )
  }

  if (!response.ok) {
    const error = new Error(friendlyMessage(response.status))
    error.status = response.status
    throw error
  }

  return response.json()
}

export async function apiRequest(path, { skipCache = false } = {}) {
  const cached = cache.get(path)
  if (!skipCache && cached && Date.now() - cached.time < CACHE_TTL_MS) {
    return cached.data
  }

  // Uma chamada em andamento é, por definição, recente: reaproveita mesmo com skipCache.
  if (inflight.has(path)) return inflight.get(path)

  const promise = request(path)
    .then((data) => {
      cache.set(path, { data, time: Date.now() })
      return data
    })
    .finally(() => inflight.delete(path))

  inflight.set(path, promise)
  return promise
}

export function clearApiCache() {
  cache.clear()
  inflight.clear()
}
