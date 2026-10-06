import { QUALIFICATION_ZONES, getZoneForPosition } from './qualificationZones.js'

describe('getZoneForPosition', () => {
  it.each([
    [1, 'libertadores-groups'],
    [4, 'libertadores-groups'],
    [5, 'libertadores-pre'],
    [6, 'sudamericana'],
    [11, 'sudamericana'],
    [17, 'relegation'],
    [20, 'relegation'],
  ])('posição %i -> %s', (position, key) => {
    expect(getZoneForPosition(position).key).toBe(key)
  })

  it('posições sem zona retornam null', () => {
    expect(getZoneForPosition(12)).toBeNull()
    expect(getZoneForPosition(16)).toBeNull()
  })

  it('as zonas não se sobrepõem', () => {
    for (let position = 1; position <= 20; position += 1) {
      const hits = QUALIFICATION_ZONES.filter((z) => position >= z.from && position <= z.to)
      expect(hits.length).toBeLessThanOrEqual(1)
    }
  })
})
