// lib/words.ts
import wordsData from "@/data/words.json"
import cheonseongData from "@/data/cheonseong_words.json"

// -----------------------------
// 1️⃣ 타입 정의
// -----------------------------
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

// -----------------------------
// 2️⃣ JSON 데이터 합치기
// -----------------------------
export const allWords: Word[] = [
  ...wordsData.map(w => ({ ...w, type: "general" } as Word)),
  ...cheonseongData.map((w, i) => ({
    ...w,
    type: "cheonseong",
    id: 10000 + i, // 기존 id와 겹치지 않도록 offset
  } as Word))
]

// -----------------------------
// 3️⃣ 모든 단어 가져오기 (권장하지 않음, 전체 렌더링 주의)
// -----------------------------
export function getAllWords(): Word[] {
  return allWords
}

// -----------------------------
// 3-1️⃣ 페이지 단위로 가져오기
// -----------------------------
export function getWordsByPage(page: number, pageSize: number): Word[] {
  const start = (page - 1) * pageSize
  const end = start + pageSize
  return allWords.slice(start, end)
}

// -----------------------------
// 4️⃣ 랜덤 단어 가져오기
// -----------------------------
export function getRandomWord(): Word {
  const index = Math.floor(Math.random() * allWords.length)
  return allWords[index]
}

// -----------------------------
// 5️⃣ 랜덤 단어 (특정 id 제외)
// -----------------------------
export function getRandomWordExcept(exceptId?: number | null): Word {
  if (allWords.length === 0) throw new Error("words 목록이 비어 있습니다.")
  if (exceptId == null || allWords.length === 1) return getRandomWord()

  for (let i = 0; i < 12; i++) {
    const w = getRandomWord()
    if (w.id !== exceptId) return w
  }

  const currentIndex = allWords.findIndex((w: Word) => w.id === exceptId)
  const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % allWords.length : 0
  return allWords[nextIndex]
}

// -----------------------------
// 6️⃣ 통계
// -----------------------------
export function getWordStats(): WordStats {
  const byCategory: { [key: string]: number } = {}
  allWords.forEach((w: Word) => {
    byCategory[w.category] = (byCategory[w.category] || 0) + 1
  })
  return {
    total: allWords.length,
    byCategory,
  }
}

// -----------------------------
// 7️⃣ 검색 (type 필터 포함 가능)
// -----------------------------
export function searchWords(query: string, type?: "general" | "cheonseong"): Word[] {
  const lowerQuery = query.toLowerCase().trim()
  return allWords.filter((w: Word) => {
    const matchesQuery =
      lowerQuery === "" ||
      w.text.toLowerCase().includes(lowerQuery) ||
      w.source.toLowerCase().includes(lowerQuery)
    const matchesType = !type || w.type === type
    return matchesQuery && matchesType
  })
}

// -----------------------------
// 7-1️⃣ 검색 + 페이지네이션
// -----------------------------
export function searchWordsPaged(
  query: string,
  page: number,
  pageSize: number,
  type?: "general" | "cheonseong"
): Word[] {
  const filtered = searchWords(query, type)
  const start = (page - 1) * pageSize
  return filtered.slice(start, start + pageSize)
}

// -----------------------------
// 8️⃣ 천성경 단어만 가져오기
// -----------------------------
export function getCheonseongWords(): Word[] {
  return allWords.filter((w: Word) => w.type === "cheonseong")
}

// -----------------------------
// 9️⃣ 일반 단어만 가져오기
// -----------------------------
export function getGeneralWords(): Word[] {
  return allWords.filter((w: Word) => w.type === "general")
}

// -----------------------------
// 🔟 카테고리별 단어 가져오기
// -----------------------------
export function getCategoryWords(category: string): Word[] {
  const decodedCategory = decodeURIComponent(category)
  return allWords.filter((w: Word) => w.category === decodedCategory)
}