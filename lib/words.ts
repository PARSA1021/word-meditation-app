// lib/words.ts

import wordsData from "@/data/words.json"
import cheonseongData from "@/data/cheonseong_words.json"
import wonliData from "@/data/wonligangnon_words.json"
import pyeonghwashinkyungData from "@/data/pyeonghwashinkyung_words.json"

// -----------------------------
// 1️⃣ 타입 정의
// -----------------------------
export type Word = {
  id: number
  text: string
  source: string
  category: string
  speaker?: string | null
  type: "general" | "cheonseong" | "wonli" | "pyeonghwashinkyung"
}

export type WordStats = {
  total: number
  byCategory: { [key: string]: number }
}

export type SearchResult = {
  word: Word
  score: number
  matchType: "exact" | "phrase" | "token" | "stem" | "chosung" | "synonym"
  highlightRanges?: Array<{ start: number; end: number }>
}

// -----------------------------
// 2️⃣ 데이터 합치기
// -----------------------------
export const allWords: Word[] = [
  ...wordsData.map((w) => ({ ...w, type: "general" } as Word)),
  ...cheonseongData.map((w, i) => ({ ...w, type: "cheonseong", id: 10000 + i } as Word)),
  ...wonliData.map((w, i) => ({ ...w, type: "wonli", id: 20000 + i } as Word)),
  ...pyeonghwashinkyungData.map((w, i) => ({ ...w, type: "pyeonghwashinkyung", id: 30000 + i } as Word)),
]

// -----------------------------
// 3️⃣ 초성 추출
// -----------------------------
const CHOSUNG = ["ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅹ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"]

export function extractChosung(text: string): string {
  let result = ""
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i)
    if (code >= 0xAC00 && code <= 0xD7A3) {
      result += CHOSUNG[Math.floor((code - 0xAC00) / 28 / 21)]
    } else {
      result += text[i]
    }
  }
  return result
}

// -----------------------------
// 4️⃣ 어근 정규화
// -----------------------------
const VERB_ENDINGS = [
  "하였습니다", "하였다", "하겠습니다", "하겠다", "합니다", "한다", "해야", "하여", "하는", "하고",
  "하지", "하면", "하니", "하여서", "하니라", "하리라", "하였으니", "하였으며", "하였고",
  "입니다", "이다", "이라", "이며", "이고", "이니", "이면", "으로", "로서", "에서", "에게",
  "습니다", "ㅂ니다", "았다", "었다", "겠다", "리라", "니라",
  "되었다", "됩니다", "된다", "되어", "되니", "되고", "되면",
].sort((a, b) => b.length - a.length)

export function stemKorean(word: string): string {
  for (const ending of VERB_ENDINGS) {
    if (word.endsWith(ending) && word.length > ending.length + 1) {
      return word.slice(0, word.length - ending.length)
    }
  }
  return word
}

// -----------------------------
// 5️⃣ 유사어 사전
// -----------------------------
const SYNONYM_MAP: Record<string, string[]> = {
  "사랑": ["애정", "자비", "은혜", "인애", "사모"],
  "하나님": ["하느님", "신", "창조주", "아버지", "천부"],
  "참부모": ["참아버지", "참어머니", "메시아", "구세주"],
  "축복": ["은혜", "복", "은총", "성복", "성혼"],
  "가정": ["가족", "가문", "혈통", "식구"],
  "진리": ["말씀", "도리", "원리", "섭리"],
  "천국": ["천상세계", "천주", "낙원", "에덴"],
  "믿음": ["신앙", "신뢰", "확신"],
  "기도": ["간구", "기원", "간청"],
  "생명": ["삶", "생존", "존재"],
  "평화": ["화평", "화목", "평안"],
  "구원": ["구속", "해방", "속량"],
  "창조": ["창제", "조성"],
  "섭리": ["뜻", "계획", "경륜"],
  "회복": ["복귀", "복원", "거듭남"],
  "죄": ["죄악", "범죄", "타락"],
  "타락": ["죄", "범죄", "부패"],
  "혈통": ["핏줄", "혈맥", "계통"],
  "말씀": ["교훈", "진리", "가르침"],
  "심정": ["마음", "정", "감정"],
  "인류": ["사람", "인간"],
  "천지": ["우주", "만물", "천하"],
  "참사랑": ["진정한 사랑"],
  "효도": ["효심", "공경", "효"],
  "충성": ["충심", "충직", "헌신"],
}

