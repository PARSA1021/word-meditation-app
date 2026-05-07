import { Synonym, SynonymMap, MatchType } from '../types/word'

// -----------------------------
// 1️⃣ Constants & Types
// -----------------------------
const CHOSUNG = ["ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"]

const KOREAN_PARTICLES = [
  "께로부터", "으로부터", "에서부터", "께서", "에서", "에게", "으로", "이나", "이랑", "까지", "부터", "마다", "보다",
  "은", "는", "이", "가", "을", "를", "에", "와", "과", "도", "만", "로", "의"
].sort((a, b) => b.length - a.length)

const VERB_ENDINGS = [
  "하였습니다", "하였다", "하겠습니다", "하겠다", "합니다", "한다", "해야", "하여", "하는", "하고",
  "하지", "하면", "하니", "하여서", "하니라", "하리라", "하였으니", "하였으며", "하였고",
  "입니다", "이다", "이라", "이며", "이고", "이니", "이면", "으로서", "로서", "습니다", "ㅂ니다", 
  "았다", "었다", "겠다", "리라", "니라", "은가", "는가",
  "되었습니다", "됩니다", "된다", "되어", "되니", "되고", "되면",
  "하다", "한다", "했다", "이다", "이라", "이며", "이고"
].sort((a, b) => b.length - a.length)

// -----------------------------
// 2️⃣ Normalization & Utilities
// -----------------------------

const normalizeCache = new Map<string, string>()

/**
 * 텍스트 정규화: NFC, 소문자화, 특수문자 제거, 공백 통합
 */
export function normalizeText(text: string): string {
  if (normalizeCache.has(text)) return normalizeCache.get(text)!

  const normalized = text
    .normalize("NFC")
    .toLowerCase()
    .replace(/[_\-]/g, " ") // underscore/hyphen 통합
    .replace(/[^\w\s가-힣ㄱ-ㅎ]/g, "") // 특수문자 제거 (알파벳, 숫자, 한글, 초성 제외)
    .replace(/\s+/g, " ") // 다중 공백 제거
    .trim()

  normalizeCache.set(text, normalized)
  return normalized
}

/**
 * 한국어 조사 제거
 */
export function removeKoreanParticles(word: string): string {
  // 너무 짧은 단어는 조사 제거 대상에서 제외 (보호)
  if (word.length <= 1) return word

  for (const particle of KOREAN_PARTICLES) {
    if (word.endsWith(particle) && word.length > particle.length) {
      // "하나님" 같은 경우 "하나님께서"에서 "께서"를 떼어냄
      return word.slice(0, -particle.length)
    }
  }
  return word
}

/**
 * 언어 감지
 */
export function hasHangul(text: string): boolean {
  return /[\uAC00-\uD7A3\u1100-\u11FF\u3130-\u318F]/.test(text)
}

/**
 * 초성 추출 (캐싱 지원)
 */
const chosungCache = new Map<string, string>()

export function extractChosung(text: string): string {
  if (chosungCache.has(text)) return chosungCache.get(text)!

  let result = ""
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i)
    if (code >= 0xAC00 && code <= 0xD7A3) {
      result += CHOSUNG[Math.floor((code - 0xAC00) / 28 / 21)]
    } else {
      result += text[i]
    }
  }

  chosungCache.set(text, result)
  return result
}

// -----------------------------
// 3️⃣ Tokenization & Pipeline
// -----------------------------

/**
 * 텍스트 토큰화
 */
export function tokenize(text: string): string[] {
  const normalized = normalizeText(text)
  return normalized.split(" ").filter(Boolean)
}

/**
 * 한국어 스테밍 (어미 제거)
 */
export function stemKorean(word: string): string {
  for (const ending of VERB_ENDINGS) {
    if (word.endsWith(ending) && word.length > ending.length + 1) {
      return word.slice(0, -ending.length)
    }
  }
  return word
}

/**
 * 영어 스테밍 (기본형 추출)
 */
export function stemEnglish(word: string): string {
  let s = word.toLowerCase().trim()
  if (s.length < 3) return s

  // plurals
  if (s.endsWith("ies")) s = s.slice(0, -3) + "y"
  else if (s.endsWith("es") && s.length > 3) s = s.slice(0, -2)
  else if (s.endsWith("s") && !s.endsWith("ss")) s = s.slice(0, -1)

  // ed / ing
  let wasIngOrEd = false
  if (s.endsWith("ed") && s.length > 3) {
    s = s.slice(0, -2)
    wasIngOrEd = true
  } else if (s.endsWith("ing") && s.length > 4) {
    s = s.slice(0, -3)
    wasIngOrEd = true
  }

  // e 복원 (love → loving, move → moving 등)
  if (wasIngOrEd && !/([bcdfghjklmnpqrstvwxyz])\1$/.test(s) && !s.endsWith("e")) {
    s += "e"
  }

  return s
}

