import { getTodayMatches, todayISODate } from './football.js'
import * as client from './client.js'

describe('todayISODate', () => {
  it('usa a data local com zeros à esquerda', () => {
    expect(todayISODate(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05')
    expect(todayISODate(new Date(2026, 10, 30, 0, 1))).toBe('2026-11-30')
  })
})

describe('getTodayMatches', () => {
  it('pede só as partidas de hoje, sempre ignorando o cache', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 9, 6, 15, 0))
    const spy = vi.spyOn(client, 'apiRequest').mockResolvedValue({ matches: [] })

    await getTodayMatches()

    expect(spy).toHaveBeenCalledWith('/competitions/BSA/matches?dateFrom=2026-10-06&dateTo=2026-10-06', {
      skipCache: true,
    })
    vi.useRealTimers()
  })
})