// 역방향 포함 전체 맵 — 모듈 로드 시 1회 빌드
const FULL_SYNONYM_MAP: Record<string, string[]> = { ...SYNONYM_MAP }
for (const [key, values] of Object.entries(SYNONYM_MAP)) {
  for (const val of values) {
    if (!FULL_SYNONYM_MAP[val]) FULL_SYNONYM_MAP[val] = []
    if (!FULL_SYNONYM_MAP[val].includes(key)) FULL_SYNONYM_MAP[val].push(key)
  }
}

export function getSynonyms(token: string): string[] {
  return FULL_SYNONYM_MAP[token] || []
}

// -----------------------------
// 6️⃣ 🚀 사전 빌드 인덱스 — 모듈 로드 시 1회만 실행
// -----------------------------
type WordIndex = {
  textLower: string
  sourceLower: string
  speakerLower: string
  textChosung: string
}

const wordIndex: WordIndex[] = allWords.map((w) => ({
  textLower: w.text.toLowerCase(),
  sourceLower: w.source.toLowerCase(),
  speakerLower: (w.speaker || "").toLowerCase(),
  textChosung: extractChosung(w.text),
}))

// -----------------------------
// 7️⃣ 하이라이트 범위 계산
// -----------------------------
export function getHighlightRanges(
  text: string,
  tokens: string[]
): Array<{ start: number; end: number }> {
  const ranges: Array<{ start: number; end: number }> = []
  const lowerText = text.toLowerCase()

  for (const token of tokens) {
    if (!token) continue
    const lowerToken = token.toLowerCase()
    let idx = 0
    while (idx < lowerText.length) {
      const found = lowerText.indexOf(lowerToken, idx)
      if (found === -1) break
      ranges.push({ start: found, end: found + token.length })
      idx = found + 1
    }
  }

  ranges.sort((a, b) => a.start - b.start)
  const merged: Array<{ start: number; end: number }> = []
  for (const r of ranges) {
    if (merged.length === 0 || merged[merged.length - 1].end < r.start) {
      merged.push({ ...r })
    } else {
      merged[merged.length - 1].end = Math.max(merged[merged.length - 1].end, r.end)
    }
  }
  return merged
}

