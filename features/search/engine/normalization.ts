// features/search/engine/normalization.ts
const CHOSUNG = ["ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"]
const normalizeCache = new Map<string, string>()
const chosungCache = new Map<string, string>()

/**
 * 텍스트 정규화: NFC, 소문자화, 특수문자 제거, 공백 통합
 */
export function normalizeText(text: string): string {
  if (normalizeCache.has(text)) return normalizeCache.get(text)!

  const normalized = text
    .normalize("NFC")
    .toLowerCase()
    .replace(/[_\-]/g, " ")
    .replace(/[^\w\s가-힣ㄱ-ㅎ]/g, "")
    .replace(/\s+/g, " ")
    .trim()

  normalizeCache.set(text, normalized)
  return normalized
}

/**
 * 초성 추출 (캐싱 지원)
 */
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
