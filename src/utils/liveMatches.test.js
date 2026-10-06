import { filterLiveMatches, isLiveStatus } from './liveMatches.js'

describe('isLiveStatus', () => {
  it.each(['IN_PLAY', 'PAUSED', 'EXTRA_TIME', 'PENALTY_SHOOTOUT'])('%s é ao vivo', (status) => {
    expect(isLiveStatus(status)).toBe(true)
  })
  it.each(['SCHEDULED', 'TIMED', 'FINISHED', 'POSTPONED', 'SUSPENDED', 'CANCELLED', 'AWARDED', undefined])(
    '%s não é ao vivo',
    (status) => {
      expect(isLiveStatus(status)).toBe(false)
    },
  )
})

describe('filterLiveMatches', () => {
  it('mantém só as partidas em andamento', () => {
    const matches = [
      { id: 1, status: 'FINISHED' },
      { id: 2, status: 'IN_PLAY' },
      { id: 3, status: 'TIMED' },
      { id: 4, status: 'PAUSED' },
    ]
    expect(filterLiveMatches(matches).map((m) => m.id)).toEqual([2, 4])
  })
  it('aceita lista ausente', () => {
    expect(filterLiveMatches(undefined)).toEqual([])
  })
})
