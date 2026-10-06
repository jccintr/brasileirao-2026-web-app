import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import RoundsPage from './RoundsPage.jsx'
import StandingsPage from './StandingsPage.jsx'
import TeamDetailPage from './TeamDetailPage.jsx'
import * as football from '../api/football.js'

vi.mock('../api/football.js')

const team = (id, name) => ({ id, name, shortName: name, crest: '' })
const row = (position, id, name, points) => ({
  position, team: team(id, name), points, playedGames: 10, won: 5, draw: 2, lost: 3,
  goalsFor: 15, goalsAgainst: 10, goalDifference: 5,
})

const renderAt = (path, element, routePath = '*') =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path={routePath} element={element} />
      </Routes>
    </MemoryRouter>,
  )

describe('StandingsPage', () => {
  it('mostra a tabela com zonas e links para os times', async () => {
    football.getStandings.mockResolvedValue({
      standings: [
        { type: 'HOME', table: [row(1, 9, 'Casa FC', 99)] },
        { type: 'TOTAL', table: [row(1, 1, 'Flamengo', 30), row(12, 2, 'Bahia', 15), row(20, 3, 'Sport', 5)] },
      ],
    })
    renderAt('/', <StandingsPage />)

    const table = await screen.findByRole('table')
    const rows = within(table).getAllByRole('row')
    expect(rows).toHaveLength(4) // cabeçalho + 3 times (usa o grupo TOTAL, não o HOME)
    expect(within(table).queryByText('Casa FC')).not.toBeInTheDocument()
    expect(within(table).getByRole('link', { name: 'Flamengo' })).toHaveAttribute('href', '/equipes/1')
    expect(rows[1].querySelector('td').style.boxShadow).toContain('var(--zone-libertadores)')
    expect(rows[2].querySelector('td').style.boxShadow).toContain('transparent') // 12º: sem zona
    expect(rows[3].querySelector('td').style.boxShadow).toContain('var(--zone-relegation)')
  })

  it('mostra o erro e tenta de novo', async () => {
    football.getStandings.mockRejectedValueOnce(new Error('Muitas requisições em pouco tempo.'))
    football.getStandings.mockResolvedValueOnce({ standings: [{ type: 'TOTAL', table: [row(1, 1, 'Flamengo', 30)] }] })
    renderAt('/', <StandingsPage />)

    expect(await screen.findByText('Muitas requisições em pouco tempo.')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /tentar novamente/i }))
    expect(await screen.findByRole('table')).toBeInTheDocument()
  })
})

describe('RoundsPage', () => {
  const m = (id, matchday, home, away, day) => ({
    id, matchday, utcDate: `2026-06-${day}T19:00:00Z`, status: 'SCHEDULED',
    homeTeam: team(id * 10, home), awayTeam: team(id * 10 + 1, away), score: { fullTime: { home: null, away: null } },
  })
  const matches = [m(1, 1, 'A1', 'B1', 10), m(2, 2, 'A2', 'B2', 17), m(3, 3, 'A3', 'B3', 24)]

  beforeEach(() => {
    football.getCompetitionInfo.mockResolvedValue({ currentSeason: { currentMatchday: 2 } })
    football.getAllMatches.mockResolvedValue({ matches })
  })

  it('abre na rodada atual informada pela API e navega com os botões', async () => {
    renderAt('/rodadas', <RoundsPage />)

    expect(await screen.findByText('Rodada 2')).toBeInTheDocument()
    expect(screen.getByText('A2')).toBeInTheDocument()
    expect(screen.queryByText('A1')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Próxima rodada' }))
    expect(await screen.findByText('A3')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Rodada anterior' }))
    fireEvent.click(screen.getByRole('button', { name: 'Rodada anterior' }))
    expect(await screen.findByText('A1')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Rodada anterior' })).toBeDisabled()
  })

  it('respeita ?rodada= da URL e ignora valores inválidos', async () => {
    renderAt('/rodadas?rodada=3', <RoundsPage />)
    expect(await screen.findByText('A3')).toBeInTheDocument()
  })

  it('valor inválido na URL cai na rodada atual', async () => {
    renderAt('/rodadas?rodada=99', <RoundsPage />)
    expect(await screen.findByText('A2')).toBeInTheDocument()
  })

  it('sem currentMatchday na API, calcula a rodada pelas datas', async () => {
    football.getCompetitionInfo.mockResolvedValue({ currentSeason: { currentMatchday: null } })
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-06-24T10:00:00Z'))
    renderAt('/rodadas', <RoundsPage />)
    expect(await screen.findByText('A3')).toBeInTheDocument()
    vi.useRealTimers()
  })

  it('seletor de rodadas abre, mostra 38 opções e troca de rodada', async () => {
    renderAt('/rodadas', <RoundsPage />)
    fireEvent.click(await screen.findByRole('button', { name: /Rodada 2/ }))

    const dialog = screen.getByRole('dialog', { name: 'Selecionar rodada' })
    expect(within(dialog).getAllByRole('button', { name: /^Rodada \d+$/ })).toHaveLength(38)
    fireEvent.click(within(dialog).getByRole('button', { name: 'Rodada 1' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(await screen.findByText('A1')).toBeInTheDocument()
  })

  it('rodada sem partidas mostra aviso', async () => {
    renderAt('/rodadas?rodada=30', <RoundsPage />)
    expect(await screen.findByText(/Nenhuma partida encontrada/)).toBeInTheDocument()
  })
})

describe('TeamDetailPage', () => {
  it('mostra nome do time (vindo da lista) e separa próximos jogos e resultados', async () => {
    football.getTeams.mockResolvedValue({ teams: [team(7, 'Corinthians')] })
    football.getTeamMatches.mockResolvedValue({
      matches: [
        { id: 1, matchday: 1, utcDate: '2020-01-01T19:00:00Z', status: 'FINISHED', homeTeam: team(7, 'Corinthians'), awayTeam: team(8, 'Santos'), score: { fullTime: { home: 1, away: 0 } } },
        { id: 2, matchday: 2, utcDate: '2099-01-01T19:00:00Z', status: 'TIMED', homeTeam: team(9, 'Bahia'), awayTeam: team(7, 'Corinthians'), score: { fullTime: { home: null, away: null } } },
      ],
    })
    renderAt('/equipes/7', <TeamDetailPage />, '/equipes/:teamId')

    expect(await screen.findByRole('heading', { level: 1, name: 'Corinthians' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Próximos jogos' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Últimos resultados' })).toBeInTheDocument()
  })

  it('se a lista de equipes falhar, descobre o nome pelas partidas', async () => {
    football.getTeams.mockRejectedValue(new Error('429'))
    football.getTeamMatches.mockResolvedValue({
      matches: [
        { id: 1, matchday: 1, utcDate: '2020-01-01T19:00:00Z', status: 'FINISHED', homeTeam: team(7, 'Corinthians'), awayTeam: team(8, 'Santos'), score: { fullTime: { home: 1, away: 0 } } },
      ],
    })
    renderAt('/equipes/7', <TeamDetailPage />, '/equipes/:teamId')
    expect(await screen.findByRole('heading', { level: 1, name: 'Corinthians' })).toBeInTheDocument()
  })
})
