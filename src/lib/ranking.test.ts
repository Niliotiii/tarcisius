import { describe, it, expect } from 'vitest'
import { getRank, rankTiers } from './ranking'

describe('rankTiers', () => {
  it('covers every integer score from 0 to 10 with no gaps or overlaps', () => {
    for (let score = 0; score <= 10; score++) {
      const matches = rankTiers.filter((t) => score >= t.minScore && score <= t.maxScore)
      expect(matches.length).toBe(1)
    }
  })
})

describe('getRank', () => {
  it('returns the lowest tier for score 0', () => {
    expect(getRank(0).title).toBe('Visitante da Igreja')
  })

  it('returns the highest tier for a perfect score', () => {
    expect(getRank(10).title).toBe('Guardião do Altar')
  })

  it('respects tier boundaries exactly', () => {
    expect(getRank(2).title).toBe('Visitante da Igreja')
    expect(getRank(3).title).toBe('Fiel Curioso')
  })

  it('throws when no tier covers the given score', () => {
    const gappedTiers = [{ minScore: 0, maxScore: 5, title: 'Only Half', description: '', stars: 1 }]
    expect(() => getRank(8, gappedTiers)).toThrow('No rank tier configured for score 8')
  })
})
