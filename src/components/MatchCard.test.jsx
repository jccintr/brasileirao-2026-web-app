import { render, screen } from '@testing-library/react'
import MatchCard from './MatchCard.jsx'

const base = {
  id: 1,
  matchday: 5,
  utcDate: '2026-06-15T19:00:00Z',
  homeTeam: { id: 1, name: 'Flamengo', shortName: 'Flamengo', crest: '' },
  awayTeam: { id: 2, name: 'Sociedade Esportiva Palmeiras', shortName: 'Palmeiras', crest: '' },
}

describe('MatchCard', () => {
  it('mostra o placar de jogo encerrado', () => {
    render(<MatchCard match={{ ...base, status: 'FINISHED', score: { fullTime: { home: 2, away: 1 } } }} />)
    expect(screen.getByLabelText('Placar')).toHaveTextContent('2 - 1')
    expect(screen.getByText('Encerrado')).toBeInTheDocument()
    expect(screen.getByText(/Rodada 5/)).toBeInTheDocument()
  })

  it('mostra "vs" e "Agendado" antes do jogo', () => {
    render(<MatchCard match={{ ...base, status: 'TIMED', score: { fullTime: { home: null, away: null } } }} />)
    expect(screen.getByLabelText('Placar')).toHaveTextContent('vs')
    expect(screen.getByText('Agendado')).toBeInTheDocument()
  })

  it('jogo ao vivo mostra selo e placar parcial (0 - 0 sem gols)', () => {
    render(<MatchCard match={{ ...base, status: 'IN_PLAY', score: { fullTime: { home: null, away: null } } }} />)
    expect(screen.getByText('Ao vivo')).toBeInTheDocument()
    expect(screen.getByLabelText('Placar')).toHaveTextContent('0 - 0')
  })

  it('usa o nome curto das equipes e "?" quando falta o time', () => {
    render(<MatchCard match={{ ...base, awayTeam: undefined, status: 'SCHEDULED' }} />)
    expect(screen.getByText('Flamengo')).toBeInTheDocument()
    expect(screen.getByText('?')).toBeInTheDocument()
  })

  it.each([
    ['PAUSED', 'Intervalo'],
    ['EXTRA_TIME', 'Prorrogação'],
    ['PENALTY_SHOOTOUT', 'Pênaltis'],
  ])('status %s também é ao vivo e mostra o detalhe "%s"', (status, detail) => {
    render(<MatchCard match={{ ...base, status, score: { fullTime: { home: 1, away: 1 } } }} />)
    expect(screen.getByText('Ao vivo')).toBeInTheDocument()
    expect(screen.getByText(new RegExp(detail))).toBeInTheDocument()
    expect(screen.getByLabelText('Placar')).toHaveTextContent('1 - 1')
  })

  it('jogo em andamento normal não mostra detalhe extra', () => {
    render(<MatchCard match={{ ...base, status: 'IN_PLAY', score: { fullTime: { home: 0, away: 0 } } }} />)
    expect(screen.queryByText(/Intervalo|Prorrogação|Pênaltis/)).not.toBeInTheDocument()
  })
})
