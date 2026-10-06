import { act, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom'
import { useLiveAutoNavigate } from './useLiveAutoNavigate.js'
import * as football from '../api/football.js'

vi.mock('../api/football.js')

function Probe() {
  useLiveAutoNavigate()
  const navigate = useNavigate()
  return (
    <>
      <span data-testid="path">{useLocation().pathname}</span>
      <button onClick={() => navigate('/equipes')}>ir para equipes</button>
    </>
  )
}
const renderAt = (path) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Probe />
    </MemoryRouter>,
  )

const live = { matches: [{ id: 1, status: 'IN_PLAY' }] }
const idle = { matches: [{ id: 1, status: 'TIMED' }] }
const flush = () => act(async () => { await Promise.resolve() })

describe('useLiveAutoNavigate', () => {
  beforeEach(() => vi.resetAllMocks())

  it('abre em Ao Vivo quando há jogo rolando e a pessoa está na tela inicial', async () => {
    football.getTodayMatches.mockResolvedValue(live)
    renderAt('/')
    await flush()
    expect(screen.getByTestId('path')).toHaveTextContent('/ao-vivo')
  })

  it('não muda de tela se não há jogo ao vivo', async () => {
    football.getTodayMatches.mockResolvedValue(idle)
    renderAt('/')
    await flush()
    expect(screen.getByTestId('path')).toHaveTextContent('/')
    expect(screen.getByTestId('path').textContent).toBe('/')
  })

  it('não busca nem muda se o link aberto já era de outra tela', async () => {
    football.getTodayMatches.mockResolvedValue(live)
    renderAt('/rodadas')
    await flush()
    expect(football.getTodayMatches).not.toHaveBeenCalled()
    expect(screen.getByTestId('path')).toHaveTextContent('/rodadas')
  })

  it('não força a troca se a pessoa já saiu da tela inicial enquanto a API respondia', async () => {
    let resolve
    football.getTodayMatches.mockReturnValue(new Promise((r) => { resolve = r }))
    renderAt('/')
    fireEvent.click(screen.getByText('ir para equipes'))
    await act(async () => { resolve(live) })
    expect(screen.getByTestId('path')).toHaveTextContent('/equipes')
  })

  it('ignora erro de rede sem quebrar', async () => {
    football.getTodayMatches.mockRejectedValue(new Error('offline'))
    renderAt('/')
    await flush()
    expect(screen.getByTestId('path').textContent).toBe('/')
  })
})
