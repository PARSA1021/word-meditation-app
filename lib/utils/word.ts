// lib/utils/word.ts

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

// 영어 전용 스테밍 (Whole-Word Matching과 함께 정확도 대폭 ↑)
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

// 언어 감지
export function hasHangul(text: string): boolean {
  return /[\uAC00-\uD7A3\u1100-\u11FF\u3130-\u318F]/.test(text)
}

export function stemWord(word: string): string {
  return hasHangul(word) ? stemKorean(word) : stemEnglish(word)
}

// -----------------------------
// 3️⃣ 유의어 사전 (영어 용어 대폭 추가)
// -----------------------------
const SYNONYM_MAP: Record<string, string[]> = {
  // 기존 한국어 (변경 없음)
  "사랑": ["애정", "자비", "은혜", "인애", "사모"],
  "하나님": ["하느님", "창조주", "아버지", "천부"],
  "참부모": ["참아버지", "참어머니", "메시아", "구세주"],
  // ... (기존 내용 그대로 유지)

  // === 영어 동의어 추가 (Cheon Seong Gyeong 영어 데이터에 최적화) ===
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

const FULL_SYNONYM_MAP: Record<string, string[]> = { ...SYNONYM_MAP }
Object.entries(SYNONYM_MAP).forEach(([key, values]) => {
  values.forEach(val => {
    if (!FULL_SYNONYM_MAP[val]) FULL_SYNONYM_MAP[val] = []
    if (!FULL_SYNONYM_MAP[val].includes(key)) FULL_SYNONYM_MAP[val].push(key)
  })
})

export function getSynonyms(token: string): string[] {
  const lowerToken = token.toLowerCase()
  return (FULL_SYNONYM_MAP[lowerToken] || []).filter(syn => syn.length >= 2)
}

// -----------------------------
// 4️⃣ 하이라이트 범위 계산 (변경 없음)
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
