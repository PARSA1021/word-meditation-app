// features/search/engine/highlight.ts
import { hasHangul, buildKoreanWordPattern } from "./tokenizer"

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

export function getHighlightRanges(
  text: string,
  tokens: string[]
): Array<{ start: number; end: number }> {
  const ranges: Array<{ start: number; end: number }> = []

  tokens.forEach(token => {
    if (!token) return

    // 단순 전역 정규식으로 매칭된 토큰을 하이라이트 (부분 일치 및 어간 포함)
    const regex = new RegExp(escapeRegExp(token), "gi")

    let match
    while ((match = regex.exec(text)) !== null) {
      ranges.push({ start: match.index, end: match.index + match[0].length })
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