// features/search/types/index.ts
import { Word } from "@/shared/types/word"

export type MatchType = "exact" | "phrase" | "token" | "stem" | "chosung" | "synonym" | "partial"

export interface Synonym {
  word: string
  weight: number
}

export type SynonymMap = Record<string, Synonym[]>

export interface SearchResult {
  word: Word
  score: number
  matchType: MatchType
  explanation?: string
  confidence?: "high" | "medium" | "low"
  highlightRanges?: Array<{ start: number; end: number }>
}

export interface SearchResponse {
  data: SearchResult[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
    counts: Record<string, number>
  }
}
