// shared/types/word.ts
export type WordType = "general" | "cheonseong" | "wonli" | "pyeonghwashinkyung" | "CheonIlGuk_ddeutgil" | "CheonSeongGyeong_en_words"

export interface Word {
  id: number
  text: string
  source: string
  category: string
  speaker?: string | null
  type: WordType
}

export interface WordStats { 
  total: number; 
  byCategory: Record<string, number> 
}