// -----------------------------
// 8️⃣ 🚀 핵심 검색 (사전 인덱스 활용)
// -----------------------------
export function searchWordsAdvanced(
  query: string,
  mode: "text" | "source" = "text",
  type?: Word["type"]
): SearchResult[] {
  const rawQuery = query.trim()
  if (!rawQuery) return []

  const isExactPhrase = rawQuery.startsWith('"') && rawQuery.endsWith('"')
  const phrase = isExactPhrase ? rawQuery.slice(1, -1).toLowerCase().trim() : null
  const isChosung = !isExactPhrase && /^[ㄱ-ㅎ]+$/.test(rawQuery)
  const tokens = isExactPhrase ? [phrase!] : rawQuery.toLowerCase().split(/\s+/).filter(Boolean)

  // 토큰 메타 — 루프 밖에서 1회 계산
  const tokenMeta = tokens.map((token) => ({
    token,
    stem: stemKorean(token),
    synonyms: getSynonyms(token),
    tokenChosung: extractChosung(token),
  }))

  const results: SearchResult[] = []

  for (let i = 0; i < allWords.length; i++) {
    const word = allWords[i]
    if (type && word.type !== type) continue

    const ix = wordIndex[i] // 사전 빌드된 인덱스 사용

    // 초성 전용 모드
    if (isChosung) {
      if (ix.textChosung.includes(rawQuery)) {
        results.push({ word, score: 60, matchType: "chosung" })
      }
      continue
    }

    let totalScore = 0
    let bestMatchType: SearchResult["matchType"] = "token"
    let allTokensMatched = true

    for (const { token, stem, synonyms, tokenChosung } of tokenMeta) {
      let tokenScore = 0
      let tokenMatched = false

      const target = mode === "text" ? ix.textLower : `${ix.sourceLower} ${ix.speakerLower}`

      if (target === token) { tokenScore = 200; tokenMatched = true; bestMatchType = "exact" }
      else if (target.startsWith(token)) { tokenScore = 100; tokenMatched = true; bestMatchType = "phrase" }
      else if (target.includes(token)) { tokenScore = 40; tokenMatched = true }

      if (!tokenMatched && stem.length >= 2 && target.includes(stem)) {
        tokenScore = 25; tokenMatched = true; bestMatchType = "stem"
      }

      if (!tokenMatched) {
        for (const syn of synonyms) {
          if (target.includes(syn)) { tokenScore = 15; tokenMatched = true; bestMatchType = "synonym"; break }
        }
      }

      if (!tokenMatched && tokenChosung.length >= 2 && ix.textChosung.includes(tokenChosung)) {
        tokenScore = 10; tokenMatched = true; bestMatchType = "chosung"
      }

      if (!tokenMatched) { allTokensMatched = false; break }

      totalScore += tokenScore
      if (mode === "text") {
        if (ix.sourceLower.includes(token)) totalScore += 8
        if (ix.speakerLower.includes(token)) totalScore += 5
      }
    }

    if (!allTokensMatched) continue

    totalScore *= (1 + Math.max(0, 1 - word.text.length / 2000) * 0.2)

    results.push({
      word,
      score: totalScore,
      matchType: bestMatchType,
      highlightRanges: getHighlightRanges(word.text, tokens),
    })
  }

  results.sort((a, b) => b.score - a.score)
  return results
}

// -----------------------------
// 9️⃣ 기존 API 호환 래퍼
// -----------------------------
export function getAllWords(): Word[] { return allWords }

export function getRandomWord(): Word {
  return allWords[Math.floor(Math.random() * allWords.length)]
}

export function getRandomWordExcept(except?: number | number[] | null): Word {
  if (allWords.length === 0) throw new Error("words 목록이 비어 있습니다.")
  const excludedIds = new Set(
    Array.isArray(except) ? except : typeof except === "number" ? [except] : []
  )
  const candidates = allWords.filter((w) => !excludedIds.has(w.id))
  return candidates.length === 0
    ? getRandomWord()
    : candidates[Math.floor(Math.random() * candidates.length)]
}

export function getDailyWord(): Word {
  const today = new Date().toISOString().slice(0, 10)
  let hash = 0
  for (let i = 0; i < today.length; i++) hash = today.charCodeAt(i) + ((hash << 5) - hash)
  return allWords[Math.abs(hash) % allWords.length]
}

export function getWordStats(): WordStats {
  const byCategory: { [key: string]: number } = {}
  allWords.forEach((w) => { byCategory[w.category] = (byCategory[w.category] || 0) + 1 })
  return { total: allWords.length, byCategory }
}

export function searchWords(query: string, type?: "general" | "cheonseong" | "wonli"): Word[] {
  return searchWordsAdvanced(query, "text", type).map((r) => r.word)
}

export function searchWordsPaged(
  query: string, page: number, pageSize: number,
  type?: "general" | "cheonseong" | "wonli"
): Word[] {
  const results = searchWords(query, type)
  return results.slice((page - 1) * pageSize, page * pageSize)
}

export function getCategoryWords(category: string): Word[] {
  return allWords.filter((w) => w.category === decodeURIComponent(category))
}

export function getGeneralWords(): Word[] { return allWords.filter((w) => w.type === "general") }
export function getCheonseongWords(): Word[] { return allWords.filter((w) => w.type === "cheonseong") }
export function getWonliWords(): Word[] { return allWords.filter((w) => w.type === "wonli") }