/**
 * 단어 전처리 파이프라인
 */
export function preprocessWord(word: string): string {
  const normalized = normalizeText(word)
  if (hasHangul(normalized)) {
    const withoutParticles = removeKoreanParticles(normalized)
    return stemKorean(withoutParticles)
  } else {
    return stemEnglish(normalized)
  }
}

// -----------------------------
// 4️⃣ Synonym System (Weighted)
// -----------------------------

const RAW_SYNONYMS: Record<string, string[]> = {
  "사랑": ["애정", "자비", "은혜", "인애", "사모"],
  "하나님": ["하느님", "창조주", "아버지", "천부"],
  "참부모": ["참아버지", "참어머니", "메시아", "구세주"],
  "참사랑": ["진정한 사랑", "절대사랑"],
  "본질": ["근본", "본성", "정수"],
  "말씀": ["교리", "가르침", "성언"],
  "평화": ["안식", "화평", "조화"],
  "행복": ["기쁨", "환희", "축복"],
  "훈독": ["낭독", "공부", "학습"],
  "정성": ["정성", "기도", "헌신"],
  "god": ["creator", "deity", "lord"],
  "love": ["affection", "compassion", "grace", "benevolence"],
  "parent": ["father", "mother"],
  "parents": ["true parents"],
  "spirit": ["soul"],
  "mind": ["heart"],
  "heart": ["mind"],
  "body": ["physical", "form"],
  "visible": ["corporeal", "physical"],
  "incorporeal": ["invisible", "formless"],
  "heaven": ["paradise", "kingdom"],
  "blessing": ["grace"],
  "true": ["genuine", "original"],
  "faith": ["belief", "trust"],
}

const FULL_SYNONYM_MAP: SynonymMap = {}

// 양방향 및 가중치 기반 사전 구축
Object.entries(RAW_SYNONYMS).forEach(([key, values]) => {
  const mainWord = key.toLowerCase()
  if (!FULL_SYNONYM_MAP[mainWord]) FULL_SYNONYM_MAP[mainWord] = []

  values.forEach(val => {
    const synWord = val.toLowerCase()
    
    // 메인 단어 -> 유의어 (가중치 0.9)
    FULL_SYNONYM_MAP[mainWord].push({ word: synWord, weight: 0.9 })
    
    // 유의어 -> 메인 단어 (가중치 0.8)
    if (!FULL_SYNONYM_MAP[synWord]) FULL_SYNONYM_MAP[synWord] = []
    if (!FULL_SYNONYM_MAP[synWord].find(s => s.word === mainWord)) {
      FULL_SYNONYM_MAP[synWord].push({ word: mainWord, weight: 0.8 })
    }
  })
})

export function getSynonyms(token: string): Synonym[] {
  const lowerToken = token.toLowerCase()
  return FULL_SYNONYM_MAP[lowerToken] || []
}

// -----------------------------
// 5️⃣ Scoring & Highlighting
// -----------------------------

/**
 * 검색 점수 계산
 */
export function calculateSearchScore(
  matchType: MatchType,
  synonymWeight: number = 1.0,
  isExact: boolean = false
): number {
  const weights: Record<MatchType, number> = {
    exact: 1.0,
    phrase: 0.95,
    token: 0.85,
    stem: 0.75,
    synonym: 0.65 * synonymWeight,
    chosung: 0.5,
    partial: 0.3
  }

  let score = weights[matchType]
  if (isExact) score *= 1.2 // 완전 일치 가산점

  return score
}

/**
 * 정규표현식 이스케이프
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * 하이라이트 범위 계산 (Regex 기반 Whole Word Matching)
 */
export function getHighlightRanges(
  text: string,
  tokens: string[]
): Array<{ start: number; end: number }> {
  const ranges: Array<{ start: number; end: number }> = []
  
  tokens.forEach(token => {
    if (!token) return
    
    const escapedToken = escapeRegExp(token)
    // 한글인 경우 boundary(\b)가 제대로 작동하지 않으므로 주의
    // 영어인 경우에만 \b 적용하거나, 전체적으로 유연하게 적용
    const isKorean = hasHangul(token)
    const pattern = isKorean 
      ? escapedToken 
      : `\\b${escapedToken}\\b`
      
    const regex = new RegExp(pattern, "gi")
    let match
    
    while ((match = regex.exec(text)) !== null) {
      ranges.push({ start: match.index, end: match.index + match[0].length })
    }
  })

  // 중첩 범위 통합
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
