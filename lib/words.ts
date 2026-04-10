// lib/words.ts

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
// 2️⃣ 한글 처리 유틸리티 (Shared)
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
// 3️⃣ 유의어 사전 (Shared)
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
// 4️⃣ 하이라이트 범위 계산 (Shared)
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