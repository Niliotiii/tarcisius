import type { RankTier } from '@/types/quiz'

export const rankTiers: RankTier[] = [
  { minScore: 0, maxScore: 2, title: 'Visitante da Igreja', description: 'A jornada está começando. Continue explorando!', stars: 1 },
  { minScore: 3, maxScore: 4, title: 'Fiel Curioso', description: 'Você conhece alguns fundamentos. Pratique mais!', stars: 2 },
  { minScore: 5, maxScore: 6, title: 'Acólito Aprendiz', description: 'Bom conhecimento! Você está no caminho certo.', stars: 2 },
  { minScore: 7, maxScore: 8, title: 'Servidor Dedicado', description: 'Excelente! Você domina grande parte da liturgia.', stars: 3 },
  { minScore: 9, maxScore: 9, title: 'Cerimoniário Experiente', description: 'Quase perfeito! O altar precisa de você.', stars: 3 },
  { minScore: 10, maxScore: 10, title: 'Guardião do Altar', description: 'Perfeito! Você é um mestre da liturgia!', stars: 3 },
]

export function getRank(score: number, tiers: RankTier[] = rankTiers): RankTier {
  const tier = tiers.find((t) => score >= t.minScore && score <= t.maxScore)
  if (!tier) {
    throw new Error(`No rank tier configured for score ${score}`)
  }
  return tier
}
