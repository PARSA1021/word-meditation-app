// lib/words.ts

import wordsData from "@/data/words.json"
import cheonseongData from "@/data/cheonseong_words.json"
import wonliData from "@/data/wonligangnon_words.json"
import pyeonghwashinkyungData from "@/data/pyeonghwashinkyung_words.json"
// 경로가 @/인지 @인지 확인 필요 (보통 @/data/가 표준입니다)
import CheonIlGukDdeutgilData from "@/data/Cheon Il Guk_ddeutgil_words.json"

// -----------------------------
// 1️⃣ 타입 정의
// -----------------------------
export type WordType = "general" | "cheonseong" | "wonli" | "pyeonghwashinkyung" | "Cheon Il Guk_ddeutgil"

export type Word = {
  id: number
  text: string
  source: string
  category: string
  speaker?: string | null
  type: WordType
}

export type WordStats = {
  total: number
  byCategory: Record<string, number>
}

export type SearchResult = {
  word: Word
  score: number
  matchType: "exact" | "phrase" | "token" | "stem" | "chosung" | "synonym"
  highlightRanges?: Array<{ start: number; end: number }>
}

// -----------------------------
// 2️⃣ 데이터 합치기 (id 중복 방지 및 초기화)
// -----------------------------
export const allWords: Word[] = [
  ...wordsData.map((w) => ({ ...w, type: "general" } as Word)),
  ...cheonseongData.map((w, i) => ({ ...w, type: "cheonseong", id: 10000 + i } as Word)),
  ...wonliData.map((w, i) => ({ ...w, type: "wonli", id: 20000 + i } as Word)),
  ...pyeonghwashinkyungData.map((w, i) => ({ ...w, type: "pyeonghwashinkyung", id: 30000 + i } as Word)),
  ...CheonIlGukDdeutgilData.map((w, i) => ({ ...w, type: "Cheon Il Guk_ddeutgil", id: 40000 + i } as Word))
]

// -----------------------------
// 3️⃣ 한글 처리 유틸리티 (초성 및 어근)
// -----------------------------
const CHOSUNG = ["ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"]

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

