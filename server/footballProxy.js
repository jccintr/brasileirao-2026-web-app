// Proxy para a football-data.org usado em produção (função serverless da Vercel).
//
// Por quê: a chave não fica exposta no navegador, o navegador chama o mesmo domínio (sem
// CORS) e o cache da CDN da Vercel junta todos os visitantes numa fração das requisições,
// o que protege o limite de 10 por minuto do plano gratuito.

const UPSTREAM = 'https://api.football-data.org'

// Só repassa o que o app realmente usa; sem isso o proxy seria aberto para qualquer pessoa
// gastar a sua cota.
const ALLOWED_PATHS = [
  /^v4\/competitions\/BSA$/,
  /^v4\/competitions\/BSA\/(standings|matches|teams)$/,
  /^v4\/teams\/\d+\/matches$/,
]
const ALLOWED_PARAMS = new Set(['season', 'matchday', 'dateFrom', 'dateTo', 'competitions'])
const SAFE_VALUE = /^[A-Za-z0-9_-]{1,20}$/

const first = (value) => (Array.isArray(value) ? value[0] : value)

// Monta a URL de destino a partir do caminho (segmentos) e da query recebidos.
// Retorna null se o caminho ou algum parâmetro não for permitido.
export function buildUpstreamUrl(pathSegments, query = {}, base = UPSTREAM) {
  const segments = (Array.isArray(pathSegments) ? pathSegments : [pathSegments]).filter(Boolean)
  const path = segments.join('/')
  if (!ALLOWED_PATHS.some((pattern) => pattern.test(path))) return null

  const params = new URLSearchParams()
  for (const [key, raw] of Object.entries(query)) {
    if (key === 'path') continue // parâmetro interno da rota catch-all
    const value = first(raw)
    if (!ALLOWED_PARAMS.has(key) || !SAFE_VALUE.test(String(value))) return null
    params.set(key, String(value))
  }
  const queryString = params.toString()
  return `${base}/${path}${queryString ? `?${queryString}` : ''}`
}

// Jogos do dia (aba Ao Vivo) mudam o tempo todo: cache curto. O resto muda pouco.
export function cacheControlFor(query = {}) {
  return query.dateFrom || query.dateTo
    ? 'public, s-maxage=30, stale-while-revalidate=30'
    : 'public, s-maxage=60, stale-while-revalidate=300'
}

function sendJson(res, status, body, headers = {}) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  for (const [name, value] of Object.entries(headers)) res.setHeader(name, value)
  res.end(JSON.stringify(body))
}

export async function handleFootballRequest(
  req,
  res,
  {
    fetchImpl = fetch,
    token = process.env.FOOTBALL_DATA_TOKEN || process.env.VITE_FOOTBALL_DATA_TOKEN,
    base = process.env.FOOTBALL_DATA_API_URL || UPSTREAM,
  } = {},
) {
  if (req.method !== 'GET') {
    return sendJson(res, 405, { message: 'Método não permitido.' }, { Allow: 'GET' })
  }

  const url = buildUpstreamUrl(req.query?.path, req.query, base)
  if (!url) return sendJson(res, 404, { message: 'Recurso não encontrado.' })

  if (!token) {
    return sendJson(res, 500, { message: 'Servidor sem FOOTBALL_DATA_TOKEN configurado.' }, { 'Cache-Control': 'no-store' })
  }

  let upstream
  try {
    upstream = await fetchImpl(url, { headers: { 'X-Auth-Token': token } })
  } catch {
    return sendJson(res, 502, { message: 'Não foi possível falar com a football-data.org.' }, { 'Cache-Control': 'no-store' })
  }

  const body = await upstream.text()
  res.statusCode = upstream.status
  res.setHeader('Content-Type', upstream.headers.get('content-type') ?? 'application/json; charset=utf-8')
  // Só guarda no cache respostas boas; erros (ex.: 429) não podem ficar presos por minutos.
  res.setHeader('Cache-Control', upstream.ok ? cacheControlFor(req.query) : 'no-store')
  if (upstream.status === 429) {
    const retryAfter = upstream.headers.get('retry-after')
    if (retryAfter) res.setHeader('Retry-After', retryAfter)
  }
  res.end(body)
}
