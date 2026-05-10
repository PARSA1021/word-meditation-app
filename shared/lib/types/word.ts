// lib/types/word.ts

export type WordType = "general" | "cheonseong" | "wonli" | "pyeonghwashinkyung" | "CheonIlGuk_ddeutgil" | "CheonSeongGyeong_en_words"

export type Word = {
  id: number
  text: string
  source: string
  category: string
  speaker?: string | null
  type: WordType
}

export type WordStats = { total: number; byCategory: Record<string, number> }

export interface Synonym {
  word: string
  weight: number
}

export type SynonymMap = Record<string, Synonym[]>

export type MatchType = "exact" | "phrase" | "token" | "stem" | "chosung" | "synonym" | "partial"

export type SearchResult = {
  word: Word
  score: number
  matchType: MatchType
  explanation?: string
  confidence?: "high" | "medium" | "low"
  highlightRanges?: Array<{ start: number; end: number }>
}
