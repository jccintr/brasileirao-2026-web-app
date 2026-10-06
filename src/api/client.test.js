const jsonResponse = (body, status = 200) => ({ ok: status < 400, status, json: async () => body })

async function loadClient(env = {}) {
  vi.resetModules()
  for (const [key, value] of Object.entries(env)) vi.stubEnv(key, value)
  return import('./client.js')
}

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('apiRequest', () => {
  it('usa a URL padrão e envia a chave no header quando configurada', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ ok: 1 }))
    vi.stubGlobal('fetch', fetchMock)
    const { apiRequest } = await loadClient({ VITE_FOOTBALL_DATA_TOKEN: 'abc' })

    await apiRequest('/competitions/BSA')

    expect(fetchMock).toHaveBeenCalledWith('https://api.football-data.org/v4/competitions/BSA', {
      headers: { 'X-Auth-Token': 'abc' },
    })
  })

  it('sem chave não envia header (evita preflight) e respeita URL própria', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({}))
    vi.stubGlobal('fetch', fetchMock)
    const { apiRequest } = await loadClient({ VITE_API_BASE_URL: 'https://proxy.example.com/v4/' })

    await apiRequest('/x')

    expect(fetchMock).toHaveBeenCalledWith('https://proxy.example.com/v4/x', { headers: undefined })
  })

  it('reaproveita o cache por 60s e depois busca de novo', async () => {
    vi.useFakeTimers()
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ n: 1 }))
    vi.stubGlobal('fetch', fetchMock)
    const { apiRequest } = await loadClient()

    await apiRequest('/a')
    await apiRequest('/a')
    expect(fetchMock).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(61_000)
    await apiRequest('/a')
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('skipCache força nova busca', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({}))
    vi.stubGlobal('fetch', fetchMock)
    const { apiRequest } = await loadClient()

    await apiRequest('/a')
    await apiRequest('/a', { skipCache: true })
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('junta chamadas simultâneas ao mesmo caminho em uma só', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({}))
    vi.stubGlobal('fetch', fetchMock)
    const { apiRequest } = await loadClient()

    await Promise.all([apiRequest('/a'), apiRequest('/a'), apiRequest('/a')])
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it.each([
    [403, /Acesso negado/],
    [404, /não encontrado/],
    [429, /Muitas requisições/],
    [500, /código 500/],
  ])('status %i vira mensagem amigável e não entra no cache', async (status, message) => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({}, status))
    vi.stubGlobal('fetch', fetchMock)
    const { apiRequest } = await loadClient()

    await expect(apiRequest('/a')).rejects.toThrow(message)
    await expect(apiRequest('/a')).rejects.toThrow(message)
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('falha de rede (inclui CORS) vira mensagem de conexão', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))
    const { apiRequest } = await loadClient()

    await expect(apiRequest('/a')).rejects.toThrow(/Não foi possível conectar/)
  })
})
