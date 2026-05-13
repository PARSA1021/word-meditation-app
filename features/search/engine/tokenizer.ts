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
