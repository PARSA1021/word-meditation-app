// features/search/engine/highlight.ts
import { hasHangul } from "./tokenizer"

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function getHighlightRanges(
  text: string,
  tokens: string[]
): Array<{ start: number; end: number }> {
  const ranges: Array<{ start: number; end: number }> = []
  
  tokens.forEach(token => {
    if (!token) return
    const escapedToken = escapeRegExp(token)
    const isKorean = hasHangul(token)
    const pattern = isKorean ? escapedToken : `\\b${escapedToken}\\b`
    const regex = new RegExp(pattern, "gi")
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
