import { act, fireEvent, render, screen } from '@testing-library/react'
import LivePage, { POLL_INTERVAL_MS } from './LivePage.jsx'
import * as football from '../api/football.js'

vi.mock('../api/football.js')

const team = (id, name) => ({ id, name, shortName: name, crest: '' })
const match = (id, status, home, away, score = [null, null]) => ({
  id, status, matchday: 30, utcDate: '2026-10-06T19:00:00Z',
  homeTeam: team(id * 10, home), awayTeam: team(id * 10 + 1, away),
  score: { fullTime: { home: score[0], away: score[1] } },
})

const setVisibility = (state) => {
  Object.defineProperty(document, 'visibilityState', { value: state, configurable: true })
  document.dispatchEvent(new Event('visibilitychange'))
}

beforeEach(() => {
  vi.resetAllMocks()
  vi.useFakeTimers({ shouldAdvanceTime: true })
  setVisibility('visible')
})
afterEach(() => {
  vi.useRealTimers()
})

describe('LivePage', () => {
  it('mostra só os jogos em andamento do dia', async () => {
    football.getTodayMatches.mockResolvedValue({
      matches: [match(1, 'FINISHED', 'A', 'B', [1, 0]), match(2, 'IN_PLAY', 'C', 'D', [2, 2]), match(3, 'TIMED', 'E', 'F'), match(4, 'PAUSED', 'G', 'H', [0, 1])],
    })
    render(<LivePage />)

    expect(await screen.findByText('C')).toBeInTheDocument()
    expect(screen.getByText('G')).toBeInTheDocument()
    expect(screen.queryByText('A')).not.toBeInTheDocument()
    expect(screen.queryByText('E')).not.toBeInTheDocument()
    expect(screen.getByText(/2 jogos agora/)).toBeInTheDocument()
  })

  it('sem jogos mostra o aviso', async () => {
    football.getTodayMatches.mockResolvedValue({ matches: [match(1, 'TIMED', 'A', 'B')] })
    render(<LivePage />)
    expect(await screen.findByText('Nenhum jogo ao vivo no momento.')).toBeInTheDocument()
  })

  it('atualiza o placar sozinho a cada 45 s', async () => {
    football.getTodayMatches
      .mockResolvedValueOnce({ matches: [match(2, 'IN_PLAY', 'C', 'D', [0, 0])] })
      .mockResolvedValue({ matches: [match(2, 'IN_PLAY', 'C', 'D', [1, 0])] })
    render(<LivePage />)
    expect(await screen.findByLabelText('Placar')).toHaveTextContent('0 - 0')

    await act(async () => { await vi.advanceTimersByTimeAsync(POLL_INTERVAL_MS) })

    expect(football.getTodayMatches).toHaveBeenCalledTimes(2)
    expect(screen.getByLabelText('Placar')).toHaveTextContent('1 - 0')
  })

  it('pausa o polling com a aba em segundo plano e retoma com busca imediata', async () => {
    football.getTodayMatches.mockResolvedValue({ matches: [] })
    render(<LivePage />)
    await screen.findByText('Nenhum jogo ao vivo no momento.')
    expect(football.getTodayMatches).toHaveBeenCalledTimes(1)

    act(() => setVisibility('hidden'))
    await act(async () => { await vi.advanceTimersByTimeAsync(POLL_INTERVAL_MS * 3) })
    expect(football.getTodayMatches).toHaveBeenCalledTimes(1)

    await act(async () => { setVisibility('visible') })
    expect(football.getTodayMatches).toHaveBeenCalledTimes(2)
    await act(async () => { await vi.advanceTimersByTimeAsync(POLL_INTERVAL_MS) })
    expect(football.getTodayMatches).toHaveBeenCalledTimes(3)
  })

  it('para de atualizar ao sair da tela', async () => {
    football.getTodayMatches.mockResolvedValue({ matches: [] })
    const { unmount } = render(<LivePage />)
    await screen.findByText('Nenhum jogo ao vivo no momento.')
    unmount()
    await vi.advanceTimersByTimeAsync(POLL_INTERVAL_MS * 3)
    expect(football.getTodayMatches).toHaveBeenCalledTimes(1)
  })

  it('erro na primeira carga mostra a mensagem e permite tentar de novo', async () => {
    football.getTodayMatches.mockRejectedValueOnce(new Error('Não foi possível conectar à API.'))
    football.getTodayMatches.mockResolvedValue({ matches: [match(2, 'IN_PLAY', 'C', 'D', [0, 0])] })
    render(<LivePage />)

    expect(await screen.findByText('Não foi possível conectar à API.')).toBeInTheDocument()
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /tentar novamente/i })) })
    expect(await screen.findByText('C')).toBeInTheDocument()
  })

  it('erro durante o polling não derruba a lista que já estava na tela', async () => {
    football.getTodayMatches
      .mockResolvedValueOnce({ matches: [match(2, 'IN_PLAY', 'C', 'D', [1, 1])] })
      .mockRejectedValue(new Error('429'))
    render(<LivePage />)
    expect(await screen.findByText('C')).toBeInTheDocument()

    await act(async () => { await vi.advanceTimersByTimeAsync(POLL_INTERVAL_MS) })

    expect(screen.getByText('C')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
