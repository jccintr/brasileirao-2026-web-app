import { buildUpstreamUrl, cacheControlFor, handleFootballRequest } from './footballProxy.js'

const BASE = 'https://api.football-data.org'

describe('buildUpstreamUrl', () => {
  it.each([
    [['v4', 'competitions', 'BSA'], {}, `${BASE}/v4/competitions/BSA`],
    [['v4', 'competitions', 'BSA', 'standings'], {}, `${BASE}/v4/competitions/BSA/standings`],
    [['v4', 'competitions', 'BSA', 'matches'], {}, `${BASE}/v4/competitions/BSA/matches`],
    [['v4', 'competitions', 'BSA', 'matches'], { dateFrom: '2026-10-06', dateTo: '2026-10-06' }, `${BASE}/v4/competitions/BSA/matches?dateFrom=2026-10-06&dateTo=2026-10-06`],
    [['v4', 'competitions', 'BSA', 'teams'], { season: '2026' }, `${BASE}/v4/competitions/BSA/teams?season=2026`],
    [['v4', 'teams', '1783', 'matches'], { competitions: '2013' }, `${BASE}/v4/teams/1783/matches?competitions=2013`],
  ])('permite %j', (path, query, expected) => {
    expect(buildUpstreamUrl(path, query)).toBe(expected)
  })

  it('ignora o parâmetro interno "path" da rota catch-all', () => {
    expect(buildUpstreamUrl(['v4', 'competitions', 'BSA', 'standings'], { path: ['v4'] })).toBe(`${BASE}/v4/competitions/BSA/standings`)
  })

  it.each([
    [['v4', 'competitions'], {}],
    [['v4', 'competitions', 'PL', 'standings'], {}],
    [['v4', 'persons', '1'], {}],
    [['v4', 'teams', 'abc', 'matches'], {}],
    [['v4', 'competitions', 'BSA', '..', 'x'], {}],
    [['v4', 'competitions', 'BSA', 'standings'], { token: 'x' }],
    [['v4', 'competitions', 'BSA', 'matches'], { dateFrom: '2026-10-06&x=1' }],
    [[], {}],
  ])('bloqueia %j', (path, query) => {
    expect(buildUpstreamUrl(path, query)).toBeNull()
  })
})

describe('cacheControlFor', () => {
  it('cache curto para jogos do dia e maior para o resto', () => {
    expect(cacheControlFor({ dateFrom: '2026-10-06' })).toContain('s-maxage=30')
    expect(cacheControlFor({})).toContain('s-maxage=60')
  })
})

function fakeRes() {
  const res = { headers: {}, statusCode: 0, body: '' }
  res.setHeader = (name, value) => { res.headers[name.toLowerCase()] = value }
  res.end = (body) => { res.body = body }
  return res
}
const upstreamResponse = (body, status = 200, headers = {}) => ({
  ok: status < 400,
  status,
  headers: { get: (name) => headers[name.toLowerCase()] ?? null },
  text: async () => JSON.stringify(body),
})
const req = (path, query = {}, method = 'GET') => ({ method, query: { path, ...query } })

describe('handleFootballRequest', () => {
  it('repassa a chamada com o token do servidor e devolve com cache de CDN', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(upstreamResponse({ ok: 1 }, 200, { 'content-type': 'application/json;charset=UTF-8' }))
    const res = fakeRes()

    await handleFootballRequest(req(['v4', 'competitions', 'BSA', 'standings']), res, { fetchImpl, token: 'secreto' })

    expect(fetchImpl).toHaveBeenCalledWith(`${BASE}/v4/competitions/BSA/standings`, { headers: { 'X-Auth-Token': 'secreto' } })
    expect(res.statusCode).toBe(200)
    expect(JSON.parse(res.body)).toEqual({ ok: 1 })
    expect(res.headers['cache-control']).toContain('s-maxage=60')
    expect(res.headers['content-type']).toContain('application/json')
  })

  it('jogos do dia usam cache curto', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(upstreamResponse({}))
    const res = fakeRes()
    await handleFootballRequest(req(['v4', 'competitions', 'BSA', 'matches'], { dateFrom: '2026-10-06', dateTo: '2026-10-06' }), res, { fetchImpl, token: 't' })
    expect(res.headers['cache-control']).toContain('s-maxage=30')
  })

  it('erros da API não vão para o cache e o Retry-After é repassado', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(upstreamResponse({ message: 'limit' }, 429, { 'retry-after': '42' }))
    const res = fakeRes()
    await handleFootballRequest(req(['v4', 'competitions', 'BSA', 'standings']), res, { fetchImpl, token: 't' })
    expect(res.statusCode).toBe(429)
    expect(res.headers['cache-control']).toBe('no-store')
    expect(res.headers['retry-after']).toBe('42')
  })

  it('rota fora da lista: 404 sem chamar a API', async () => {
    const fetchImpl = vi.fn()
    const res = fakeRes()
    await handleFootballRequest(req(['v4', 'persons', '1']), res, { fetchImpl, token: 't' })
    expect(res.statusCode).toBe(404)
    expect(fetchImpl).not.toHaveBeenCalled()
  })

  it('só aceita GET', async () => {
    const fetchImpl = vi.fn()
    const res = fakeRes()
    await handleFootballRequest(req(['v4', 'competitions', 'BSA'], {}, 'POST'), res, { fetchImpl, token: 't' })
    expect(res.statusCode).toBe(405)
    expect(res.headers.allow).toBe('GET')
    expect(fetchImpl).not.toHaveBeenCalled()
  })

  it('sem token configurado devolve erro claro', async () => {
    const res = fakeRes()
    await handleFootballRequest(req(['v4', 'competitions', 'BSA']), res, { fetchImpl: vi.fn(), token: '' })
    expect(res.statusCode).toBe(500)
    expect(JSON.parse(res.body).message).toMatch(/FOOTBALL_DATA_TOKEN/)
  })

  it('falha de rede vira 502 sem cache', async () => {
    const res = fakeRes()
    await handleFootballRequest(req(['v4', 'competitions', 'BSA']), res, { fetchImpl: vi.fn().mockRejectedValue(new Error('down')), token: 't' })
    expect(res.statusCode).toBe(502)
    expect(res.headers['cache-control']).toBe('no-store')
  })
})
