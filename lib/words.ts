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
// 2️⃣ 데이터 합치기
// -----------------------------
export const allWords: Word[] = [
  ...wordsData.map((w) => ({ ...w, type: "general" } as Word)),
  ...cheonseongData.map((w, i) => ({
    ...w,
    type: "cheonseong",
    id: 10000 + i,
  } as Word)),
]

// -----------------------------
// 3️⃣ 전체 가져오기
// -----------------------------
export function getAllWords(): Word[] {
  return allWords
}

// -----------------------------
// 4️⃣ 랜덤 단어
// -----------------------------
export function getRandomWord(): Word {
  return allWords[Math.floor(Math.random() * allWords.length)]
}

// -----------------------------
// 5️⃣ 랜덤 (🔥 완전 개선 버전)
// -----------------------------
export function getRandomWordExcept(
  except?: number | number[] | null
): Word {
  if (allWords.length === 0) {
    throw new Error("words 목록이 비어 있습니다.")
  }

  // 👉 제외 ID 배열로 통일
  let excludedIds: number[] = []

  if (Array.isArray(except)) {
    excludedIds = except
  } else if (typeof except === "number") {
    excludedIds = [except]
  }

  const excludedSet = new Set(excludedIds)

  const candidates = allWords.filter((w) => !excludedSet.has(w.id))

  // 👉 전부 제외된 경우 fallback
  if (candidates.length === 0) {
    return getRandomWord()
  }

  return candidates[Math.floor(Math.random() * candidates.length)]
}

// -----------------------------
// 6️⃣ 오늘의 말씀 (날짜 기반 고정 🔥)
// -----------------------------
export function getDailyWord(): Word {
  const today = new Date().toISOString().slice(0, 10)

  let hash = 0
  for (let i = 0; i < today.length; i++) {
    hash = today.charCodeAt(i) + ((hash << 5) - hash)
  }

  const index = Math.abs(hash) % allWords.length
  return allWords[index]
}

// -----------------------------
// 7️⃣ 통계
// -----------------------------
export function getWordStats(): WordStats {
  const byCategory: { [key: string]: number } = {}

  allWords.forEach((w) => {
    byCategory[w.category] = (byCategory[w.category] || 0) + 1
  })

  return {
    total: allWords.length,
    byCategory,
  }
}

// -----------------------------
// 8️⃣ 고급 검색 (점수 기반 🔥)
// -----------------------------
export function searchWords(
  query: string,
  type?: "general" | "cheonseong"
): Word[] {
  const normalized = query.toLowerCase().trim()
  const tokens = normalized.split(/\s+/).filter(Boolean)

  if (tokens.length === 0) {
    return type ? allWords.filter((w) => w.type === type) : allWords
  }

  const results = allWords
    .map((word): { word: Word; score: number } | null => {
      if (type && word.type !== type) return null

      const text = word.text.toLowerCase()
      const source = word.source.toLowerCase()
      const speaker = (word.speaker || "").toLowerCase()

      let score = 0

      for (const token of tokens) {
        let matched = false

        if (text === token) {
          score += 100
          matched = true
        } else if (text.startsWith(token)) {
          score += 50
          matched = true
        } else if (text.includes(token)) {
          score += 30
          matched = true
        }

        if (source.includes(token)) score += 10
        if (speaker.includes(token)) score += 5

        if (!matched) return null
      }

      return { word, score }
    })
    .filter((v): v is { word: Word; score: number } => v !== null)

  results.sort((a, b) => b.score - a.score)

  return results.map((r) => r.word)
}

// -----------------------------
// 9️⃣ 검색 + 페이지네이션
// -----------------------------
export function searchWordsPaged(
  query: string,
  page: number,
  pageSize: number,
  type?: "general" | "cheonseong"
): Word[] {
  const results = searchWords(query, type)

  const start = (page - 1) * pageSize
  return results.slice(start, start + pageSize)
}

// -----------------------------
// 🔟 카테고리별 단어
// -----------------------------
export function getCategoryWords(category: string): Word[] {
  const decoded = decodeURIComponent(category)
  return allWords.filter((w) => w.category === decoded)
}

// -----------------------------
// 11️⃣ 타입별 필터
// -----------------------------
export function getGeneralWords(): Word[] {
  return allWords.filter((w) => w.type === "general")
}

export function getCheonseongWords(): Word[] {
  return allWords.filter((w) => w.type === "cheonseong")
}