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
 *
 * 한국어는 \b word boundary가 없으므로 직접 경계 조건을 구성합니다.
 * 앞뒤가 공백/문자열 시작·끝이거나, 한글/영문/숫자의 경계인 경우에만 매칭합니다.
 *
 * 예) "기적" 검색 시 "이기적"에 매칭되지 않음
 */
export function buildKoreanWordPattern(token: string): RegExp {
  const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

  // 앞 경계: 문자열 시작 또는 공백/구두점/숫자/영문자 뒤
  const lookbehind = "(?<![가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9])"
  // 뒤 경계: 문자열 끝 또는 공백/구두점/숫자/영문자 앞
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