// features/search/indexing/word-repository.ts
import "server-only"
import { Word, WordType } from "@/shared/types/word"
import { normalizeText, extractChosung } from "../engine/normalization"

let _allWords: Word[] | null = null
let _wordIndex: WordIndex[] | null = null

export type WordIndex = {
  normalizedText: string
  normalizedSource: string
  normalizedSpeaker: string
  textChosung: string
}

export function resetWordCache() {
  _allWords = null
  _wordIndex = null
}

export function loadAllWords(): Word[] {
  if (_allWords) return _allWords

  // Using dynamic require for lazy loading of large JSON datasets
  const rawWordsData = require("@/data/words.json")
  const rawCheonseongData = require("@/data/cheonseong_words.json")
  const rawWonliData = require("@/data/wonligangnon_words.json")
  const rawPyeonghwaData = require("@/data/pyeonghwashinkyung_words.json")
  const rawCheonIlGukData = require("@/data/Cheon Il Guk_ddeutgil_words.json")
  const rawCheonseongEngData = require("@/data/CheonSeongGyeong_en_words.json")
  const rawDivinePrincipleEngData = require("@/data/Divine_Principle_eng.json")

  const assertWords = (data: unknown): Word[] => Array.isArray(data) ? data as Word[] : []

  const wordsData = assertWords(rawWordsData)
  const cheonseongData = assertWords(rawCheonseongData)
  const wonliData = assertWords(rawWonliData)
  const pyeonghwashinkyungData = assertWords(rawPyeonghwaData)
  const CheonIlGukDdeutgilData = assertWords(rawCheonIlGukData)
  const cheonseongDataEng = assertWords(rawCheonseongEngData)
  const DivinePrincipleEng = assertWords(rawDivinePrincipleEngData)

  _allWords = [
    ...wordsData.map((w) => ({ ...w, type: "general" as WordType })),
    ...cheonseongData.map((w, i) => ({ ...w, type: "cheonseong" as WordType, id: 10000 + i })),
    ...wonliData.map((w, i) => ({ ...w, type: "wonli" as WordType, id: 20000 + i })),
    ...pyeonghwashinkyungData.map((w, i) => ({ ...w, type: "pyeonghwashinkyung" as WordType, id: 30000 + i })),
    ...CheonIlGukDdeutgilData.map((w, i) => ({ ...w, type: "CheonIlGuk_ddeutgil" as WordType, id: 40000 + i })),
    ...cheonseongDataEng.map((w, i) => ({ ...w, type: "CheonSeongGyeong_en_words" as WordType, id: 50000 + i })),
    ...DivinePrincipleEng.map((w, i) => ({ ...w, type: "Divine_Principle_en" as WordType, id: 60000 + i })),
  ]

  return _allWords
}

export function getWordIndex(): WordIndex[] {
  if (_wordIndex) return _wordIndex
  
  const words = loadAllWords()
  _wordIndex = words.map((w) => ({
    normalizedText: normalizeText(w.text),
    normalizedSource: normalizeText(w.source),
    normalizedSpeaker: normalizeText(w.speaker || ""),
    textChosung: extractChosung(normalizeText(w.text)),
  }))
  
  return _wordIndex
}
