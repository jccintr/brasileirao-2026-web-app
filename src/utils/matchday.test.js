import { computeCurrentMatchday, groupMatchesByRound, splitTeamMatches } from './matchday.js'

const DAY = 24 * 60 * 60 * 1000
const NOW = new Date('2026-06-15T12:00:00Z').getTime()
const at = (offsetDays) => new Date(NOW + offsetDays * DAY).toISOString()
const match = (id, matchday, offsetDays, status = 'SCHEDULED') => ({ id, matchday, utcDate: at(offsetDays), status })

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(NOW)
})
afterEach(() => vi.useRealTimers())

describe('groupMatchesByRound', () => {
  it('agrupa por rodada, ordena por data e ignora partidas sem rodada', () => {
    const grouped = groupMatchesByRound([match(1, 2, 3), match(2, 1, 5), match(3, 1, 4), match(4, null, 1)])
    expect([...grouped.keys()].sort()).toEqual([1, 2])
    expect(grouped.get(1).map((m) => m.id)).toEqual([3, 2])
  })
})

describe('computeCurrentMatchday', () => {
  it('usa o fallback sem partidas', () => {
    expect(computeCurrentMatchday([], 7)).toBe(7)
    expect(computeCurrentMatchday(null)).toBe(1)
  })

  it('escolhe a rodada em andamento (com 1 dia de folga)', () => {
    const matches = [match(1, 10, -10), match(2, 11, -1), match(3, 11, 1), match(4, 12, 7)]
    expect(computeCurrentMatchday(matches)).toBe(11)
  })

  it('sem rodada em andamento, escolhe a próxima agendada', () => {
    const matches = [match(1, 10, -20), match(2, 11, 20), match(3, 12, 30)]
    expect(computeCurrentMatchday(matches)).toBe(11)
  })

  it('com a temporada encerrada, escolhe a última rodada', () => {
    const matches = [match(1, 37, -20), match(2, 38, -10)]
    expect(computeCurrentMatchday(matches)).toBe(38)
  })
})

describe('splitTeamMatches', () => {
  const matches = [
    match(1, 1, -10, 'FINISHED'),
    match(2, 2, -3, 'FINISHED'),
    match(3, 3, 3, 'TIMED'),
    match(4, 4, 10, 'SCHEDULED'),
  ]

  it('separa próximos (mais perto primeiro) e resultados (mais recente primeiro)', () => {
    const [upcoming, past] = splitTeamMatches(matches, NOW)
    expect(upcoming.title).toBe('Próximos jogos')
    expect(upcoming.matches.map((m) => m.id)).toEqual([3, 4])
    expect(past.title).toBe('Últimos resultados')
    expect(past.matches.map((m) => m.id)).toEqual([2, 1])
  })

  it('omite seções vazias', () => {
    expect(splitTeamMatches([matches[0]], NOW)).toHaveLength(1)
    expect(splitTeamMatches([], NOW)).toEqual([])
  })
})
