// features/search/engine/ranking.ts
import { MatchType } from "../types"

export const SCORE_WEIGHTS = {
  EXACT: 100,
  TITLE: 80,
  KEYWORD: 60,
  TAG: 50,
  CATEGORY: 50,
  BODY: 40,
  PARTIAL: 20
}

export function calculateSearchScore(
  matchType: MatchType,
  synonymWeight: number = 1.0,
  isExact: boolean = false
): number {
  const weights: Record<MatchType, number> = {
    exact: 1.0,
    phrase: 0.95,
    token: 0.85,
    stem: 0.75,
    synonym: 0.65 * synonymWeight,
    chosung: 0.5,
    partial: 0.3
  }

  let score = weights[matchType]
  if (isExact) score *= 1.2
  return score
}
