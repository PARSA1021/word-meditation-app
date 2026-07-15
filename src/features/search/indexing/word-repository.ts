// features/search/indexing/word-repository.ts
import "server-only"
import { Word } from "@/shared/types/word"
import { normalizeText, extractChosung } from "../engine/normalization"
import { prisma } from "@/lib/prisma"

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

export async function loadAllWords(): Promise<Word[]> {
  if (_allWords) return _allWords

  const words = await prisma.words.findMany({
    orderBy: { id: "asc" }
  })
  
  _allWords = words as unknown as Word[]
  return _allWords
}

export async function getWordIndex(): Promise<WordIndex[]> {
  if (_wordIndex) return _wordIndex
  
  const words = await loadAllWords()
  _wordIndex = words.map((w) => ({
    normalizedText: normalizeText(w.text),
    normalizedSource: normalizeText(w.source),
    normalizedSpeaker: normalizeText(w.speaker || ""),
    textChosung: extractChosung(normalizeText(w.text)),
  }))
  
  return _wordIndex
}
