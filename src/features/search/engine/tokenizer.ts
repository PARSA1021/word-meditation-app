// features/search/engine/tokenizer.ts
import { normalizeText } from "./normalization"
import { removeKoreanParticles, stemKorean, stemEnglish } from "./stemming"

export function hasHangul(text: string): boolean {
  return /[\uAC00-\uD7A3\u1100-\u11FF\u3130-\u318F]/.test(text)
}

export function tokenize(text: string): string[] {
  const normalized = normalizeText(text)
  return normalized.split(" ").filter(Boolean)
}

export function preprocessWord(word: string): string {
  const normalized = normalizeText(word)
  if (hasHangul(normalized)) {
    const withoutParticles = removeKoreanParticles(normalized)
    return stemKorean(withoutParticles)
  } else {
    return stemEnglish(normalized)
  }
}

/**
 * 한국어 단어 경계 정규식 패턴 생성
 */
export function buildKoreanWordPattern(token: string): RegExp {
  const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const lookbehind = "(?<![가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9])"
  const lookahead = "(?![가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9])"
  return new RegExp(`${lookbehind}${escaped}${lookahead}`, "gi")
}

/**
 * 텍스트 내 token이 독립 단어로 존재하는지 확인 (한국어 경계 적용)
 */
export function matchesAsWord(text: string, token: string): boolean {
  if (!token) return false
  if (hasHangul(token)) {
    return buildKoreanWordPattern(token).test(text)
  } else {
    const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    return new RegExp(`\\b${escaped}\\b`, "i").test(text)
  }
}

/**
 * 단어를 글자(음절) 단위와 형태소로 분리하여 서브 토큰을 생성합니다. (연관 단어 검색 용도)
 */
export function generateSubTokens(text: string): string[] {
  const normalized = normalizeText(text)
  const words = normalized.split(/\s+/).filter(Boolean)
  const subTokens = new Set<string>()

  for (const word of words) {
    if (word.length === 1) {
      subTokens.add(word)
    } else if (hasHangul(word)) {
      subTokens.add(word)
      for (let i = 0; i < word.length; i++) {
        subTokens.add(word[i])
      }
    } else {
      subTokens.add(word)
    }
  }

  return Array.from(subTokens)
}