const VERB_ENDINGS = [
  "하였습니다", "하였다", "하겠습니다", "하겠다", "합니다", "한다", "해야", "하여", "하는", "하고",
  "하지", "하면", "하니", "하여서", "하니라", "하리라", "하였으니", "하였으며", "하였고",
  "입니다", "이다", "이라", "이며", "이고", "이니", "이면", "으로", "로서", "에서", "에게",
  "습니다", "ㅂ니다", "았다", "었다", "겠다", "리라", "니라",
  "되었습니다", "됩니다", "된다", "되어", "되니", "되고", "되면",
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
// 4️⃣ 유의어 사전 (최적화)
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

const FULL_SYNONYM_MAP: Record<string, string[]> = { ...SYNONYM_MAP }
Object.entries(SYNONYM_MAP).forEach(([key, values]) => {
  values.forEach(val => {
    if (!FULL_SYNONYM_MAP[val]) FULL_SYNONYM_MAP[val] = []
    if (!FULL_SYNONYM_MAP[val].includes(key)) FULL_SYNONYM_MAP[val].push(key)
  })
})

export function getSynonyms(token: string): string[] {
  return FULL_SYNONYM_MAP[token] || []
}

// -----------------------------
// 5️⃣ 사전 빌드 인덱스
// -----------------------------
type WordIndex = {
  textLower: string
  sourceLower: string
  speakerLower: string
  textChosung: string
}

const wordIndex: WordIndex[] = allWords.map((w) => ({
  textLower: w.text.toLowerCase().replace(/\s+/g, ""), // 공백 제거 검색 대응
  sourceLower: w.source.toLowerCase(),
  speakerLower: (w.speaker || "").toLowerCase(),
  textChosung: extractChosung(w.text).replace(/\s+/g, ""),
}))

// -----------------------------
// 6️⃣ 하이라이트 범위 계산
// -----------------------------
export function getHighlightRanges(
  text: string,
  tokens: string[]
): Array<{ start: number; end: number }> {
  const ranges: Array<{ start: number; end: number }> = []
  const lowerText = text.toLowerCase()

  tokens.forEach(token => {
    if (!token) return
    const lowerToken = token.toLowerCase()
    let idx = lowerText.indexOf(lowerToken)
    while (idx !== -1) {
      ranges.push({ start: idx, end: idx + token.length })
      idx = lowerText.indexOf(lowerToken, idx + 1)
    }
  })

  return ranges
    .sort((a, b) => a.start - b.start)
    .reduce((acc, curr) => {
      if (acc.length === 0 || acc[acc.length - 1].end < curr.start) {
        acc.push(curr)
      } else {
        acc[acc.length - 1].end = Math.max(acc[acc.length - 1].end, curr.end)
      }
      return acc
    }, [] as Array<{ start: number; end: number }>)
}

// -----------------------------
// 7️⃣ 핵심 검색 (Advanced)
// -----------------------------
export function searchWordsAdvanced(
  query: string,
  mode: "text" | "source" = "text",
  type?: WordType
): SearchResult[] {
  const rawQuery = query.trim()
  if (!rawQuery) return []

  const isExactPhrase = rawQuery.startsWith('"') && rawQuery.endsWith('"')
  const phrase = isExactPhrase ? rawQuery.slice(1, -1).toLowerCase().trim() : null
  const isChosungSearch = !isExactPhrase && /^[ㄱ-ㅎ]+$/.test(rawQuery)
  const tokens = isExactPhrase ? [phrase!] : rawQuery.toLowerCase().split(/\s+/).filter(Boolean)

  const tokenMeta = tokens.map((token) => ({
    token,
    tokenNoSpace: token.replace(/\s+/g, ""),
    stem: stemKorean(token),
    synonyms: getSynonyms(token),
    tokenChosung: extractChosung(token).replace(/\s+/g, ""),
  }))

  const results: SearchResult[] = []

  for (let i = 0; i < allWords.length; i++) {
    const word = allWords[i]
    if (type && word.type !== type) continue

    const ix = wordIndex[i]
    const originalTextLower = word.text.toLowerCase()

    if (isChosungSearch) {
      if (ix.textChosung.includes(rawQuery)) {
        results.push({ word, score: 60, matchType: "chosung" })
      }
      continue
    }

    let totalScore = 0
    let bestMatchType: SearchResult["matchType"] = "token"
    let allTokensMatched = true
    const highlightTokens: string[] = []

    for (const { token, tokenNoSpace, stem, synonyms, tokenChosung } of tokenMeta) {
      let tokenScore = 0
      let tokenMatched = false

      const target = mode === "text" ? ix.textLower : `${ix.sourceLower} ${ix.speakerLower}`
      const originalTarget = mode === "text" ? originalTextLower : `${ix.sourceLower} ${ix.speakerLower}`

      // 1. 정확히 일치
      if (originalTarget.includes(token)) {
        tokenScore = originalTarget === token ? 200 : 40
        tokenMatched = true
        highlightTokens.push(token)
      } 
      // 2. 공백 무시 일치
      else if (target.includes(tokenNoSpace)) {
        tokenScore = 30
        tokenMatched = true
      }
      // 3. 어근 일치
      if (!tokenMatched && stem.length >= 2 && originalTarget.includes(stem)) {
        tokenScore = 25; tokenMatched = true; bestMatchType = "stem"
        highlightTokens.push(stem)
      }
      // 4. 유의어 일치
      if (!tokenMatched) {
        for (const syn of synonyms) {
          if (originalTarget.includes(syn)) {
            tokenScore = 15; tokenMatched = true; bestMatchType = "synonym"
            highlightTokens.push(syn)
            break
          }
        }
      }
      // 5. 부분 초성 일치
      if (!tokenMatched && tokenChosung.length >= 2 && ix.textChosung.includes(tokenChosung)) {
        tokenScore = 10; tokenMatched = true; bestMatchType = "chosung"
      }

      if (!tokenMatched) { allTokensMatched = false; break }
      totalScore += tokenScore
    }

    if (!allTokensMatched) continue

    // 점수 보정: 짧은 문장 우선 및 출처 점수
    totalScore *= (1 + Math.max(0, 1 - word.text.length / 2000) * 0.2)
    if (mode === "text") {
      tokens.forEach(t => {
        if (ix.sourceLower.includes(t)) totalScore += 8
        if (ix.speakerLower.includes(t)) totalScore += 5
      })
    }

    results.push({
      word,
      score: totalScore,
      matchType: bestMatchType,
      highlightRanges: getHighlightRanges(word.text, highlightTokens.length > 0 ? highlightTokens : tokens),
    })
  }

  return results.sort((a, b) => b.score - a.score)
}

// -----------------------------
// 8️⃣ 유틸리티 및 API (호환성 유지)
// -----------------------------
export const getAllWords = () => allWords
export const getRandomWord = () => allWords[Math.floor(Math.random() * allWords.length)]

export function getRandomWordExcept(except?: number | number[] | null): Word {
  const excludedIds = new Set(Array.isArray(except) ? except : except ? [except] : [])
  const candidates = allWords.filter((w) => !excludedIds.has(w.id))
  return candidates.length > 0 ? candidates[Math.floor(Math.random() * candidates.length)] : getRandomWord()
}

export function getDailyWord(): Word {
  const today = new Date().toISOString().slice(0, 10)
  const hash = today.split("").reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0)
  return allWords[Math.abs(hash) % allWords.length]
}

export function getWordStats(): WordStats {
  const byCategory = allWords.reduce((acc, w) => {
    acc[w.category] = (acc[w.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  return { total: allWords.length, byCategory }
}

export const searchWords = (query: string, type?: WordType) => 
  searchWordsAdvanced(query, "text", type).map((r) => r.word)

export const searchWordsPaged = (query: string, page: number, pageSize: number, type?: WordType) => 
  searchWords(query, type).slice((page - 1) * pageSize, page * pageSize)

export const getCategoryWords = (category: string) => 
  allWords.filter((w) => w.category === decodeURIComponent(category))

export const getWordsByType = (type: WordType) => allWords.filter((w) => w.type === type)