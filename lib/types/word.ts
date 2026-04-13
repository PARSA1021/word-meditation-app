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

export type SearchResult = {
  word: Word
  score: number
  matchType: "exact" | "phrase" | "token" | "stem" | "chosung" | "synonym"
  highlightRanges?: Array<{ start: number; end: number }>
}
