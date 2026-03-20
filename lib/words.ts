// lib/words.ts
import wordsData from "@/data/words.json"
import cheonseongData from "@/data/cheonseong_words.json"

export type Word = {
  id: number
  text: string
  source: string
  category: string
  speaker?: string | null
  type: "general" | "cheonseong"
}

export type WordStats = {
  total: number
  byCategory: { [key: string]: number }
}

// --------------------------------------------------
// 1️⃣ JSON 합치기
// --------------------------------------------------
const allWords: Word[] = [
  ...wordsData.map(w => ({ ...w, type: "general" } as Word)),
  ...cheonseongData.map((w, i) => ({
    ...w,
    type: "cheonseong",
    id: 10000 + i
  } as Word))
]

// --------------------------------------------------
// 2️⃣ 모든 단어 가져오기
// --------------------------------------------------
export function getAllWords(): Word[] {
  return allWords
}

// --------------------------------------------------
// 3️⃣ 랜덤 단어 가져오기
// --------------------------------------------------
export function getRandomWord(): Word {
  const index = Math.floor(Math.random() * allWords.length)
  return allWords[index]
}

// --------------------------------------------------
// 4️⃣ 랜덤 단어 (특정 id 제외)
// --------------------------------------------------
export function getRandomWordExcept(exceptId?: number | null): Word {
  if (allWords.length === 0) throw new Error("words 목록이 비어 있습니다.")
  if (exceptId == null || allWords.length === 1) return getRandomWord()

  for (let i = 0; i < 12; i++) {
    const w = getRandomWord()
    if (w.id !== exceptId) return w
  }

  const currentIndex = allWords.findIndex(w => w.id === exceptId)
  const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % allWords.length : 0
  return allWords[nextIndex]
}

// --------------------------------------------------
// 5️⃣ 통계
// --------------------------------------------------
export function getWordStats(): WordStats {
  const byCategory: { [key: string]: number } = {}
  allWords.forEach(w => {
    byCategory[w.category] = (byCategory[w.category] || 0) + 1
  })
  return {
    total: allWords.length,
    byCategory
  }
}

// --------------------------------------------------
// 6️⃣ 검색 (type 필터 포함 가능)
// --------------------------------------------------
export function searchWords(query: string, type?: "general" | "cheonseong"): Word[] {
  const lowerQuery = query.toLowerCase().trim()
  return allWords.filter(w => {
    const matchesQuery =
      lowerQuery === "" ||
      w.text.toLowerCase().includes(lowerQuery) ||
      w.source.toLowerCase().includes(lowerQuery)
    const matchesType = !type || w.type === type
    return matchesQuery && matchesType
  })
}

// --------------------------------------------------
// 7️⃣ 천성경 단어만 가져오기
// --------------------------------------------------
export function getCheonseongWords(): Word[] {
  return allWords.filter(w => w.type === "cheonseong")
}

// --------------------------------------------------
// 8️⃣ 일반 단어만 가져오기
// --------------------------------------------------
export function getGeneralWords(): Word[] {
  return allWords.filter(w => w.type === "general")
}