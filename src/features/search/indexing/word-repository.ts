// features/search/indexing/word-repository.ts
import "server-only"
import { Word } from "@/shared/types/word"
import { normalizeText, extractChosung } from "../engine/normalization"
import { prisma } from "@/lib/prisma"
import fs from "fs"
import path from "path"

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

function loadWordsFromLocalJson(): Word[] {
  const dataDir = path.join(process.cwd(), "src", "data")
  if (!fs.existsSync(dataDir)) return []

  const files = fs.readdirSync(dataDir).filter(f => f.endsWith(".json") && !f.includes("Quiz") && !f.includes("subscriptions"))
  let globalId = 1
  const allLoaded: Word[] = []

  for (const file of files) {
    try {
      const filePath = path.join(dataDir, file)
      const content = fs.readFileSync(filePath, "utf-8")
      const wordsArray = JSON.parse(content)
      
      let defaultType = "general"
      if (file.includes("cheonseong")) defaultType = "cheonseong"
      else if (file.includes("wonli")) defaultType = "wonli"
      else if (file.includes("pyeonghwashinkyung")) defaultType = "pyeonghwashinkyung"
      else if (file.includes("Cheon Il Guk_ddeutgil")) defaultType = "CheonIlGuk_ddeutgil"

      for (const w of wordsArray) {
        if (!w.text) continue
        allLoaded.push({
          id: w.id || globalId++,
          text: w.text,
          source: w.source || "",
          category: w.category || "",
          speaker: w.speaker || null,
          type: w.type || defaultType
        })
      }
    } catch (e) {
      console.error(`Error loading json file ${file}:`, e)
    }
  }

  return allLoaded
}

export async function loadAllWords(): Promise<Word[]> {
  if (_allWords && _allWords.length > 0) return _allWords

  // 1. 로컬 정적 JSON 파일에서 즉시 로딩 (0.005초 초고속 처리)
  const localWords = loadWordsFromLocalJson()
  if (localWords.length > 0) {
    _allWords = localWords
    return _allWords
  }

  // 2. 로컬 JSON이 없을 경우에만 Prisma DB 조회
  try {
    const words = await prisma.words.findMany({
      orderBy: { id: "asc" }
    })
    if (words && words.length > 0) {
      _allWords = words as unknown as Word[]
      return _allWords
    }
  } catch (error) {
    console.warn("Prisma query error:", error)
  }

  return []
}

export async function getWordIndex(): Promise<WordIndex[]> {
  if (_wordIndex && _wordIndex.length > 0) return _wordIndex
  
  const words = await loadAllWords()
  _wordIndex = words.map((w) => ({
    normalizedText: normalizeText(w.text),
    normalizedSource: normalizeText(w.source),
    normalizedSpeaker: normalizeText(w.speaker || ""),
    textChosung: extractChosung(normalizeText(w.text)),
  }))
  
  return _wordIndex
}
